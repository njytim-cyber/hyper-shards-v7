import { VisualEffects } from '../systems/VisualEffects';
import { audioSystem } from '../systems/AudioSystem';
import { spriteCache } from '../systems/SpriteCache';
import { persistence } from '../systems/Persistence';
import { inputSystem } from '../systems/InputSystem';
import { gamepadSystem } from '../systems/GamepadSystem';
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
import { getBossForWave, MAX_WAVES, BOSS_CONFIG } from '../config/BossConfig';
import { getCampaignLevel, type CampaignLevel } from '../config/CampaignConfig';
import { MultiplayerBridge } from '../../bridges/MultiplayerBridge';
import { RemoteShip } from '../entities/RemoteShip';
import { AIOpponent, type AIDifficulty } from '../entities/AIOpponent';
export type { AIDifficulty };
import type { ChallengeModifier } from '../config/ChallengeModifiers';

// Register gamepad system globally for InputSystem to access
(globalThis as Record<string, unknown>).__gamepadSystem = gamepadSystem;

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'COUNTDOWN';
export type GameMode = 'SOLO' | 'COOP' | 'VERSUS' | 'VS_PC';

interface UICallbacks {
    onScoreUpdate: (score: number) => void;
    onWaveUpdate: (wave: number, subText: string, hintText: string, isBoss: boolean) => void;
    onLivesUpdate: (lives: number, shields: number) => void;
    onWeaponUpdate: (weapon: string) => void;
    onComboUpdate: (combo: number, val: number) => void;
    onGameOver: (score: number, highScore: number, isNewHighScore: boolean) => void;
    onVictory?: (score: number, highScore: number) => void;
    onCampaignComplete?: (levelId: number, stars: number, time: number, tookDamage: boolean, maxCombo: number) => void;
    onGameStart: () => void;
    onPause: (isPaused: boolean) => void;
    onOpponentUpdate?: (lives: number, shields: number, id: string) => void;
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
    public countdownTimer: number = 0;

    private lastTime: number = 0;

    private interestTimer: number = 0;
    private regenTimer: number = 0;
    private hasRevived: boolean = false;
    private networkSyncCounter: number = 0;  // For throttled network sync

    // Campaign mode tracking
    private campaignLevel: CampaignLevel | null = null;
    private campaignStartTime: number = 0;
    private campaignTookDamage: boolean = false;
    private campaignMaxCombo: number = 0;
    private campaignBossIndex: number = 0;  // For boss rush mode

    private bulletPool: Pool<Bullet>;
    private particlePool: Pool<Particle>;
    private textPool: Pool<FloatingText>;
    private spatialGrid: SpatialGrid<{ x: number; y: number; radius: number; ref: Asteroid }>;
    private uiCallbacks: UICallbacks | null = null;
    public visualEffects: VisualEffects;
    public multiplayerBridge: MultiplayerBridge;
    public remotePlayers: Map<string, RemoteShip> = new Map();

    // Funny texts
    private funnyWaveIntros = ["INITIALIZING SYSTEMS...", "HYPERSPACE ENGAGED", "ASTEROID FIELD AHEAD", "DON'T BLINK", "STAY SHARP PILOT", "MORE ROCKS? REALLY?", "CLEAN UP ON AISLE 5", "THEY SEE ME ROLLIN'", "WATCH YOUR SIX", "INCOMING SPACE TRASH", "PIZZA DELIVERY IS LATE"];
    private funnyBossIntros = ["WARNING: DREADNOUGHT DETECTED", "BOSS APPROACHING", "WARNING: BIG SHIP ENERGY", "OH NO, IT'S THE MANAGER", "GIANT ENEMY CRAB... WAIT", "PREPARE FOR TROUBLE", "LEVEL 9000 BOSS DETECTED", "IT'S BOSS O'CLOCK"];
    private hints = ["Tip: Use SHIFT to DASH.", "Tip: Heavy ammo pierces.", "Tip: Upgrades are permanent.", "Tip: Nukes clear screen.", "Tip: Collect SHARDS.", "Tip: Kill fast for combos."];

    // Pre-bound callbacks to avoid allocations per frame
    private cachedCallbacks: {
        spawnBullet: (b: Bullet) => void;
        spawnParticle: (x: number, y: number, color: string) => void;
        spawnText: (x: number, y: number, text: string, color: string) => void;
        updateWeaponUI: (weapon: string) => void;
        updateHUD: () => void;
        gameOver: () => void;
    } | null = null;

