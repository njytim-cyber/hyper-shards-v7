// Assist Pilot System
// Allows another pilot to temporarily assist the player during waves

import type { PilotId } from '../config/PilotConfig';
import { PILOT_CLASSES } from '../config/PilotConfig';
import { getDialogue, getRandomAssistPilot } from '../config/PilotDialogueConfig';
import { spriteCache } from './SpriteCache';
import { audioSystem } from './AudioSystem';

export interface AssistPilotCallbacks {
    onDialogue: (pilotId: PilotId, text: string, pilotName: string, icon: string, color: string) => void;
    onAssistStart: () => void;
    onAssistEnd: () => void;
    spawnBullet: (x: number, y: number, angle: number, type: string, damage: number) => void;
}

export class AssistPilot {
    public active: boolean = false;
    public pilotId: PilotId | null = null;
    public x: number = 0;
    public y: number = 0;
    public angle: number = 0;
    public duration: number = 0;  // Time remaining
    public fireTimer: number = 0;

    private entryPhase: boolean = false;
    private entryTimer: number = 0;
    private exitPhase: boolean = false;
    private exitTimer: number = 0;
    private dialogueTimer: number = 0;

    private callbacks: AssistPilotCallbacks | null = null;
    private targetX: number = 0;
    private targetY: number = 0;

    // Call this when starting a wave that should trigger assist
    public activate(
        playerPilotId: PilotId,
        _canvasWidth: number,
        canvasHeight: number,
        callbacks: AssistPilotCallbacks,
        duration: number = 15
    ) {
        this.pilotId = getRandomAssistPilot(playerPilotId);
        this.callbacks = callbacks;
        this.duration = duration;
        this.active = true;
        this.entryPhase = true;
        this.entryTimer = 2;  // 2 seconds for entry dialogue
        this.exitPhase = false;
        this.exitTimer = 0;
        this.dialogueTimer = 0;

        // Start off-screen
        this.x = -100;
        this.y = canvasHeight / 2;
        this.angle = 0;

        // Target position
        this.targetX = 150;
        this.targetY = canvasHeight * 0.3;

        // Show entry dialogue
        const pilot = PILOT_CLASSES[this.pilotId];
        const dialogue = getDialogue(this.pilotId, 'assistEntry');
        callbacks.onDialogue(this.pilotId, dialogue, pilot.name, pilot.icon, pilot.color);

        audioSystem.playPowerUp();
        callbacks.onAssistStart();
    }

    public deactivate() {
        if (!this.active || !this.callbacks || !this.pilotId) return;

        this.exitPhase = true;
        this.exitTimer = 2;

        // Show exit dialogue
        const pilot = PILOT_CLASSES[this.pilotId];
        const dialogue = getDialogue(this.pilotId, 'assistExit');
        this.callbacks.onDialogue(this.pilotId, dialogue, pilot.name, pilot.icon, pilot.color);
    }

    public update(
        dt: number,
        playerX: number,
        playerY: number,
        canvasWidth: number,
        canvasHeight: number,
        enemyPositions: Array<{ x: number; y: number }>
    ) {
        if (!this.active || !this.callbacks || !this.pilotId) return;

        // Entry phase - show dialogue then fly in
        if (this.entryPhase) {
            this.entryTimer -= dt;
            // Fly in from left
            this.x += 200 * dt;
            if (this.x >= this.targetX) {
                this.x = this.targetX;
            }
            if (this.entryTimer <= 0) {
                this.entryPhase = false;
            }
            return;
        }

        // Exit phase - fly out
        if (this.exitPhase) {
            this.exitTimer -= dt;
            this.x += 300 * dt;  // Fly right
            if (this.exitTimer <= 0 || this.x > canvasWidth + 100) {
                this.active = false;
                this.pilotId = null;
                this.callbacks.onAssistEnd();
            }
            return;
        }

        // Active phase
        this.duration -= dt;

        // Show random dialogue occasionally
        this.dialogueTimer -= dt;
        if (this.dialogueTimer <= 0) {
            const pilot = PILOT_CLASSES[this.pilotId];
            const dialogue = getDialogue(this.pilotId, 'assistActive');
            this.callbacks.onDialogue(this.pilotId, dialogue, pilot.name, pilot.icon, pilot.color);
            this.dialogueTimer = 5 + Math.random() * 5;  // Every 5-10 seconds
        }

        // Movement - hover near player but offset
        const offsetX = 100;
        const offsetY = -80;
        this.targetX = Math.max(80, Math.min(canvasWidth - 80, playerX - offsetX));
        this.targetY = Math.max(80, Math.min(canvasHeight - 80, playerY + offsetY));

        // Smooth follow
        this.x += (this.targetX - this.x) * 3 * dt;
        this.y += (this.targetY - this.y) * 3 * dt;

        // Aim at nearest enemy
        if (enemyPositions.length > 0) {
            let nearestDist = Infinity;
            let nearestAngle = 0;
            for (const enemy of enemyPositions) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = dx * dx + dy * dy;
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestAngle = Math.atan2(dy, dx);
                }
            }
            this.angle = nearestAngle;
        }

        // Shooting
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && enemyPositions.length > 0) {
            this.callbacks.spawnBullet(
                this.x + Math.cos(this.angle) * 25,
                this.y + Math.sin(this.angle) * 25,
                this.angle,
                'BLASTER',
                0.5  // Less damage than player
            );
            audioSystem.playShoot(1.2);  // Higher pitch to differentiate
            this.fireTimer = 0.3;  // Fire rate
        }

        // Check if duration ended
        if (this.duration <= 0) {
            this.deactivate();
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (!this.active || !this.pilotId) return;

        const pilot = PILOT_CLASSES[this.pilotId];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw ship with pilot color
        const img = spriteCache.getShip(pilot.color, 'fighter');
        ctx.save();
        ctx.rotate(Math.PI / 2);
        ctx.globalAlpha = 0.8;  // Slightly transparent to indicate assist
        ctx.drawImage(img, -20, -20);
        ctx.restore();

        // Draw pilot icon above ship when not moving fast
        ctx.rotate(-this.angle);
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pilot.icon, 0, -30);

        ctx.restore();
    }
}

// Singleton instance
export const assistPilot = new AssistPilot();
