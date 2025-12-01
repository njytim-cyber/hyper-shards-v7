import { Asteroid } from './Asteroid';

export class Bullet {
    public x: number = 0;
    public y: number = 0;
    public angle: number = 0;
    public type: string = 'BLASTER';
    public damage: number = 1;
    public active: boolean = false;
    public pierce: number = 1;
    public radius: number = 2;
    public homing: boolean = false;
    public speed: number = 600;
    public life: number = 1.5;
    public color: string = '#ff0';
    public isEnemy: boolean = false;
    public vx: number = 0;
    public vy: number = 0;

    constructor() { }

    public init(x: number, y: number, angle: number, type: string, dmg: number, pierce: number = 1, size: number = 2, homing: boolean = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.type = type;
        this.damage = dmg;
        this.active = true;
        this.pierce = pierce;
        this.radius = size;
        this.homing = homing;
        this.speed = 600;
        this.life = 1.5;
        this.color = '#ff0';
        this.isEnemy = false;

        if (type === 'SPREAD') { this.speed = 500; this.life = 0.6; this.color = '#0f0'; }
        else if (type === 'RAPID') { this.speed = 700; this.life = 1.2; this.color = '#f0f'; }
        else if (type === 'HEAVY') { this.speed = 400; this.life = 2.0; this.color = '#f00'; }
        else if (type === 'BOSS') { this.speed = 300; this.life = 3.0; this.color = '#f30'; this.radius = 4; this.isEnemy = true; }

        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    public update(dt: number, asteroids: Asteroid[]) {
        if (this.homing && !this.isEnemy && asteroids.length > 0) {
            let nearest: Asteroid | null = null;
            let minDist = 100000;
            for (let a of asteroids) {
                let d = (a.x - this.x) ** 2 + (a.y - this.y) ** 2;
                if (d < minDist) {
                    minDist = d;
                    nearest = a;
                }
            }
            if (nearest) {
                let targetAngle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                let diff = targetAngle - this.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.angle += diff * 5 * dt;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
            }
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.active = false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        if (this.isEnemy) {
            ctx.shadowColor = '#f00'; ctx.shadowBlur = 8;
        } else {
            ctx.shadowColor = this.color; ctx.shadowBlur = 5;
        }
        ctx.shadowBlur = 0;
    }
}
