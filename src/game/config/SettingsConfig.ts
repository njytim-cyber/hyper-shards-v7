// Settings Configuration
// Persisted user preferences for audio, controls, and display

export interface GameSettings {
    // Audio
    masterVolume: number;  // 0-100
    musicVolume: number;   // 0-100
    sfxVolume: number;     // 0-100

    // Controls
    keybindings: {
        moveUp: string;
        moveDown: string;
        moveLeft: string;
        moveRight: string;
        dash: string;
        pause: string;
        swap: string;
    };

    // Display
    fullscreen: boolean;
    showFps: boolean;

    // Accessibility
    screenShake: boolean;
    reducedMotion: boolean;

    // Language
    language: 'en' | 'fr' | 'de' | 'es' | 'it';
}

const DEFAULT_SETTINGS: GameSettings = {
    masterVolume: 100,
    musicVolume: 80,
    sfxVolume: 100,

    keybindings: {
        moveUp: 'KeyW',
        moveDown: 'KeyS',
        moveLeft: 'KeyA',
        moveRight: 'KeyD',
        dash: 'Space',
        pause: 'KeyP',
        swap: 'KeyQ',
    },

    fullscreen: false,
    showFps: false,

    screenShake: true,
    reducedMotion: false,

    language: 'en',
};

const STORAGE_KEY = 'hyperShardsSettings';

class SettingsManager {
    private settings: GameSettings;

    constructor() {
        this.settings = this.load();
    }

    private load(): GameSettings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    public save(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
            window.dispatchEvent(new CustomEvent('settings-updated', { detail: this.settings }));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    public get<K extends keyof GameSettings>(key: K): GameSettings[K] {
        return this.settings[key];
    }

    public set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
        this.settings[key] = value;
        this.save();
    }

    public getKeybinding(action: keyof GameSettings['keybindings']): string {
        return this.settings.keybindings[action];
    }

    public setKeybinding(action: keyof GameSettings['keybindings'], key: string): void {
        this.settings.keybindings[action] = key;
        this.save();
    }

    public getAll(): GameSettings {
        return { ...this.settings };
    }

    public reset(): void {
        this.settings = { ...DEFAULT_SETTINGS };
        this.save();
    }

    // Computed volume for audio system (0-1 range)
    public getMasterVolumeNormalized(): number {
        return this.settings.masterVolume / 100;
    }

    public getMusicVolumeNormalized(): number {
        return (this.settings.masterVolume / 100) * (this.settings.musicVolume / 100);
    }

    public getSfxVolumeNormalized(): number {
        return (this.settings.masterVolume / 100) * (this.settings.sfxVolume / 100);
    }
}

export const settingsManager = new SettingsManager();

// Key display names for UI
export const KEY_DISPLAY_NAMES: Record<string, string> = {
    'KeyW': 'W',
    'KeyA': 'A',
    'KeyS': 'S',
    'KeyD': 'D',
    'KeyP': 'P',
    'KeyQ': 'Q',
    'Space': 'SPACE',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'ShiftLeft': 'L-SHIFT',
    'ShiftRight': 'R-SHIFT',
    'Enter': 'ENTER',
    'Escape': 'ESC',
};

export const getKeyDisplayName = (code: string): string => {
    return KEY_DISPLAY_NAMES[code] || code.replace('Key', '');
};

// Language display names
export const LANGUAGE_NAMES: Record<GameSettings['language'], string> = {
    'en': 'English',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'it': 'Italiano',
};