    public remoteScore: number = 0;
    public totalScore: number = 0; // Local + Remote
    public gameMode: GameMode = 'SOLO';

    // Challenge Modifiers
    public globalSpeedMultiplier: number = 1.0;
    public damageMultiplier: number = 1.0;
    public shieldsDisabled: boolean = false;
    public spawnRateMultiplier: number = 1.0;
    public enemyScaleMultiplier: number = 1.0;

    // VS PC Mode
    public aiOpponent: AIOpponent | null = null;
    public aiDifficulty: AIDifficulty = 'NORMAL';

    constructor() {
        this.bulletPool = new Pool(() => new Bullet(), (b, x, y, a, t, d, p, s, h) => b.init(x, y, a, t, d, p, s, h));
        this.particlePool = new Pool(() => new Particle(), (p, x, y, c) => p.init(x, y, c));
        this.textPool = new Pool(() => new FloatingText(), (t, x, y, txt, c) => t.init(x, y, txt, c));
        // Initialize with a reasonable cell size (e.g., 100px)
        this.spatialGrid = new SpatialGrid(2000, 2000, 100);
        this.visualEffects = new VisualEffects(this);

        this.multiplayerBridge = new MultiplayerBridge('https://hyper-shards-server.fly.dev');
        this.multiplayerBridge.onPlayerUpdate = (state) => {
            if (!this.remotePlayers.has(state.id)) {
                this.remotePlayers.set(state.id, new RemoteShip(state.id));
                this.spawnText(this.canvas!.width / 2, 100, "PLAYER 2 JOINED", "#0f0");
                audioSystem.playPowerUp();
            }
            this.remotePlayers.get(state.id)?.updateState(state);

            // Should optimize: only trigger UI update if values changed or throttled
            // For now, simple direct update
            if (state.id !== this.multiplayerBridge.getPlayerId()) { // Double check we aren't updating self (bridge filters too)
                this.uiCallbacks?.onOpponentUpdate?.(state.health, state.shield, state.id);
            }
        };
        this.multiplayerBridge.onPlayerLeft = (id) => {
            this.remotePlayers.delete(id);
            this.spawnText(this.canvas!.width / 2, 100, "PLAYER 2 DISCONNECTED", "#f00");
        };
        this.multiplayerBridge.onScoreUpdate = (_id, score) => {
            this.remoteScore = score;
            // Update UI/Total immediately?
        };
        this.multiplayerBridge.onReviveRequest = (from, target) => {
            void from; void target;  // Reserved for future revive UI
            if (this.ship && !this.ship.dead) {
                this.spawnText(this.ship.x, this.ship.y - 60, "REVIVE REQUEST!", "#ff0");
                // TODO: Show beacon logic
            }
        };
        this.multiplayerBridge.onGameOver = (id) => {
            void id;  // Reserved for player-specific UI
            this.spawnText(this.canvas!.width / 2, 100, "PLAYER 2 FALLEN!", "#f00");
            if (this.lives <= 0) {
                this.gameState = 'GAMEOVER';
                audioSystem.playMusic('load');
            }
        };
        this.multiplayerBridge.onHazardReceived = (_from, _type, intensity) => {
            this.spawnText(this.ship?.x || 0, (this.ship?.y || 0) - 80, "INCOMING HAZARD!", "#f00");
            audioSystem.playExplosion('boss');
            const count = 3 * intensity;
            for (let i = 0; i < count; i++) {
                this.asteroids.push(new Asteroid(undefined, undefined, 'large', this.canvas!.width, this.canvas!.height));
            }
        };
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

    public startGame(modifiers: ChallengeModifier[] = []) {
        if (!this.canvas) return;

        // Reset defaults first
        this.globalSpeedMultiplier = 1.0;
        this.damageMultiplier = 1.0;
        this.shieldsDisabled = false;
        this.spawnRateMultiplier = 1.0;
        this.enemyScaleMultiplier = 1.0;

        this.score = 0;
        if ((persistence.profile.upgrades.start || 0) > 0) {
            this.wave = 4;
            this.score = 1000;
            persistence.addShards(50);
        } else {
            this.wave = 1;
        }

        // If restarting in VS_PC mode, delegate to startVsPC to ensure AI is initialized
        if (this.gameMode === 'VS_PC') {
            this.startVsPC(this.aiDifficulty);
            return;
        }

        // Apply Modifiers

        // Apply Modifiers
        modifiers.forEach(mod => {
            if (mod.apply) mod.apply(this);
        });

        // CRITICAL: Set gameState to 'PLAYING' so the game loop runs!
        this.gameState = 'PLAYING';

        this.ship = new Ship(this.bulletPool);

        // Apply current skin
        const skinKey = persistence.profile.equippedSkin || 'default';
        const skinData = SKIN_CONFIG[skinKey];
        if (skinData) this.ship.skin = skinData;

        this.lives = this.ship.maxLives;
        this.hasRevived = false;
        this.networkSyncCounter = 0;

        // Cache bound callbacks to avoid per-frame allocations
        this.cachedCallbacks = {
            spawnBullet: this.spawnBullet.bind(this),
            spawnParticle: this.spawnParticle.bind(this),
            spawnText: this.spawnText.bind(this),
            updateWeaponUI: (t: string) => this.uiCallbacks?.onWeaponUpdate(t),
            updateHUD: this.updateHUD.bind(this),
            gameOver: this.gameOver.bind(this)
        };

        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        if (this.wave === 1) {
            // Reset ship with no invincibility for tutorial so it's always visible
            this.ship.reset(this.canvas.width, this.canvas.height, 0);

            // ONLY start tutorial in SOLO mode
            if (this.gameMode === 'SOLO') {
                tutorialSystem.start();
                this.uiCallbacks?.onWaveUpdate(1, "TUTORIAL", "Follow instructions", false);
            } else {
                // For PvP/Co-op, just show Wave 1
                this.uiCallbacks?.onWaveUpdate(1, "WAVE 1", "Destroy the enemy!", false);
            }
            // Tutorial system will spawn asteroid when needed (at shoot step)
        } else {
            // Reset ship with normal invincibility
            this.ship.reset(this.canvas.width, this.canvas.height);
            this.spawnWave();
        }
    }

    // Start a campaign level with specific configuration
    public startCampaignLevel(levelId: number) {
        const level = getCampaignLevel(levelId);
        if (!this.canvas || !level) return;

        // Reset campaign tracking
        this.campaignLevel = level;
        this.campaignStartTime = Date.now();
        this.campaignTookDamage = false;
        this.campaignMaxCombo = 0;
        this.campaignBossIndex = 0;

        this.score = 0;
        this.wave = level.waveStart;
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
        this.floatingTexts = [];
        this.powerups = [];
        this.boss = null;

        this.ship.reset(this.canvas.width, this.canvas.height);

        // Show level briefing
        this.uiCallbacks?.onWaveUpdate(levelId, level.name, level.briefing[0], level.type === 'boss' || level.type === 'boss_rush');

        // Spawn initial wave after brief delay
        setTimeout(() => {
            if (this.gameState === 'PLAYING') {
                this.spawnCampaignWave();
            }
        }, 1500);

        audioSystem.playMusic('wave');
    }

    // Start VS PC mode - player vs AI opponent
    public startVsPC(difficulty: AIDifficulty = 'NORMAL') {
        if (!this.canvas) return;

        this.gameMode = 'VS_PC';
        this.aiDifficulty = difficulty;
        this.score = 0;
        this.wave = 1;
        this.gameState = 'COUNTDOWN';
        this.countdownTimer = 3;

        // Create player ship
        this.ship = new Ship(this.bulletPool);
        const skinKey = persistence.profile.equippedSkin || 'default';
        const skinData = SKIN_CONFIG[skinKey];
        if (skinData) this.ship.skin = skinData;

        this.lives = this.ship.maxLives;
        this.hasRevived = false;

        // Create AI opponent
        this.aiOpponent = new AIOpponent(this.bulletPool, difficulty);
        this.aiOpponent.reset(this.canvas.width, this.canvas.height);

        // Explicitly disable tutorial
        tutorialSystem.end();

        // Cache callbacks
        this.cachedCallbacks = {
            spawnBullet: this.spawnBullet.bind(this),
            spawnParticle: this.spawnParticle.bind(this),
            spawnText: this.spawnText.bind(this),
            updateWeaponUI: (t: string) => this.uiCallbacks?.onWeaponUpdate(t),
            updateHUD: this.updateHUD.bind(this),
            gameOver: this.gameOver.bind(this)
        };

        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.floatingTexts = [];
        this.powerups = [];
        this.boss = null;

        // Position player at bottom
        this.ship.reset(this.canvas.width, this.canvas.height);
        this.ship.y = this.canvas.height * 0.85;
        this.ship.angle = -Math.PI / 2;  // Face up

        // Spawn some asteroids for both to compete over
        this.spawnVsPCWave();

        this.uiCallbacks?.onWaveUpdate(1, "GET READY", "3", false);
        // audioSystem.playMusic('wave'); // Play music after countdown
    }

    private spawnVsPCWave() {
        if (!this.canvas) return;

        // Spawn asteroids spread across the middle of the screen
        const count = 8 + this.wave * 2;
        Asteroid.currentWave = this.wave;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * this.canvas.width;
            const y = this.canvas.height * 0.3 + Math.random() * this.canvas.height * 0.4;
            const ast = new Asteroid(x, y, 'large', this.canvas.width, this.canvas.height);
            this.asteroids.push(ast);
        }
    }

