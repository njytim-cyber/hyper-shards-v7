export class FloatingText {
    public x: number = 0;
    public y: number = 0;
    public text: string = '';
    public color: string = '#fff';
    public life: number = 1.0;
    public vy: number = -30;
    public active: boolean = false;

    constructor() { }

    public init(x: number, y: number, text: string, color: string) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;
        this.vy = -30;
        this.active = true;
    }

    public update(dt: number) {
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.active = false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}
