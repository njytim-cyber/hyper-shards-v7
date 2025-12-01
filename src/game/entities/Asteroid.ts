import { spriteCache } from '../systems/SpriteCache';
import { persistence } from '../systems/Persistence';
import { audioSystem } from '../systems/AudioSystem';
import { PowerUp } from './PowerUp';
import { tutorialSystem } from '../systems/TutorialSystem';

// We need to pass spawn functions from GameEngine to avoid circular dependencies or use a global event system.
// For now, I'll define interfaces for the callbacks.

interface GameCallbacks {
    spawnParticle: (x: number, y: number, color: string) => void;
    spawnText: (x: number, y: number, text: string, color: string) => void;
    spawnPowerUp: (p: PowerUp) => void;
    spawnAsteroid: (x: number, y: number, size: string) => void;
    onScore: (amount: number) => void;
    onCombo: () => void;
}

export class Asteroid {
    public x: number = 0;
    public y: number = 0;
    public angle: number = 0;
    public sizeStr: string;
    public r: number;
    public hp: number;
    public col: string;
    public vx: number = 0;
    public vy: number = 0;
    public sprite: HTMLCanvasElement;
    public dead: boolean = false;

    // Static wave reference (hacky but matches legacy global)
    public static currentWave: number = 1;

    constructor(x: number | undefined, y: number | undefined, size: string, canvasWidth: number, canvasHeight: number, _callbacks: GameCallbacks) {
        this.sizeStr = size;
        if (size === 'large') { this.r = 50; this.hp = 3; }
        else if (size === 'medium') { this.r = 25; this.hp = 2; }
        else { this.r = 12; this.hp = 1; }

        const levelColors = ['#f0f', '#0f0', '#fa0', '#0ff', '#f00'];
        this.col = levelColors[(Asteroid.currentWave - 1) % levelColors.length];

        if (x === undefined) {
            const edge = Math.random() < 0.5;
            if (edge) {
                this.x = Math.random() < 0.5 ? -50 : canvasWidth + 50;
                this.y = Math.random() * canvasHeight;
            } else {
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() < 0.5 ? -50 : canvasHeight + 50;
            }
            const targetX = Math.random() * (canvasWidth * 0.8) + (canvasWidth * 0.1);
            const targetY = Math.random() * (canvasHeight * 0.8) + (canvasHeight * 0.1);
            this.angle = Math.atan2(targetY - this.y, targetX - this.x) + (Math.random() - 0.5) * 0.5;
        } else {
            this.x = x;
            this.y = y!;
            this.angle = Math.random() * Math.PI * 2;
        }

        const baseSpeed = Math.random() * 40 + 20;
        const waveMult = 1 + Math.min(Asteroid.currentWave * 0.04, 1.0);
        const slowMult = 1 - ((persistence.profile.upgrades.time || 0) * 0.15);
        const spd = baseSpeed * waveMult * slowMult;
        this.vx = Math.cos(this.angle) * spd;
        this.vy = Math.sin(this.angle) * spd;
        this.sprite = spriteCache.getAsteroid(size, this.col);
    }

    public update(dt: number, canvasWidth: number, canvasHeight: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < -60) this.x = canvasWidth + 60;
        if (this.x > canvasWidth + 60) this.x = -60;
        if (this.y < -60) this.y = canvasHeight + 60;
        if (this.y > canvasHeight + 60) this.y = -60;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        ctx.restore();
    }

    public hit(dmg: number, bulletVx: number, bulletVy: number, callbacks: GameCallbacks, allAsteroids: Asteroid[], combo: number) {
        this.hp -= dmg;
        let knock = (persistence.profile.upgrades.knock || 0) * 100;
        if (bulletVx && bulletVy && knock > 0) {
            let mag = Math.sqrt(bulletVx ** 2 + bulletVy ** 2);
            if (mag > 0) {
                this.vx += (bulletVx / mag) * knock;
                this.vy += (bulletVy / mag) * knock;
            }
        }

        if (this.hp <= 0) {
            this.break(callbacks, allAsteroids, combo);
        } else {
            for (let i = 0; i < 3; i++) callbacks.spawnParticle(this.x, this.y, '#fff');
        }
    }

    public break(callbacks: GameCallbacks, allAsteroids: Asteroid[], combo: number) {
        this.dead = true;
        tutorialSystem.checkAsteroidDestroyed();

        callbacks.onCombo(); // Increment combo
        audioSystem.playExplosion(this.sizeStr, 1 + (combo * 0.1));

        if ((persistence.profile.upgrades.blast || 0) > 0) {
            let range = 100 + (persistence.profile.upgrades.blast * 20);
            allAsteroids.forEach(a => {
                if (a !== this && !a.dead && (a.x - this.x) ** 2 + (a.y - this.y) ** 2 < range ** 2) {
                    a.hp--;
                    if (a.hp <= 0) a.break(callbacks, allAsteroids, combo); // Chain reaction!
                }
            });
            for (let i = 0; i < 8; i++) callbacks.spawnParticle(this.x, this.y, '#f60');
        }

        let baseShards = this.sizeStr === 'large' ? 3 : (this.sizeStr === 'medium' ? 2 : 1);
        let comboBonus = Math.floor(combo / 5);
        let totalShards = baseShards + comboBonus;
        persistence.addShards(totalShards);

        let textCol = comboBonus > 0 ? '#ffd700' : '#b0f';
        let textStr = comboBonus > 0 ? `+${totalShards}` : `+${totalShards}`;
        callbacks.spawnText(this.x, this.y, textStr, textCol);

        let pts = 0;
        if (this.sizeStr === 'large') {
            callbacks.spawnAsteroid(this.x, this.y, 'medium');
            callbacks.spawnAsteroid(this.x, this.y, 'medium');
            pts = 20;
        } else if (this.sizeStr === 'medium') {
            callbacks.spawnAsteroid(this.x, this.y, 'small');
            callbacks.spawnAsteroid(this.x, this.y, 'small');
            pts = 50;
        } else {
            pts = 100;
        }

        let luck = (persistence.profile.upgrades.luck || 0) * 0.02;
        if (Math.random() < 0.03 + luck) {
            const types = ['SHIELD', 'NUKE', 'SPEED'];
            callbacks.spawnPowerUp(new PowerUp(this.x, this.y, types[Math.floor(Math.random() * types.length)]));
        }

        let scoreMult = 1 + ((persistence.profile.upgrades.score || 0) * 0.1);
        callbacks.onScore(Math.ceil(pts * combo * scoreMult));
    }
}