    // Spawn wave for campaign mode with modifiers
    private spawnCampaignWave() {
        if (!this.canvas || !this.campaignLevel) return;

        const level = this.campaignLevel;
        const mod = level.modifiers;

        // Boss rush mode: spawn next boss
        if (level.type === 'boss_rush') {
            const bossWaves = [3, 6, 9, 12, 15, 18, 20];  // All boss wave numbers
            if (this.campaignBossIndex < bossWaves.length) {
                const bossWave = bossWaves[this.campaignBossIndex];
                const bossConfig = getBossForWave(bossWave);
                if (bossConfig) {
                    this.boss = new Boss(bossConfig, bossWave, this.canvas.width);
                    this.boss.hp = Math.floor(this.boss.hp * mod.bossHp);
                    audioSystem.playAlarm();
                    audioSystem.playMusic('boss');
                    this.uiCallbacks?.onWaveUpdate(this.campaignBossIndex + 1, `BOSS ${this.campaignBossIndex + 1}/7`, bossConfig.name, true);
                }
            }
            return;
        }

        // Survival mode: continuous asteroid spawn
        if (level.type === 'survival') {
            const count = Math.floor(5 * mod.asteroidCount);
            Asteroid.currentWave = this.wave;
            for (let i = 0; i < count; i++) {
                const ast = new Asteroid(undefined, undefined, 'large', this.canvas.width, this.canvas.height);
                ast.vx *= mod.asteroidSpeed;
                ast.vy *= mod.asteroidSpeed;
                ast.hp = Math.ceil(ast.hp * mod.asteroidHp);
                this.asteroids.push(ast);
            }
            this.uiCallbacks?.onWaveUpdate(this.wave, 'SURVIVE', `Wave ${this.wave}`, false);
            return;
        }

        // Standard/Boss levels
        const bossConfig = level.bossId ? getBossForWave(this.wave) || BOSS_CONFIG[3] : undefined;  // Use sentinel as fallback
        const isBossWave = !!bossConfig && this.wave === level.waveEnd;

        // Calculate asteroid count with modifiers
        let count = 3 + Math.floor(this.wave * 0.8);
        count = Math.min(count, 15);
        count = Math.floor(count * mod.asteroidCount);
        if (isBossWave) count = 0;

        Asteroid.currentWave = this.wave;
        for (let i = 0; i < count; i++) {
            const ast = new Asteroid(undefined, undefined, 'large', this.canvas.width, this.canvas.height);
            ast.vx *= mod.asteroidSpeed;
            ast.vy *= mod.asteroidSpeed;
            ast.hp = Math.ceil(ast.hp * mod.asteroidHp);
            this.asteroids.push(ast);
        }

        // Spawn boss if this is the final wave of a boss level
        if (isBossWave && level.bossId) {
            const bossCfg = getBossForWave(level.waveEnd) || BOSS_CONFIG[3];
            if (bossCfg) {
                this.boss = new Boss(bossCfg, this.wave, this.canvas.width);
                this.boss.hp = Math.floor(this.boss.hp * mod.bossHp);
                audioSystem.playAlarm();
                audioSystem.playMusic('boss');
            }
        } else {
            audioSystem.playMusic('wave');
        }

        const subText = isBossWave ? `BOSS: ${bossConfig?.name || 'Unknown'}` : this.funnyWaveIntros[Math.floor(Math.random() * this.funnyWaveIntros.length)];
        this.uiCallbacks?.onWaveUpdate(this.wave, subText, this.hints[Math.floor(Math.random() * this.hints.length)], isBossWave);
    }

