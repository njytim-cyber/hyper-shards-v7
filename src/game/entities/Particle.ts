export class Particle {
    public x: number = 0;
    public y: number = 0;
    public col: string = '#fff';
    public life: number = 1.0;
    public vx: number = 0;
    public vy: number = 0;
    public active: boolean = false;

    constructor() { }

    public init(x: number, y: number, col: string) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.life = 1.0;
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * 50 + 20;
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s;
        this.active = true;
    }

    public update(dt: number) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= 0.05;
        if (this.life <= 0) this.active = false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x, this.y, 2, 2);
        ctx.globalAlpha = 1;
    }
}
