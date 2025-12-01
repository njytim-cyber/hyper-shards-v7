import { persistence } from '../systems/Persistence';

export class PowerUp {
    public x: number;
    public y: number;
    public type: string;
    public active: boolean = true;
    public radius: number = 12;
    public life: number = 10;

    constructor(x: number, y: number, type: string) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public update(dt: number, shipX: number, shipY: number, shipDead: boolean) {
        this.y += 30 * dt;
        this.life -= dt;
        if (this.life <= 0) this.active = false;

        if (!shipDead) {
            const dist = Math.sqrt((shipX - this.x) ** 2 + (shipY - this.y) ** 2);
            const magnetRange = 100 * (1 + ((persistence.profile.upgrades.magnet || 0) * 0.5));
            if (dist < magnetRange) {
                const angle = Math.atan2(shipY - this.y, shipX - this.x);
                this.x += Math.cos(angle) * 200 * dt;
                this.y += Math.sin(angle) * 200 * dt;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.type === 'SHIELD') {
            ctx.fillStyle = '#0ff'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', 0, 0);
        } else if (this.type === 'NUKE') {
            ctx.fillStyle = '#f00'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#000'; ctx.fillText('N', 0, 0);
        } else if (this.type === 'SPEED') {
            ctx.fillStyle = '#ff0'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#000'; ctx.fillText('⚡', 0, 1);
        }
        ctx.restore();
    }
}