    public togglePause() {
        if (this.gameState === 'PLAYING' || this.gameState === 'COUNTDOWN') {
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

        if (this.gameState !== 'PLAYING' && this.gameState !== 'COUNTDOWN') return;
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.gameState === 'COUNTDOWN') {
            this.countdownTimer -= dt;
            // Update UI with countdown (ceil for 3, 2, 1)
            const count = Math.ceil(this.countdownTimer);
            if (this.uiCallbacks?.onWaveUpdate) {
                // Reuse wave update callback to show big text
                if (count > 0) {
                    this.uiCallbacks.onWaveUpdate(1, "GET READY", count.toString(), false);
                } else {
                    this.uiCallbacks.onWaveUpdate(1, "GO!", "", false);
                }
            }

            if (this.countdownTimer <= 0) {
                this.gameState = 'PLAYING';
                this.uiCallbacks?.onWaveUpdate(1, `VS ${this.aiDifficulty} AI`, 'Outscore your opponent!', false);
                audioSystem.playMusic('wave');
            } else {
                // Don't update game logic during countdown, but DRAW everything
                this.draw();
                return;
            }
        }

        this.update(dt);
        this.draw();
    }

    private update(dt: number) {
        if (!this.canvas || !this.ship) return;

        this.visualEffects.update(dt);

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

        // Entities - use cached callbacks to avoid per-frame allocations
        this.ship.update(dt, inputSystem.keys, inputSystem.touchSticks, this.canvas.width, this.canvas.height,
            this.cachedCallbacks!, this.combo);

        if (tutorialSystem.active) {
            tutorialSystem.checkMove(this.ship.x, this.ship.y);
            tutorialSystem.checkRotate(this.ship.angle);
        }

        // AI Opponent update (VS PC mode)
        if (this.gameMode === 'VS_PC' && this.aiOpponent && !this.aiOpponent.dead) {
            const aiCallbacks = {
                spawnBullet: this.spawnBullet.bind(this),
                spawnParticle: this.spawnParticle.bind(this),
                spawnText: this.spawnText.bind(this)
            };
            this.aiOpponent.update(
                dt,
                this.canvas.width,
                this.canvas.height,
                this.ship.x,
                this.ship.y,
                this.asteroids.map(a => ({ x: a.x, y: a.y, r: a.r })),
                aiCallbacks
            );

            // Sync AI stats to local HUD
            this.uiCallbacks?.onOpponentUpdate?.(this.aiOpponent.lives, this.aiOpponent.shields, 'AI_BOT');

        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt, this.asteroids);
            if (!b.active || b.x < 0 || b.x > this.canvas.width || b.y < 0 || b.y > this.canvas.height) {
                this.bulletPool.release(b);
                // Swap and Pop
                this.bullets[i] = this.bullets[this.bullets.length - 1];
                this.bullets.pop();
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
            // Track max combo for campaign objectives
            if (this.combo > this.campaignMaxCombo) {
                this.campaignMaxCombo = this.combo;
            }

            // Campaign mode completion checks
            if (this.campaignLevel) {
                const level = this.campaignLevel;

                // Boss Rush: advance to next boss or complete
                if (level.type === 'boss_rush' && this.boss?.dead) {
                    this.campaignBossIndex++;
                    if (this.campaignBossIndex >= 7) {
                        this.completeCampaignLevel();
                        return;
                    }
                    this.spawnCampaignWave();
                    return;
                }

                // Survival mode: continue spawning waves
                if (level.type === 'survival') {
                    this.wave++;
                    this.spawnCampaignWave();
                    return;
                }

                // Standard/Boss: check if we reached wave end
                if (this.wave >= level.waveEnd) {
                    // Level complete!
                    this.completeCampaignLevel();
                    return;
                }

                // Advance to next wave
                this.wave++;
                this.spawnCampaignWave();
                return;
            }

            // Normal arcade mode
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
                        this.visualEffects.explosion(b.x, b.y, '#fa0', 5); // Small spark on hit
                        if (this.boss.hp <= 0) {
                            this.boss.dead = true;
                            audioSystem.playExplosion('large');
                            persistence.addShards(50);
                            audioSystem.playMusic('wave');
                        }
                        continue;
                    }
                }

