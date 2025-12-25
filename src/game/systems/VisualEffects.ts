
import { GameEngine } from '../core/GameEngine';

export class VisualEffects {
    private engine: GameEngine;

    // Screen shake
    private shakeAmount: number = 0;
    private shakeDecay: number = 0.9;
    private shakePhase: number = 0; // Deterministic shake (no Math.random per frame)

    // Flash overlay
    private flashDuration: number = 0;
    private flashColor: string = '#fff';
    private flashAlpha: number = 0;

    constructor(engine: GameEngine) {
        this.engine = engine;
    }

    public update(dt: number) {
        // Shake decay
        if (this.shakeAmount > 0) {
            this.shakeAmount *= this.shakeDecay;
            this.shakePhase += 0.7; // Advance phase for deterministic oscillation
            if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        }

        // Flash decay
        if (this.flashAlpha > 0) {
            this.flashAlpha -= dt * (1.0 / this.flashDuration);
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }
    }

    public applyTransform(ctx: CanvasRenderingContext2D) {
        if (this.shakeAmount > 0) {
            // Deterministic shake using sinusoidal oscillation (no Math.random)
            const dx = Math.sin(this.shakePhase * 1.1) * this.shakeAmount * 0.5;
            const dy = Math.cos(this.shakePhase * 1.3) * this.shakeAmount * 0.5;
            ctx.translate(dx, dy);
        }
    }

    public drawFlash(ctx: CanvasRenderingContext2D, width: number, height: number) {
        if (this.flashAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    }

    public shake(amount: number) {
        this.shakeAmount = Math.min(this.shakeAmount + amount, 25);
    }

    public triggerFlash(duration: number, color: string = '#fff') {
        this.flashDuration = duration;
        this.flashColor = color;
        this.flashAlpha = 0.5; // Start at 50% opacity
    }

    public triggerComboPulse(combo: number) {
        this.shake(Math.min(combo * 1.5, 15));
        // Could spawn a special "COMBO X" text center screen here if needed
    }

    public explosion(x: number, y: number, color: string, count: number = 10) {
        const baseColor = color;
        for (let i = 0; i < count; i++) {
            // Variation in color?
            this.engine.spawnParticle(x, y, baseColor);
        }
    }

    public text(x: number, y: number, text: string, color: string = '#fff') {
        this.engine.spawnText(x, y, text, color);
    }
}
