import { spriteCache } from '../systems/SpriteCache';
import { audioSystem } from '../systems/AudioSystem';


interface BossCallbacks {
    spawnBullet: (x: number, y: number, angle: number, type: string, dmg: number) => void;
}

export class Boss {
    public x: number;
    public y: number;
    public isBigBoss: boolean;
    public maxHp: number;
    public hp: number;
    public angle: number = 0;
    public dead: boolean = false;
    public fireTimer: number = 2.0;
    public fireRate: number;
    public cachedSprite: HTMLCanvasElement;

    constructor(isBigBoss: boolean = false, wave: number, canvasWidth: number) {
        this.x = canvasWidth / 2;
        this.y = -100;
        this.isBigBoss = isBigBoss;

        let bossEncounterNum = Math.floor(wave / 3);
        let hpBonus = Math.floor(bossEncounterNum / 2) * 50;

        if (isBigBoss) {
            this.maxHp = 500 + (wave * 20);
            this.cachedSprite = spriteCache.getDreadnought();
        } else {
            this.maxHp = 50 + hpBonus;
            this.cachedSprite = spriteCache.getBoss();
        }

        this.hp = this.maxHp;
        this.fireRate = isBigBoss ? 1.0 : 1.5;
    }

    public update(dt: number, callbacks: BossCallbacks, wave: number) {
        if (this.y < 150) this.y += 50 * dt;
        this.angle += dt * (this.isBigBoss ? 0.5 : 1.0);
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            this.shoot(callbacks, wave);
        }
    }

    private shoot(callbacks: BossCallbacks, wave: number) {
        let dmg = 1 + Math.floor(wave / 9);
        if (this.isBigBoss) {
            const count = 16;
            for (let i = 0; i < count; i++) {
                const a = this.angle + (i * (Math.PI * 2 / count));
                callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
            }
        } else {
            const count = 12;
            for (let i = 0; i < count; i++) {
                const a = this.angle + (i * (Math.PI * 2 / count));
                callbacks.spawnBullet(this.x, this.y, a, 'BOSS', dmg);
            }
        }
        audioSystem.playShoot(0.5);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.isBigBoss) ctx.drawImage(this.cachedSprite, -100, -100);
        else ctx.drawImage(this.cachedSprite, -60, -60);
        ctx.restore();
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x - 50, this.y - 80, 100 * (this.hp / this.maxHp), 10);
    }
}