                // Player bullets vs AI Opponent
                if (this.gameMode === 'VS_PC' && this.aiOpponent && !this.aiOpponent.dead) {
                    const d = (b.x - this.aiOpponent.x) ** 2 + (b.y - this.aiOpponent.y) ** 2;
                    if (d < (this.aiOpponent.radius + b.radius) ** 2) {
                        b.active = false;
                        this.visualEffects.explosion(b.x, b.y, '#f55', 5);

                        // AI hit logic
                        const aiCallbacks = {
                            spawnBullet: this.spawnBullet.bind(this),
                            spawnParticle: this.spawnParticle.bind(this),
                            spawnText: this.spawnText.bind(this)
                        };

                        if (this.aiOpponent.hit(aiCallbacks)) {
                            // Hit was successful (shield handling done in hit())
                            this.aiOpponent.die(aiCallbacks);
                            if (this.aiOpponent.dead) {
                                this.victory(); // Or round win logic
                            }
                        }

                        this.uiCallbacks?.onOpponentUpdate?.(this.aiOpponent.lives, this.aiOpponent.shields, 'AI_BOT');
                        continue;
                    }
                }

                // Player bullets vs Asteroids (Grid Query)
                this.spatialGrid.query(b.x, b.y, b.radius, (item) => {
                    if (!b.active) return; // Bullet might have died in previous callback
                    const a = item.ref;
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

        // Multiplayer Updates
        this.remotePlayers.forEach(p => p.update(dt));

        if (this.ship && !this.ship.dead) {
            this.multiplayerBridge.sendPlayerState({
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.angle,
                velocity: { x: this.ship.vx, y: this.ship.vy },
                isFiring: inputSystem.keys.Space || false, // Simplify
                health: this.lives,
                shield: this.ship.shields
            });
            // Sync score every ~20 frames (~3 times per second at 60fps)
            this.networkSyncCounter++;
            if (this.score > 0 && this.networkSyncCounter >= 20) {
                this.multiplayerBridge.sendScore(this.score);
                this.networkSyncCounter = 0;
            }
        }
    }

    private draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.visualEffects.applyTransform(this.ctx);

        this.ship?.draw(this.ctx);
        assistPilot.draw(this.ctx);

        for (let i = 0; i < this.bullets.length; i++) this.bullets[i].draw(this.ctx);
        this.boss?.draw(this.ctx);
        for (let i = 0; i < this.asteroids.length; i++) this.asteroids[i].draw(this.ctx);
        for (let i = 0; i < this.powerups.length; i++) this.powerups[i].draw(this.ctx);

        // Draw remote players
        this.remotePlayers.forEach(p => p.draw(this.ctx!));

        // Draw AI opponent (VS PC mode)
        if (this.gameMode === 'VS_PC' && this.aiOpponent) {
            this.aiOpponent.draw(this.ctx);
        }

        // Draw particles last (on top) inside shake
        for (let i = 0; i < this.particles.length; i++) this.particles[i].draw(this.ctx);

        this.ctx.restore();

        this.ctx.save();
        this.visualEffects.applyTransform(this.ctx);
        for (let i = 0; i < this.floatingTexts.length; i++) this.floatingTexts[i].draw(this.ctx);
        this.ctx.restore();

        // Hit Flash Overlay
        this.visualEffects.drawFlash(this.ctx, this.canvas.width, this.canvas.height);
    }

