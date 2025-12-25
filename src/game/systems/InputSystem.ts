export class InputSystem {
    public keys: Record<string, boolean> = {
        w: false, a: false, s: false, d: false,
        q: false, e: false,
        ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
        Space: false
    };
    public mouse: { x: number, y: number, down: boolean } = { x: 0, y: 0, down: false };
    public touchSticks: {
        left: { active: boolean, vecX: number, vecY: number, id: number | null, ox: number, oy: number },
        right: { active: boolean, vecX: number, vecY: number, id: number | null, ox: number, oy: number }
    } = {
            left: { active: false, vecX: 0, vecY: 0, id: null, ox: 0, oy: 0 },
            right: { active: false, vecX: 0, vecY: 0, id: null, ox: 0, oy: 0 }
        };

    private callbacks: { onPause: () => void, onSwap: () => void, onDash: () => void } | null = null;

    constructor() {
        this.init();
    }

    public setCallbacks(callbacks: { onPause: () => void, onSwap: () => void, onDash: () => void }) {
        this.callbacks = callbacks;
    }

    private init() {
        window.addEventListener('keydown', e => {
            switch (e.code) {
                case 'KeyW': this.keys.w = true; break; case 'KeyA': this.keys.a = true; break; case 'KeyS': this.keys.s = true; break; case 'KeyD': this.keys.d = true; break;
                case 'KeyQ': this.keys.q = true; break; case 'KeyE': this.keys.e = true; break;
                case 'ArrowUp': this.keys.ArrowUp = true; break; case 'ArrowLeft': this.keys.ArrowLeft = true; break; case 'ArrowDown': this.keys.ArrowDown = true; break; case 'ArrowRight': this.keys.ArrowRight = true; break;
                case 'Space': this.keys.Space = true; break;
                case 'ShiftLeft': case 'ShiftRight': if (this.callbacks) this.callbacks.onDash(); break;
                case 'KeyP': case 'Escape': if (this.callbacks) this.callbacks.onPause(); break;
                case 'KeyF': if (this.callbacks) this.callbacks.onSwap(); break;
            }
        });

        window.addEventListener('keyup', e => {
            switch (e.code) {
                case 'KeyW': this.keys.w = false; break; case 'KeyA': this.keys.a = false; break; case 'KeyS': this.keys.s = false; break; case 'KeyD': this.keys.d = false; break;
                case 'KeyQ': this.keys.q = false; break; case 'KeyE': this.keys.e = false; break;
                case 'ArrowUp': this.keys.ArrowUp = false; break; case 'ArrowLeft': this.keys.ArrowLeft = false; break; case 'ArrowDown': this.keys.ArrowDown = false; break; case 'ArrowRight': this.keys.ArrowRight = false; break;
                case 'Space': this.keys.Space = false; break;
            }
        });

        window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
    }

    public attachTouchListeners(canvas: HTMLCanvasElement) {
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if ((t.target as HTMLElement).closest('.mobile-btn') || (t.target as HTMLElement).closest('#mobile-pause-btn')) continue;

                if (t.clientX < window.innerWidth / 2) {
                    this.touchSticks.left.active = true;
                    this.touchSticks.left.id = t.identifier;
                    this.touchSticks.left.ox = t.clientX;
                    this.touchSticks.left.oy = t.clientY;
                } else {
                    this.touchSticks.right.active = true;
                    this.touchSticks.right.id = t.identifier;
                    this.touchSticks.right.ox = t.clientX;
                    this.touchSticks.right.oy = t.clientY;
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (this.touchSticks.left.active && t.identifier === this.touchSticks.left.id) {
                    const dx = t.clientX - this.touchSticks.left.ox;
                    const dy = t.clientY - this.touchSticks.left.oy;
                    this.touchSticks.left.vecX = Math.max(-1, Math.min(1, dx / 50));
                    this.touchSticks.left.vecY = Math.max(-1, Math.min(1, dy / 50));
                }
                if (this.touchSticks.right.active && t.identifier === this.touchSticks.right.id) {
                    const dx = t.clientX - this.touchSticks.right.ox;
                    const dy = t.clientY - this.touchSticks.right.oy;
                    this.touchSticks.right.vecX = Math.max(-1, Math.min(1, dx / 50));
                    this.touchSticks.right.vecY = Math.max(-1, Math.min(1, dy / 50));
                }
            }
        }, { passive: false });

        const endTouch = (e: TouchEvent) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (this.touchSticks.left.active && e.changedTouches[i].identifier === this.touchSticks.left.id) {
                    this.touchSticks.left.active = false;
                    this.touchSticks.left.vecX = 0;
                    this.touchSticks.left.vecY = 0;
                }
                if (this.touchSticks.right.active && e.changedTouches[i].identifier === this.touchSticks.right.id) {
                    this.touchSticks.right.active = false;
                    this.touchSticks.right.vecX = 0;
                    this.touchSticks.right.vecY = 0;
                }
            }
        };
        canvas.addEventListener('touchend', endTouch);
        canvas.addEventListener('touchcancel', endTouch);
    }

    /**
     * Get unified movement vector from keyboard, touch, or gamepad.
     * Returns normalized direction for Ship movement.
     */
    public getMovementVector(): { x: number; y: number } {
        // Priority: Touch > Gamepad > Keyboard
        if (this.touchSticks.left.active) {
            return { x: this.touchSticks.left.vecX, y: this.touchSticks.left.vecY };
        }

        // Import gamepad dynamically to avoid circular dependency
        const gp = (globalThis as Record<string, unknown>).__gamepadSystem as { isConnected: () => boolean; getMovementVector: () => { x: number; y: number } } | undefined;
        if (gp && gp.isConnected()) {
            const vec = gp.getMovementVector();
            if (vec.x !== 0 || vec.y !== 0) return vec;
        }

        // Keyboard fallback
        let x = 0, y = 0;
        if (this.keys.w || this.keys.ArrowUp) y -= 1;
        if (this.keys.s || this.keys.ArrowDown) y += 1;
        if (this.keys.a || this.keys.ArrowLeft) x -= 1;
        if (this.keys.d || this.keys.ArrowRight) x += 1;
        return { x, y };
    }

    /**
     * Check if fire is active (any input source).
     */
    public isFiring(): boolean {
        if (this.mouse.down) return true;
        if (this.touchSticks.right.active) return true;
        const gp = (globalThis as Record<string, unknown>).__gamepadSystem as { isFiring: () => boolean } | undefined;
        if (gp && gp.isFiring()) return true;
        return false;
    }
}

export const inputSystem = new InputSystem();
