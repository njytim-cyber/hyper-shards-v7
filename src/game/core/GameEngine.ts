import { audioSystem } from '../systems/AudioSystem';
import { spriteCache } from '../systems/SpriteCache';
import { persistence } from '../systems/Persistence';
import { inputSystem } from '../systems/InputSystem';
import { tutorialSystem } from '../systems/TutorialSystem';
import { assistPilot } from '../systems/AssistPilot';
import { showPilotDialogue } from '../../components/ui/DialogueDisplay';
import { getDialogue } from '../config/PilotDialogueConfig';
import { PILOT_CLASSES, type PilotId } from '../config/PilotConfig';
import { Pool } from './Pool';
import { SpatialGrid } from './SpatialGrid';
import { Ship } from '../entities/Ship';
import { Asteroid } from '../entities/Asteroid';
import { Bullet } from '../entities/Bullet';
import { Particle } from '../entities/Particle';
import { FloatingText } from '../entities/FloatingText';
import { PowerUp } from '../entities/PowerUp';
import { Boss } from '../entities/Boss';
import { SKIN_CONFIG } from '../config/ShopConfig';
import { getBossForWave, MAX_WAVES } from '../config/BossConfig';

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

interface UICallbacks {
    onScoreUpdate: (score: number) => void;
    onWaveUpdate: (wave: number, subText: string, hintText: string, isBoss: boolean) => void;
    onLivesUpdate: (lives: number, shields: number) => void;
    onWeaponUpdate: (weapon: string) => void;
    onComboUpdate: (combo: number, val: number) => void;
    onGameOver: (score: number, highScore: number, isNewHighScore: boolean) => void;
    onVictory?: (score: number, highScore: number) => void;
    onGameStart: () => void;
    onPause: (isPaused: boolean) => void;
}

export class GameEngine {
    public canvas: HTMLCanvasElement | null = null;
    public ctx: CanvasRenderingContext2D | null = null;
    public ship: Ship | null = null;
    public boss: Boss | null = null;
    public bullets: Bullet[] = [];
    public asteroids: Asteroid[] = [];
    public particles: Particle[] = [];
    public floatingTexts: FloatingText[] = [];
    public powerups: PowerUp[] = [];
    public score: number = 0;
    public gameState: GameState = 'START';
    public tutorialSystem = tutorialSystem;

    public lives: number = 3;
    public wave: number = 1;
    public combo: number = 1;
    public comboTimer: number = 0;

    private lastTime: number = 0;

    private interestTimer: number = 0;
    private regenTimer: number = 0;
    private hasRevived: boolean = false;

    private bulletPool: Pool<Bullet>;
    private particlePool: Pool<Particle>;
    private textPool: Pool<FloatingText>;
    private spatialGrid: SpatialGrid<{ x: number; y: number; radius: number; ref: Asteroid }>; // Wrapper for grid queries

    private uiCallbacks: UICallbacks | null = null;

    // Funny texts
    private funnyWaveIntros = ["INITIALIZING SYSTEMS...", "HYPERSPACE ENGAGED", "ASTEROID FIELD AHEAD", "DON'T BLINK", "STAY SHARP PILOT", "MORE ROCKS? REALLY?", "CLEAN UP ON AISLE 5", "THEY SEE ME ROLLIN'", "WATCH YOUR SIX", "INCOMING SPACE TRASH", "PIZZA DELIVERY IS LATE"];
    private funnyBossIntros = ["WARNING: DREADNOUGHT DETECTED", "BOSS APPROACHING", "WARNING: BIG SHIP ENERGY", "OH NO, IT'S THE MANAGER", "GIANT ENEMY CRAB... WAIT", "PREPARE FOR TROUBLE", "LEVEL 9000 BOSS DETECTED", "IT'S BOSS O'CLOCK"];
    private hints = ["Tip: Use SHIFT to DASH.", "Tip: Heavy ammo pierces.", "Tip: Upgrades are permanent.", "Tip: Nukes clear screen.", "Tip: Collect SHARDS.", "Tip: Kill fast for combos."];