    private handlePlayerHit() {
        this.lives--;
        this.combo = 1;
        this.campaignTookDamage = true;
        this.updateHUD();
        this.visualEffects.shake(20); // Stronger shake
        this.visualEffects.triggerFlash(0.2, '#f00'); // Red flash
        const invTime = 2.0 + ((persistence.profile.upgrades.shieldDur || 0) * 0.5);
        if (this.ship) {
            this.ship.reset(this.canvas!.width, this.canvas!.height, invTime);
        }
        audioSystem.playExplosion('large');

        // Nova Logic
        if ((persistence.profile.upgrades.nova || 0) > 0) {
            this.visualEffects.triggerFlash(0.5, '#fff'); // White flash for Nova
            this.asteroids.forEach(a => {
                a.hp -= 5;
                if (a.hp <= 0) a.break(this.getGameCallbacks(), this.asteroids, this.combo);
            });
            if (this.boss) {
                this.boss.hp -= 50;
                this.visualEffects.explosion(this.boss.x, this.boss.y, '#f00', 30);
                if (this.boss.hp <= 0) {
                    this.boss.dead = true;
                    persistence.addShards(100);
                    audioSystem.playExplosion('large');
                    audioSystem.playMusic('wave');
                    this.visualEffects.triggerFlash(1.0, '#fff'); // Big flash for boss death
                }
            }
            audioSystem.playNuke();
            this.spawnText(this.ship!.x, this.ship!.y - 40, "NOVA!", "#f00");
        }

        if (this.lives <= 0) this.gameOver();
    }

