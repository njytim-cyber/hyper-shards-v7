import { spriteCache } from '../systems/SpriteCache';
import { audioSystem } from '../systems/AudioSystem';
import { Bullet } from './Bullet';
import { Pool } from '../core/Pool';
import type { SkinItem } from '../config/ShopConfig';
import { SKIN_CONFIG } from '../config/ShopConfig';

export type AIDifficulty = 'EASY' | 'NORMAL' | 'HARD';

interface AICallbacks {
    spawnBullet: (b: Bullet) => void;
    spawnParticle: (x: number, y: number, color: string) => void;
    spawnText: (x: number, y: number, text: string, color: string) => void;
}

interface AIConfig {
    reactionTime: number;      // Delay before responding (seconds)
    accuracy: number;          // 0-1, how accurate aiming is
    evasionSkill: number;      // 0-1, how well it evades
    aggressiveness: number;    // 0-1, how often it shoots
    movementSpeed: number;     // Speed multiplier
}

const DIFFICULTY_CONFIGS: Record<AIDifficulty, AIConfig> = {
    EASY: {
        reactionTime: 0.8,
        accuracy: 0.5,
        evasionSkill: 0.3,
        aggressiveness: 0.4,
        movementSpeed: 0.7
    },
    NORMAL: {
        reactionTime: 0.4,
        accuracy: 0.75,
        evasionSkill: 0.6,
        aggressiveness: 0.6,
        movementSpeed: 0.9
    },
    HARD: {
        reactionTime: 0.15,
        accuracy: 0.95,
        evasionSkill: 0.85,
        aggressiveness: 0.8,
        movementSpeed: 1.1
    }
};

export class AIOpponent {
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = Math.PI / 2;  // Start facing down
    public radius: number = 15;
    public visible: boolean = true;
    public dead: boolean = false;

    public score: number = 0;
    public lives: number = 3;
    public shields: number = 0;
    public invincibleTime: number = 1.5;

    public skin: SkinItem;
    public difficulty: AIDifficulty;
    private config: AIConfig;

    private bulletPool: Pool<Bullet>;
    private lastShot: number = 0;
    private fireRate: number = 0.2;
    private targetAngle: number = 0;
    private actionTimer: number = 0;
    private currentAction: 'IDLE' | 'CHASE' | 'EVADE' | 'ATTACK' = 'IDLE';
    private evasionDirection: number = 0;

    constructor(bulletPool: Pool<Bullet>, difficulty: AIDifficulty = 'NORMAL') {
        this.bulletPool = bulletPool;
        this.difficulty = difficulty;
        this.config = DIFFICULTY_CONFIGS[difficulty];
        this.skin = SKIN_CONFIG['ai_red'] || {
            colors: { main: '#f55', trail: '#f00', accent: '#ff8' },
            design: 'default'
        };
    }

    public reset(canvasWidth: number, canvasHeight: number) {
        // Start on opposite side from player (top of screen)
        this.x = canvasWidth / 2;
        this.y = canvasHeight * 0.15;
        this.vx = 0;
        this.vy = 0;
        this.angle = Math.PI / 2;  // Face down towards player
        this.invincibleTime = 2.0;
        this.visible = true;
        this.dead = false;
        this.lives = 3;
        this.shields = 0;
        this.score = 0;
        this.currentAction = 'IDLE';
        this.actionTimer = 0;
    }

    public update(
        dt: number,
        canvasWidth: number,
        canvasHeight: number,
        playerX: number,
        playerY: number,
        asteroids: { x: number; y: number; r: number }[],
        callbacks: AICallbacks
    ) {
        if (this.dead) return;

        // Invincibility
        if (this.invincibleTime > 0) {
            this.invincibleTime -= dt;
            this.visible = Math.floor(Date.now() / 200) % 2 === 0;
        } else {
            this.visible = true;
        }

        // Update action timer
        this.actionTimer -= dt;

        // Decision making with reaction time delay
        if (this.actionTimer <= 0) {
            this.actionTimer = this.config.reactionTime + Math.random() * 0.2;
            this.decideAction(playerX, playerY, asteroids);
        }

        // Execute current action
        this.executeAction(dt, canvasWidth, canvasHeight, playerX, playerY, callbacks);

        // Movement physics
        const friction = Math.pow(0.95, dt * 60);
        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.screenWrap(canvasWidth, canvasHeight);

        // Smooth rotation towards target
        const angleDiff = this.normalizeAngle(this.targetAngle - this.angle);
        this.angle += angleDiff * Math.min(dt * 5, 1);
    }

    private decideAction(playerX: number, playerY: number, asteroids: { x: number; y: number; r: number }[]) {
        const distToPlayer = Math.sqrt((playerX - this.x) ** 2 + (playerY - this.y) ** 2);

        // Check for nearby threats (asteroids)
        let nearestThreat: { x: number; y: number; dist: number } | null = null;
        for (const a of asteroids) {
            const dist = Math.sqrt((a.x - this.x) ** 2 + (a.y - this.y) ** 2);
            if (dist < 150 && (!nearestThreat || dist < nearestThreat.dist)) {
                nearestThreat = { x: a.x, y: a.y, dist };
            }
        }

        // Decision tree based on difficulty
        if (nearestThreat && Math.random() < this.config.evasionSkill) {
            this.currentAction = 'EVADE';
            this.evasionDirection = Math.atan2(this.y - nearestThreat.y, this.x - nearestThreat.x);
        } else if (distToPlayer < 300 && Math.random() < this.config.aggressiveness) {
            this.currentAction = 'ATTACK';
        } else if (distToPlayer > 400) {
            this.currentAction = 'CHASE';
        } else {
            this.currentAction = Math.random() < 0.5 ? 'ATTACK' : 'IDLE';
        }
    }

