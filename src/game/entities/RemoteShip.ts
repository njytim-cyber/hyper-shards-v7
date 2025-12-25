import { Ship } from './Ship';
import type { PlayerState } from '../../bridges/MultiplayerBridge';
import { SKIN_CONFIG } from '../config/ShopConfig';
import type { Pool } from '../core/Pool';
import type { Bullet } from './Bullet';

export class RemoteShip extends Ship {
    private targetState: PlayerState | null = null;
    public id: string;
    public isFiring: boolean = false;

    constructor(id: string) {
        // Pass null pool - remote ships don't fire bullets
        super(null as unknown as Pool<Bullet>);
        this.id = id;
        this.skin = { ...SKIN_CONFIG.default, name: 'Unknown' };
    }

    public updateState(state: PlayerState) {
        this.targetState = state;

        // Immediate snap for rotation, Lerp for position in update
        this.angle = state.rotation;
        this.isFiring = state.isFiring;

        // Sync vital stats
        this.shields = state.shield;
        // RemoteShip inherits 'maxLives' from Ship (3), but we should probably track 'lives' directly locally if needed visually
        // But for HUD display, we pass the raw state from bridge to UI directly in GameEngine.
        // Updating it here is good for consistency if we draw health bars above ships later.
    }

    public override update(_dt: number) {
        void _dt;  // Unused - position from network
        if (!this.targetState) return;

        // Simple Lerp
        const t = 0.5;
        this.x += (this.targetState.x - this.x) * t;
        this.y += (this.targetState.y - this.y) * t;
    }

    public override draw(ctx: CanvasRenderingContext2D) {
        // Draw stats (name)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.id.substring(0, 4), 0, -30);
        ctx.restore();

        // Standard ship draw
        super.draw(ctx);
    }
}