    constructor() {
        this.bulletPool = new Pool(() => new Bullet(), (b, x, y, a, t, d, p, s, h) => b.init(x, y, a, t, d, p, s, h));
        this.particlePool = new Pool(() => new Particle(), (p, x, y, c) => p.init(x, y, c));
        this.textPool = new Pool(() => new FloatingText(), (t, x, y, txt, c) => t.init(x, y, txt, c));
        // Initialize with a reasonable cell size (e.g., 100px)
        this.spatialGrid = new SpatialGrid(2000, 2000, 100);
    }

    public init(canvas: HTMLCanvasElement, callbacks: UICallbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.uiCallbacks = callbacks;

        spriteCache.init();
        audioSystem.init();
        persistence.load();
        tutorialSystem.init();

        // Listen for profile updates (e.g. skin change)
        window.addEventListener('profile-updated', ((e: CustomEvent<{ equippedSkin?: string }>) => {
            if (this.ship && e.detail && e.detail.equippedSkin) {
                const skinData = SKIN_CONFIG[e.detail.equippedSkin];
                if (skinData) {
                    this.ship.skin = skinData;
                }
            }
        }) as EventListener);

        // Input callbacks
        inputSystem.setCallbacks({
            onPause: () => this.togglePause(),
            onDash: () => {
                if (this.ship) this.ship.dash();
            },
            onSwap: () => {
                if (this.ship && this.gameState === 'PLAYING') {
                    this.ship.switchWeapon({
                        spawnBullet: this.spawnBullet.bind(this),
                        spawnParticle: this.spawnParticle.bind(this),
                        spawnText: this.spawnText.bind(this),
                        updateWeaponUI: (t) => this.uiCallbacks?.onWeaponUpdate(t),
                        updateHUD: this.updateHUD.bind(this),
                        gameOver: this.gameOver.bind(this)
                    });
                    if (tutorialSystem.active) tutorialSystem.checkSwap();
                }
            }
        });

        inputSystem.attachTouchListeners(canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start loop
        this.lastTime = 0;
        this.loop(0);
    }

    private resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    public startGame() {
        if (!this.canvas) return;

        this.score = 0;
        if ((persistence.profile.upgrades.start || 0) > 0) {
            this.wave = 4;
            this.score = 1000;
            persistence.addShards(50);
        } else {
            this.wave = 1;
        }

        // CRITICAL: Set gameState to 'PLAYING' so the game loop runs!
        this.gameState = 'PLAYING';

        this.ship = new Ship(this.bulletPool);

        // Apply current skin
        const skinKey = persistence.profile.equippedSkin || 'default';
        const skinData = SKIN_CONFIG[skinKey];
        if (skinData) this.ship.skin = skinData;

        this.lives = this.ship.maxLives;
        this.hasRevived = false;

        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        if (this.wave === 1) {
            // Reset ship with no invincibility for tutorial so it's always visible
            this.ship.reset(this.canvas.width, this.canvas.height, 0);
            tutorialSystem.start();
            this.uiCallbacks?.onWaveUpdate(1, "TUTORIAL", "Follow instructions", false);
            // Tutorial system will spawn asteroid when needed (at shoot step)
        } else {
            // Reset ship with normal invincibility
            this.ship.reset(this.canvas.width, this.canvas.height);
            this.spawnWave();
        }
    }

    public togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            audioSystem.pauseMusic();
            if (tutorialSystem.active) tutorialSystem.checkPause();
            this.uiCallbacks?.onPause(true);
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            audioSystem.resumeMusic();
            this.lastTime = 0; // Reset delta
            this.uiCallbacks?.onPause(false);
        }
    }

    public spawnTutorialAsteroid(x: number, y: number) {
        if (!this.canvas) return;
        const asteroid = new Asteroid(x, y, 'large', this.canvas.width, this.canvas.height);
        asteroid.vx = 0;
        asteroid.vy = 0;
        this.asteroids.push(asteroid);
    }

    public spawnWave() {
        if (!this.canvas) return;

        // Check if this is a boss wave using the config
        const bossConfig = getBossForWave(this.wave);
        const isBossWaveNow = bossConfig !== undefined;

        // Calculate asteroid count (no asteroids on boss waves)
        let count = 3 + Math.floor(this.wave * 0.8);
        count = Math.min(count, 15);
        if (this.wave <= 2) count = this.wave;
        else if (isBossWaveNow) count = 0;

        Asteroid.currentWave = this.wave;
        this.asteroids = [];
        for (let i = 0; i < count; i++) {
            this.asteroids.push(new Asteroid(undefined, undefined, 'large', this.canvas.width, this.canvas.height));
        }

        // Generate wave text
        let subText: string;
        let hintText: string;

        if (bossConfig) {
            // Boss wave - show boss name
            subText = bossConfig.isFinalBoss
                ? `FINAL BOSS: ${bossConfig.name}`
                : `BOSS: ${bossConfig.name}`;
            hintText = bossConfig.isFinalBoss
                ? "DEFEAT THE MOTHERSHIP!"
                : this.funnyBossIntros[Math.floor(Math.random() * this.funnyBossIntros.length)];
        } else {
            subText = this.funnyWaveIntros[Math.floor(Math.random() * this.funnyWaveIntros.length)];
            hintText = this.wave === 1 ? "Tip: Kill fast to build COMBO multiplier!" : this.hints[Math.floor(Math.random() * this.hints.length)];
        }

        // Spawn boss if this is a boss wave
        if (bossConfig) {
            this.boss = new Boss(bossConfig, this.wave, this.canvas.width);
            audioSystem.playAlarm();
            audioSystem.playMusic('boss');

            // Trigger assist pilot on wave 3 (first boss) automatically
            if (this.wave === 3) {
                const playerPilotId = (persistence.profile.selectedPilot || 'striker') as PilotId;
                this.activateAssistPilot(playerPilotId);
            }
        } else {
            this.boss = null;
            audioSystem.playMusic('wave');
        }

        // Show player pilot wave start dialogue
        const playerPilotId = (persistence.profile.selectedPilot || 'striker') as PilotId;
        const pilot = PILOT_CLASSES[playerPilotId];
        if (pilot) {
            const eventType = bossConfig ? 'bossAlert' : 'waveStart';
            const dialogue = getDialogue(playerPilotId, eventType);
            setTimeout(() => {
                showPilotDialogue(playerPilotId, dialogue, pilot.name, pilot.icon, pilot.color);
            }, 1500);  // Slight delay so it doesn't overlap with wave announcement
        }

        this.uiCallbacks?.onWaveUpdate(this.wave, subText, hintText, isBossWaveNow);
    }

    // Activate assist pilot
    private activateAssistPilot(playerPilotId: PilotId) {
        if (!this.canvas || !this.ship) return;

        assistPilot.activate(
            playerPilotId,
            this.canvas.width,
            this.canvas.height,
            {
                onDialogue: (pilotId, text, pilotName, icon, color) => {
                    showPilotDialogue(pilotId, text, pilotName, icon, color);
                },
                onAssistStart: () => {
                    // Could trigger UI update
                },
                onAssistEnd: () => {
                    // Assist ended
                },
                spawnBullet: (x, y, angle, type, damage) => {
                    const b = this.bulletPool.get(x, y, angle, type, damage, 1, 2, false);
                    this.bullets.push(b);
                }
            },
            15  // 15 second duration
        );
    }

    private loop(timestamp: number) {
        requestAnimationFrame(this.loop.bind(this));

        if (this.gameState !== 'PLAYING') return;
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
    }

    private update(dt: number) {
        if (!this.canvas || !this.ship) return;

        // Regen
        if ((persistence.profile.upgrades.regen || 0) > 0 && this.lives < this.ship.maxLives) {
            this.regenTimer += dt;
            if (this.regenTimer > 15) {
                this.lives++;
                this.regenTimer = 0;
                this.updateHUD();
                this.spawnText(this.ship.x, this.ship.y - 20, "REPAIR", "#0f0");
            }
        }

        // Interest
        if ((persistence.profile.upgrades.interest || 0) > 0) {
            this.interestTimer += dt;
            if (this.interestTimer > 5) {
                const income = persistence.profile.upgrades.interest * 2;
                persistence.addShards(income);
                this.interestTimer = 0;
                this.spawnText(this.ship.x, this.ship.y + 20, `+${income}`, "#0f0");
            }
        }

        // Combo
        if (this.combo > 1) {
            this.comboTimer -= dt;
            const maxTime = 2.5 + ((persistence.profile.upgrades.combo || 0) * 0.5);
            this.uiCallbacks?.onComboUpdate(this.combo, this.comboTimer / maxTime);
            if (this.comboTimer <= 0) {
                this.combo = 1;
                this.updateHUD();
            }
        }

        // Assist Pilot update
        if (assistPilot.active) {
            const enemyPositions = [
                ...this.asteroids.map(a => ({ x: a.x, y: a.y })),
                ...(this.boss ? [{ x: this.boss.x, y: this.boss.y }] : [])
            ];
            assistPilot.update(
                dt,
                this.ship.x,
                this.ship.y,
                this.canvas.width,
                this.canvas.height,
                enemyPositions
            );
        }

        // Entities
        this.ship.update(dt, inputSystem.keys, inputSystem.touchSticks, this.canvas.width, this.canvas.height, {
            spawnBullet: this.spawnBullet.bind(this),
            spawnParticle: this.spawnParticle.bind(this),
            spawnText: this.spawnText.bind(this),
            updateWeaponUI: (t) => this.uiCallbacks?.onWeaponUpdate(t),
            updateHUD: this.updateHUD.bind(this),
            gameOver: this.gameOver.bind(this)
        }, this.combo);

        if (tutorialSystem.active) {
            tutorialSystem.checkMove(this.ship.x, this.ship.y);
            tutorialSystem.checkRotate(this.ship.angle);
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt, this.asteroids);
            if (!b.active || b.x < 0 || b.x > this.canvas.width || b.y < 0 || b.y > this.canvas.height) {
                this.bulletPool.release(b);
                // Swap and Pop
                this.bullets[i] = this.bullets[this.bullets.length - 1];
                this.bullets.pop();
                // Since we iterate backwards, we don't need to decrement i?
                // Wait, if we swap the last element to position i, we have already processed the last element (since we go backwards).
                // So the swapped element HAS been processed.
                // So we don't need to re-process it.
                // Correct.
                continue;
            }
        }

        if (this.boss && !this.boss.dead) {
            this.boss.update(dt, {
                spawnBullet: (x, y, a, t, d) => {
                    const b = this.bulletPool.get(x, y, a, t, d, 1, 4, false);
                    this.bullets.push(b);
                },
                getPlayerPosition: () => ({
                    x: this.ship?.x || this.canvas!.width / 2,
                    y: this.ship?.y || this.canvas!.height / 2
                })
            }, this.wave);
        }

        // Check for wave completion
        if (!tutorialSystem.active && this.asteroids.length === 0 && (!this.boss || this.boss.dead)) {
            // Check if game is complete (wave 20 boss defeated)
            if (this.wave >= MAX_WAVES && this.boss?.dead) {
                this.victory();
                return;
            }
            this.wave++;
            this.spawnWave();
        }

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.update(dt, this.canvas.width, this.canvas.height);
            if (a.dead) {
                this.asteroids[i] = this.asteroids[this.asteroids.length - 1];
                this.asteroids.pop();
            }
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.update(dt, this.ship.x, this.ship.y, this.ship.dead);
            if (!p.active) {
                this.powerups[i] = this.powerups[this.powerups.length - 1];
                this.powerups.pop();
                continue;
            }
            const d = (p.x - this.ship.x) ** 2 + (p.y - this.ship.y) ** 2;
            if (d < (p.radius + this.ship.radius) ** 2) {
                p.active = false;
                audioSystem.playPowerUp();
                if (p.type === 'SHIELD') {
                    this.ship.shields++;
                    this.updateHUD();
                    this.spawnText(this.ship.x, this.ship.y - 20, "SHIELD", "#0ff");
                } else if (p.type === 'NUKE') {
                    this.asteroids.forEach(a => a.break(this.getGameCallbacks(), this.asteroids, this.combo));
                    if (this.boss) {
                        this.boss.hp -= 50;
                        if (this.boss.hp <= 0) {
                            this.boss.dead = true;
                            persistence.addShards(100);
                            audioSystem.playExplosion('large');
                            audioSystem.playMusic('wave');
                        }
                    }
                    audioSystem.playNuke();
                    this.spawnText(this.ship.x, this.ship.y - 20, "NUKE", "#f00");
                } else if (p.type === 'SPEED') {
                    this.ship.speedBoostTime = 10;
                    this.spawnText(this.ship.x, this.ship.y - 20, "SPEED UP", "#ff0");
                }
            }
        }

        // Collision Logic (Optimized with Spatial Grid)
        // 1. Clear and Populate Grid
        this.spatialGrid.clear();
        for (const a of this.asteroids) {
            // Asteroid needs to satisfy SpatialObject interface
            // Assuming Asteroid has x, y, r (radius)
            this.spatialGrid.insert({ x: a.x, y: a.y, radius: a.r, ref: a });
        }

        // 2. Bullets vs Enemies (Asteroids & Boss)
        for (const b of this.bullets) {
            if (!b.active) continue;

            if (b.isEnemy) {
                // Enemy bullets vs Ship
                if (this.ship.invincibleTime <= 0 && !this.ship.isDashing) {
                    const d = (b.x - this.ship.x) ** 2 + (b.y - this.ship.y) ** 2;
                    if (d < (b.radius + this.ship.radius) ** 2) {
                        b.active = false;
                        if (this.ship.hit({
                            spawnBullet: this.spawnBullet.bind(this),
                            spawnParticle: this.spawnParticle.bind(this),
                            spawnText: this.spawnText.bind(this),
                            updateWeaponUI: (t) => this.uiCallbacks?.onWeaponUpdate(t),
                            updateHUD: this.updateHUD.bind(this),
                            gameOver: this.gameOver.bind(this)
                        })) {
                            this.handlePlayerHit();
                        }
                    }
                }
            } else {
                // Player bullets vs Boss
                if (this.boss && !this.boss.dead) {
                    const d = (b.x - this.boss.x) ** 2 + (b.y - this.boss.y) ** 2;
                    if (d < 3600) { // Boss radius approx 60
                        this.boss.hp -= b.damage;
                        b.active = false;
                        if (this.boss.hp <= 0) {
                            this.boss.dead = true;
                            audioSystem.playExplosion('large');
                            persistence.addShards(50);
                            audioSystem.playMusic('wave');
                        }
                        continue;
                    }
                }

                // Player bullets vs Asteroids (Grid Query)
                this.spatialGrid.query(b.x, b.y, b.radius, (item) => {
                    if (!b.active) return; // Bullet might have died in previous callback
                    const a = item.ref;
                    // Double check distance (broad phase -> narrow phase)
                    const d = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
                    if (d < (a.r + b.radius) ** 2) {
                        a.hit(b.damage, b.vx, b.vy, this.getGameCallbacks(), this.asteroids, this.combo);
                        b.pierce--;
                        if (b.pierce <= 0) b.active = false;
                    }
                });
            }
        }

        // Particles & Texts
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (!p.active) {
                this.particlePool.release(p);
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            }
        }
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.update(dt);
            if (!t.active) {
                this.textPool.release(t);
                this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
                this.floatingTexts.pop();
            }
        }
    }

    private draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ship?.draw(this.ctx);
        assistPilot.draw(this.ctx);  // Draw assist pilot
        this.bullets.forEach(b => b.draw(this.ctx!));
        this.boss?.draw(this.ctx);
        this.asteroids.forEach(a => a.draw(this.ctx!));
        this.powerups.forEach(p => p.draw(this.ctx!));
        this.particles.forEach(p => p.draw(this.ctx!));
        this.floatingTexts.forEach(t => t.draw(this.ctx!));
    }

    private handlePlayerHit() {
        this.lives--;
        this.combo = 1;
        this.updateHUD();
        const invTime = 2.0 + ((persistence.profile.upgrades.shieldDur || 0) * 0.5);
        if (this.ship) {
            this.ship.reset(this.canvas!.width, this.canvas!.height, invTime);
        }
        audioSystem.playExplosion('large');

        // Nova Logic
        if ((persistence.profile.upgrades.nova || 0) > 0) {
            this.asteroids.forEach(a => {
                a.hp -= 5; // Massive damage
                if (a.hp <= 0) a.break(this.getGameCallbacks(), this.asteroids, this.combo);
            });
            if (this.boss) {
                this.boss.hp -= 50;
                if (this.boss.hp <= 0) {
                    this.boss.dead = true;
                    persistence.addShards(100);
                    audioSystem.playExplosion('large');
                    audioSystem.playMusic('wave');
                }
            }
            audioSystem.playNuke(); // Reuse Nuke sound
            this.spawnText(this.ship!.x, this.ship!.y - 40, "NOVA!", "#f00");
        }

        if (this.lives <= 0) this.gameOver();
    }

    private gameOver() {
        if ((persistence.profile.upgrades.revive || 0) > 0 && !this.hasRevived) {
            this.hasRevived = true;
            this.lives = this.ship!.maxLives;
            this.ship!.reset(this.canvas!.width, this.canvas!.height);
            this.ship!.invincibleTime = 3.0;
            this.updateHUD();
            audioSystem.playPowerUp();
            this.spawnText(this.ship!.x, this.ship!.y - 40, "SYSTEM RESTORED", "#0ff");
            return;
        }
        this.gameState = 'GAMEOVER';
        audioSystem.playMusic('load');

        let isNewHighScore = false;
        if (this.score > persistence.profile.highScore) {
            persistence.profile.highScore = this.score;
            isNewHighScore = true;
        }
        if (this.wave > persistence.profile.maxWave) persistence.profile.maxWave = this.wave;
        persistence.save();

        this.uiCallbacks?.onGameOver(this.score, persistence.profile.highScore, isNewHighScore);
    }

    private victory() {
        this.gameState = 'VICTORY';
        audioSystem.playPowerUp(); // Victory sound

        // Big bonus for completing all 20 waves
        const victoryBonus = 500;
        persistence.addShards(victoryBonus);
        this.score += victoryBonus * 10;

        // Update stats
        let isNewHighScore = false;
        if (this.score > persistence.profile.highScore) {
            persistence.profile.highScore = this.score;
            isNewHighScore = true;
        }
        if (this.wave > persistence.profile.maxWave) persistence.profile.maxWave = this.wave;
        persistence.save();

        // Trigger victory callback or fall back to game over
        if (this.uiCallbacks?.onVictory) {
            this.uiCallbacks.onVictory(this.score, persistence.profile.highScore);
        } else {
            // Fallback: use game over with victory flag implied by state
            this.uiCallbacks?.onGameOver(this.score, persistence.profile.highScore, isNewHighScore);
        }
    }

    private updateHUD() {
        this.uiCallbacks?.onLivesUpdate(this.lives, this.ship?.shields || 0);
        this.uiCallbacks?.onScoreUpdate(this.score);
        this.uiCallbacks?.onComboUpdate(this.combo, 0);
    }

    private spawnBullet(b: Bullet) {
        this.bullets.push(b);
        if (tutorialSystem.active) tutorialSystem.checkShoot();
    }
    private spawnParticle(x: number, y: number, c: string) { this.particles.push(this.particlePool.get(x, y, c)); }
    private spawnText(x: number, y: number, t: string, c: string) { this.floatingTexts.push(this.textPool.get(x, y, t, c)); }

    private getGameCallbacks() {
        return {
            spawnParticle: this.spawnParticle.bind(this),
            spawnText: this.spawnText.bind(this),
            spawnPowerUp: (p: PowerUp) => this.powerups.push(p),
            spawnAsteroid: (x: number, y: number, size: string) => {
                this.asteroids.push(new Asteroid(x, y, size, this.canvas!.width, this.canvas!.height));
            },
            onScore: (amount: number) => {
                this.score += amount;
                this.uiCallbacks?.onScoreUpdate(this.score);
            },
            onCombo: () => {
                this.combo++;
                this.comboTimer = 2.5 + ((persistence.profile.upgrades.combo || 0) * 0.5);
                audioSystem.playComboUp(this.combo);
            }
        };
    }
}

export const gameEngine = new GameEngine();