    private executeAction(
        dt: number,
        _canvasWidth: number,
        canvasHeight: number,
        playerX: number,
        playerY: number,
        callbacks: AICallbacks
    ) {
        const thrust = 1000 * this.config.movementSpeed;

        switch (this.currentAction) {
            case 'CHASE': {
                // Move towards player
                const angleToPlayer = Math.atan2(playerY - this.y, playerX - this.x);
                this.targetAngle = angleToPlayer;
                this.vx += Math.cos(angleToPlayer) * thrust * dt;
                this.vy += Math.sin(angleToPlayer) * thrust * dt;
                callbacks.spawnParticle(
                    this.x - Math.cos(this.angle) * 15,
                    this.y - Math.sin(this.angle) * 15,
                    this.skin.colors.trail
                );
                break;
            }

            case 'EVADE': {
                // Move away from threat
                this.targetAngle = this.evasionDirection;
                this.vx += Math.cos(this.evasionDirection) * thrust * 1.2 * dt;
                this.vy += Math.sin(this.evasionDirection) * thrust * 1.2 * dt;
                break;
            }

            case 'ATTACK': {
                // Aim at player with accuracy variance
                const baseAngle = Math.atan2(playerY - this.y, playerX - this.x);
                const accuracyError = (1 - this.config.accuracy) * (Math.random() - 0.5) * 0.5;
                this.targetAngle = baseAngle + accuracyError;

                // Shoot if ready
                if (Date.now() - this.lastShot > this.fireRate * 1000) {
                    this.shoot(callbacks);
                }

                // Strafe movement
                const strafeDir = Math.sin(Date.now() / 500) * 0.5;
                this.vx += Math.cos(baseAngle + Math.PI / 2) * thrust * strafeDir * dt;
                this.vy += Math.sin(baseAngle + Math.PI / 2) * thrust * strafeDir * dt;
                break;
            }

            case 'IDLE':
            default: {
                // Gentle patrol movement
                const patrolAngle = Math.sin(Date.now() / 2000) * Math.PI;
                this.vx += Math.cos(patrolAngle) * thrust * 0.3 * dt;
                this.vy += Math.sin(patrolAngle) * thrust * 0.3 * dt;

                // Still aim at player
                this.targetAngle = Math.atan2(playerY - this.y, playerX - this.x);
                break;
            }
        }

        // Keep within bounds (prefer staying in top half)
        if (this.y > canvasHeight * 0.7) {
            this.vy -= thrust * 0.5 * dt;
        }
        if (this.y < 50) {
            this.vy += thrust * 0.5 * dt;
        }
    }

    private shoot(callbacks: AICallbacks) {
        const nx = this.x + Math.cos(this.angle) * 25;
        const ny = this.y + Math.sin(this.angle) * 25;

        const b = this.bulletPool.get(nx, ny, this.angle, 'AI', 1, 1, 3, false);
        b.color = '#f55';
        b.isEnemy = true;
        callbacks.spawnBullet(b);

        this.lastShot = Date.now();
        audioSystem.playShoot(0.8);
    }

    private screenWrap(canvasWidth: number, canvasHeight: number) {
        const buffer = 40;
        if (this.x < -buffer) this.x = canvasWidth + buffer;
        if (this.x > canvasWidth + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = canvasHeight + buffer;
        if (this.y > canvasHeight + buffer) this.y = -buffer;
    }

    private normalizeAngle(angle: number): number {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (!this.visible || this.dead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw AI ship with distinct red color
        const img = spriteCache.getShip(this.skin.colors.main, this.skin.design);
        ctx.save();
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -20, -20);
        ctx.restore();

        // AI indicator ring (Removed to avoid confusion with shields)
        /*
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 85, 85, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        */

        if (this.shields > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.strokeStyle = '#f55';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();

        // Draw "AI" label above ship
        ctx.save();
        ctx.fillStyle = '#f55';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AI', this.x, this.y - 30);
        ctx.restore();
    }

    public hit(callbacks: AICallbacks): boolean {
        if (this.shields > 0) {
            this.shields--;
            callbacks.spawnText(this.x, this.y - 20, 'BLOCKED', '#f55');
            return false;
        }
        return true;
    }

    public die(callbacks: AICallbacks) {
        this.lives--;
        if (this.lives <= 0) {
            this.dead = true;
            callbacks.spawnText(this.x, this.y, 'AI DEFEATED!', '#0f0');
        } else {
            this.invincibleTime = 2.0;
            callbacks.spawnText(this.x, this.y - 20, `${this.lives} LIVES LEFT`, '#f55');
        }
    }

    public addScore(points: number) {
        this.score += points;
    }
}