    private gameOver() {
        // Co-op Logic: If in Co-op mode, don't game over immediately unless all players are dead.
        // For now, assume simple local check or external mode flag.
        // If we are "dead", we become a ghost.

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

        // Broadcast death in multiplayer
        this.multiplayerBridge.sendGameOver();

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

    // Complete a campaign level and calculate stars
    private completeCampaignLevel() {
        if (!this.campaignLevel) return;

        const level = this.campaignLevel;
        const elapsedTime = (Date.now() - this.campaignStartTime) / 1000;  // seconds

        // Calculate stars based on objectives
        let stars = 1;  // Base star for completion

        const star2 = level.stars[1];
        const star3 = level.stars[2];

        // Check star 2 objective
        if (this.checkStarCriteria(star2, elapsedTime)) {
            stars = 2;
        }

        // Check star 3 objective  
        if (this.checkStarCriteria(star3, elapsedTime)) {
            stars = 3;
        }

        // Notify UI of campaign completion
        this.gameState = 'VICTORY';
        audioSystem.playPowerUp(); // Victory sound

        this.uiCallbacks?.onCampaignComplete?.(
            level.id,
            stars,
            elapsedTime,
            this.campaignTookDamage,
            this.campaignMaxCombo
        );

        // Reset campaign state
        this.campaignLevel = null;
    }

    private checkStarCriteria(criteria: { check: string; value?: number }, elapsedTime: number): boolean {
        switch (criteria.check) {
            case 'complete':
                return true;
            case 'no_damage':
                return !this.campaignTookDamage;
            case 'time_limit':
                return elapsedTime <= (criteria.value || 999);
            case 'survival_time':
                return elapsedTime >= (criteria.value || 0);
            case 'combo':
                return this.campaignMaxCombo >= (criteria.value || 0);
            default:
                return false;
        }
    }

    private updateHUD() {
        this.uiCallbacks?.onLivesUpdate(this.lives, this.ship?.shields || 0);
        this.uiCallbacks?.onScoreUpdate(this.score);
        this.uiCallbacks?.onComboUpdate(this.combo, 0);
    }

    public spawnBullet(b: Bullet) {
        this.bullets.push(b);
        if (tutorialSystem.active) tutorialSystem.checkShoot();
    }
    public spawnParticle(x: number, y: number, c: string) { this.particles.push(this.particlePool.get(x, y, c)); }
    public spawnText(x: number, y: number, t: string, c: string) { this.floatingTexts.push(this.textPool.get(x, y, t, c)); }

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
                this.visualEffects.triggerComboPulse(this.combo);

                if (this.gameMode === 'VERSUS' && this.combo > 1 && this.combo % 10 === 0) {
                    this.spawnText(this.ship?.x || 0, (this.ship?.y || 0) - 60, "COMBO ATTACK SENT!", "#0f0");
                    this.multiplayerBridge.sendHazard('asteroid_rain', 1);
                }
            },
            explosion: (x: number, y: number, color: string, count: number) => {
                this.visualEffects.explosion(x, y, color, count);
            }
        };
    }
}

export const gameEngine = new GameEngine();
