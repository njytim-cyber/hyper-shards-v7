/**
 * Gamepad System
 * Provides controller input handling using the Gamepad API.
 * Supports Xbox, PlayStation, and generic controllers.
 */

export interface GamepadState {
    // Axes (analog sticks)
    leftStickX: number;
    leftStickY: number;
    rightStickX: number;
    rightStickY: number;

    // Buttons (pressed state)
    a: boolean;      // Fire / Confirm
    b: boolean;      // Dash / Back
    x: boolean;      // Swap weapon
    y: boolean;      // Special
    lb: boolean;     // Left bumper
    rb: boolean;     // Right bumper
    lt: number;      // Left trigger (0-1)
    rt: number;      // Right trigger (0-1)
    start: boolean;  // Pause
    back: boolean;   // Menu
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
}

const DEFAULT_DEADZONE = 0.15;

class GamepadSystem {
    private gamepads: Map<number, Gamepad> = new Map();
    private previousState: GamepadState | null = null;
    private deadzone: number = DEFAULT_DEADZONE;
    private connected: boolean = false;

    constructor() {
        this.setupListeners();
    }

    private setupListeners() {
        window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
            console.log(`[Gamepad] Connected: ${e.gamepad.id}`);
            this.gamepads.set(e.gamepad.index, e.gamepad);
            this.connected = true;
        });

        window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
            console.log(`[Gamepad] Disconnected: ${e.gamepad.id}`);
            this.gamepads.delete(e.gamepad.index);
            this.connected = this.gamepads.size > 0;
        });
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public setDeadzone(value: number) {
        this.deadzone = Math.max(0, Math.min(0.5, value));
    }

    private applyDeadzone(value: number): number {
        if (Math.abs(value) < this.deadzone) return 0;
        // Remap to full range after deadzone
        const sign = value > 0 ? 1 : -1;
        return sign * ((Math.abs(value) - this.deadzone) / (1 - this.deadzone));
    }

    /**
     * Poll the current gamepad state.
     * Call this every frame in the game loop.
     */
    public poll(): GamepadState | null {
        // Refresh gamepad references (required for Chrome)
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
            if (gp) this.gamepads.set(gp.index, gp);
        }

        // Use first connected gamepad
        const gamepad = this.gamepads.values().next().value;
        if (!gamepad) return null;

        const state: GamepadState = {
            // Standard mapping (Xbox layout)
            leftStickX: this.applyDeadzone(gamepad.axes[0] || 0),
            leftStickY: this.applyDeadzone(gamepad.axes[1] || 0),
            rightStickX: this.applyDeadzone(gamepad.axes[2] || 0),
            rightStickY: this.applyDeadzone(gamepad.axes[3] || 0),

            a: gamepad.buttons[0]?.pressed || false,
            b: gamepad.buttons[1]?.pressed || false,
            x: gamepad.buttons[2]?.pressed || false,
            y: gamepad.buttons[3]?.pressed || false,
            lb: gamepad.buttons[4]?.pressed || false,
            rb: gamepad.buttons[5]?.pressed || false,
            lt: gamepad.buttons[6]?.value || 0,
            rt: gamepad.buttons[7]?.value || 0,
            back: gamepad.buttons[8]?.pressed || false,
            start: gamepad.buttons[9]?.pressed || false,
            dpadUp: gamepad.buttons[12]?.pressed || false,
            dpadDown: gamepad.buttons[13]?.pressed || false,
            dpadLeft: gamepad.buttons[14]?.pressed || false,
            dpadRight: gamepad.buttons[15]?.pressed || false,
        };

        this.previousState = state;
        return state;
    }

    /**
     * Check if a button was just pressed this frame (edge detection).
     */
    public wasJustPressed(button: keyof GamepadState): boolean {
        const current = this.poll();
        if (!current || !this.previousState) return false;

        const curr = current[button];
        const prev = this.previousState[button];

        if (typeof curr === 'boolean' && typeof prev === 'boolean') {
            return curr && !prev;
        }
        return false;
    }

    /**
     * Convert gamepad state to movement vector for Ship input.
     */
    public getMovementVector(): { x: number; y: number } {
        const state = this.poll();
        if (!state) return { x: 0, y: 0 };

        let x = state.leftStickX;
        let y = state.leftStickY;

        // Also check D-pad
        if (state.dpadLeft) x = -1;
        if (state.dpadRight) x = 1;
        if (state.dpadUp) y = -1;
        if (state.dpadDown) y = 1;

        return { x, y };
    }

    /**
     * Get aim direction from right stick.
     */
    public getAimDirection(): { x: number; y: number } | null {
        const state = this.poll();
        if (!state) return null;

        const x = state.rightStickX;
        const y = state.rightStickY;

        // Only return if stick is moved
        if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) return null;
        return { x, y };
    }

    /**
     * Check if fire button/trigger is held.
     */
    public isFiring(): boolean {
        const state = this.poll();
        if (!state) return false;
        return state.a || state.rt > 0.5;
    }

    /**
     * Check if dash button is pressed.
     */
    public isDashing(): boolean {
        const state = this.poll();
        if (!state) return false;
        return state.b || state.lb;
    }

    /**
     * Apply vibration feedback (if supported).
     */
    public vibrate(duration: number = 100, intensity: number = 0.5) {
        const gamepad = this.gamepads.values().next().value;
        if (gamepad?.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration,
                weakMagnitude: intensity * 0.5,
                strongMagnitude: intensity
            });
        }
    }
}

export const gamepadSystem = new GamepadSystem();
