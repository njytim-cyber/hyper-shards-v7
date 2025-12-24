import { spriteCache } from '../systems/SpriteCache';
import { audioSystem } from '../systems/AudioSystem';
import type { BossType, AttackPattern } from '../config/BossConfig';

interface BossCallbacks {
    spawnBullet: (x: number, y: number, angle: number, type: string, dmg: number) => void;
    getPlayerPosition?: () => { x: number; y: number };
}

export class Boss {
    public x: number;
    public y: number;
    public bossType: BossType;
    public maxHp: number;
    public hp: number;
    public angle: number = 0;
    public dead: boolean = false;
    public fireTimer: number = 2.0;
    public cachedSprite: HTMLCanvasElement;

    // For pattern variations
    private patternPhase: number = 0;
    private burstCount: number = 0;
    private spiralOffset: number = 0;
    private attackIndex: number = 0;

    constructor(bossType: BossType, wave: number, canvasWidth: number) {
        this.x = canvasWidth / 2;
        this.y = -100;
        this.bossType = bossType;

        // Calculate HP based on config + wave scaling
        this.maxHp = bossType.baseHp + (wave * bossType.hpPerWave);
        this.hp = this.maxHp;

        // Get appropriate sprite
        this.cachedSprite = spriteCache.getBossSprite(
            bossType.sprite,
            bossType.color,
            bossType.size
        );
    }

    // Legacy constructor support for backward compatibility
    static createLegacy(isBigBoss: boolean, wave: number, canvasWidth: number): Boss {
        // Create a legacy boss type for backwards compatibility
        const legacyType: BossType = isBigBoss ? {
            id: 'dreadnought',
            name: 'DREADNOUGHT',
            sprite: 'mothership',
            color: '#f30',
            glowColor: '#f00',
            baseHp: 500,
            hpPerWave: 20,
            fireRate: 1.0,
            attackPattern: 'radial',
            bulletCount: 16,
            rotationSpeed: 0.5,
            size: 90,
            isFinalBoss: true
        } : {
            id: 'miniboss',
            name: 'MINIBOSS',
            sprite: 'hexagon',
            color: '#f00',
            glowColor: '#f00',
            baseHp: 50,
            hpPerWave: 10,
            fireRate: 1.5,
            attackPattern: 'radial',
            bulletCount: 12,
            rotationSpeed: 1.0,
            size: 55,
            isFinalBoss: false
        };
        return new Boss(legacyType, wave, canvasWidth);
    }

    public update(dt: number, callbacks: BossCallbacks, wave: number) {
        // Move into position
        if (this.y < 150) this.y += 50 * dt;

        // Rotate based on boss type
        this.angle += dt * this.bossType.rotationSpeed;

        // Fire based on fire rate
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.bossType.fireRate;
            this.shoot(callbacks, wave);
        }
    }

    private shoot(callbacks: BossCallbacks, wave: number) {
        const dmg = 1 + Math.floor(wave / 9);
        const pattern = this.bossType.attackPattern;

        switch (pattern) {
            case 'radial':
                this.shootRadial(callbacks, dmg);
                break;
            case 'spiral':
                this.shootSpiral(callbacks, dmg);
                break;
            case 'burst':
                this.shootBurst(callbacks, dmg);
                break;
            case 'aimed':
                this.shootAimed(callbacks, dmg);
                break;
            case 'wave':
                this.shootWave(callbacks, dmg);
                break;
            case 'combined':
                this.shootCombined(callbacks, dmg);
                break;
            default:
                this.shootRadial(callbacks, dmg);
        }

        audioSystem.playShoot(0.5);
    }

    // Radial pattern - bullets spread in circle
    private shootRadial(callbacks: BossCallbacks, dmg: number) {
        const count = this.bossType.bulletCount;
        for (let i = 0; i < count; i++) {
            const a = this.angle + (i * (Math.PI * 2 / count));
            callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
        }
    }

    // Spiral pattern - rotating stream
    private shootSpiral(callbacks: BossCallbacks, dmg: number) {
        const count = this.bossType.bulletCount;
        for (let i = 0; i < count; i++) {
            const a = this.spiralOffset + (i * (Math.PI * 2 / count));
            callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
        }
        this.spiralOffset += 0.3; // Rotate pattern each shot
    }

    // Burst pattern - multiple rapid shots
    private shootBurst(callbacks: BossCallbacks, dmg: number) {
        this.burstCount++;
        const count = this.bossType.bulletCount;

        // Shoot in current direction
        for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 0.15;
            const a = this.angle + spread;
            callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
        }

        // Reset burst after 3 shots
        if (this.burstCount >= 3) {
            this.burstCount = 0;
            this.fireTimer = this.bossType.fireRate * 2; // Longer pause after burst
        } else {
            this.fireTimer = 0.15; // Quick follow-up shots
        }
    }

    // Aimed pattern - shoots toward player
    private shootAimed(callbacks: BossCallbacks, dmg: number) {
        const playerPos = callbacks.getPlayerPosition?.() || { x: 400, y: 600 };
        const dx = playerPos.x - this.x;
        const dy = playerPos.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);

        const count = this.bossType.bulletCount;
        for (let i = 0; i < count; i++) {
            const spread = (i - (count - 1) / 2) * 0.2;
            callbacks.spawnBullet(this.x, this.y, angleToPlayer + spread, 'BOSS', dmg);
        }
    }

    // Wave pattern - sine wave bullets
    private shootWave(callbacks: BossCallbacks, dmg: number) {
        const count = this.bossType.bulletCount;
        this.patternPhase += 0.5;

        for (let i = 0; i < count; i++) {
            const baseAngle = (i / count) * Math.PI; // Spread across bottom half
            const waveOffset = Math.sin(this.patternPhase + i * 0.5) * 0.3;
            const a = Math.PI / 2 + (baseAngle - Math.PI / 2) + waveOffset;
            callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
        }
    }

    // Combined pattern - cycles through all patterns
    private shootCombined(callbacks: BossCallbacks, dmg: number) {
        const patterns: AttackPattern[] = ['radial', 'aimed', 'spiral', 'burst'];
        const currentPattern = patterns[this.attackIndex % patterns.length];

        switch (currentPattern) {
            case 'radial':
                this.shootRadial(callbacks, dmg);
                break;
            case 'aimed':
                this.shootAimed(callbacks, dmg);
                break;
            case 'spiral':
                this.shootSpiral(callbacks, dmg);
                break;
            case 'burst':
                this.shootBurst(callbacks, dmg);
                break;
        }

        this.attackIndex++;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw sprite centered
        const size = this.bossType.size;
        const padding = 20;
        ctx.drawImage(this.cachedSprite, -(size + padding), -(size + padding));

        ctx.restore();

        // Draw health bar
        const barWidth = Math.min(100, this.bossType.size * 1.5);
        const hpPercent = this.hp / this.maxHp;

        // Background
        ctx.fillStyle = '#300';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.bossType.size - 20, barWidth, 8);

        // Health fill
        ctx.fillStyle = hpPercent > 0.5 ? '#f00' : (hpPercent > 0.25 ? '#f80' : '#ff0');
        ctx.fillRect(this.x - barWidth / 2, this.y - this.bossType.size - 20, barWidth * hpPercent, 8);

        // Boss name
        ctx.fillStyle = this.bossType.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.bossType.name, this.x, this.y - this.bossType.size - 25);
    }

    // Getters for compatibility
    get isBigBoss(): boolean {
        return this.bossType.isFinalBoss;
    }

    get fireRate(): number {
        return this.bossType.fireRate;
    }
}
