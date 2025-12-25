// Extend Window interface for webkit prefix
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

export class AudioSystem {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private initialized: boolean = false;

    private tracks: Record<string, HTMLAudioElement> = {
        load: new Audio('/music/load.mp3'),
        shop: new Audio('/music/shop.mp3'),
        wave: new Audio('/music/wave.mp3'),
        boss: new Audio('/music/boss.mp3')
    };
    private currentTrack: HTMLAudioElement | null = null;
    public lastTrackName: string | null = null;

    private sfx: Record<string, HTMLAudioElement[]> = {};

    // Throttle: minimum ms between plays of the same SFX (prevents audio spam)
    private sfxLastPlayed: Record<string, number> = {};
    private readonly SFX_THROTTLE_MS = 80; // Increased to 80ms (max ~12 sounds/sec) to reduce spam

    // Dynamic pool sizes based on sound frequency
    // Only includes sounds that exist in /public/sfx/
    private readonly sfxPoolConfig: Record<string, number> = {
        // Battle sounds
        'shoot_blaster': 3, 'shoot_spread': 2,
        'explosion_small': 3, 'explosion_large': 2,
        'hit_player': 2,
        // UI/rare sounds
        'powerup_pickup': 1, 'powerup_shield': 1,
        'ui_click': 1, 'ui_error': 1,
        'victory': 1, 'defeat': 1
    };

    constructor() {
        Object.values(this.tracks).forEach(t => {
            t.loop = true;
            t.volume = 0.4;
        });
        // SFX pools are now lazy-loaded in getSfxPool() - no upfront Audio creation
    }

    // Lazy-load SFX pool on first use with dynamic sizing
    private getSfxPool(name: string): HTMLAudioElement[] | null {
        const poolSize = this.sfxPoolConfig[name];
        if (!poolSize) return null;

        if (!this.sfx[name]) {
            // Create pool on-demand with appropriate size
            this.sfx[name] = [];
            for (let i = 0; i < poolSize; i++) {
                const audio = new Audio(`/sfx/${name}.wav`);
                audio.volume = 0.5;
                this.sfx[name].push(audio);
            }
        }
        return this.sfx[name];
    }

    private playSfx(name: string, vol: number = 0.5, pitchMod: number = 1.0) {
        const pool = this.getSfxPool(name);
        if (!pool) return;

        // Throttle check: prevent audio spam during chain explosions/rapid fire
        const now = performance.now();
        const lastPlayed = this.sfxLastPlayed[name] || 0;
        if (now - lastPlayed < this.SFX_THROTTLE_MS) return;
        this.sfxLastPlayed[name] = now;

        // Find a free channel or oldest one
        const channel = pool.find(a => a.paused) || pool[0];

        channel.volume = Math.min(Math.max(vol, 0), 1);
        channel.currentTime = 0;

        // Note: playbackRate changes pitch
        channel.playbackRate = pitchMod;
        // PreservesPitch set to false allows pitch shifting like chipmunks/slow-mo, 
        // true (default) stretches time without pitch shift. 
        // For game SFX pitch modulation, we often want pitch shift.
        if (channel.preservesPitch !== undefined) {
            channel.preservesPitch = false;
        }

        channel.play().catch(() => { });
    }

    public init() {
        if (this.initialized) return;

        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) {
            console.warn('AudioContext not supported');
            return;
        }
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Unlock audio context on first user interaction
        const unlock = () => {
            if (this.ctx?.state === 'suspended') this.ctx.resume();
            if (this.currentTrack) this.currentTrack.play().catch(() => { });

            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('mousemove', unlock);
            document.removeEventListener('keydown', unlock);
        };

        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
        document.addEventListener('mousemove', unlock);
        document.addEventListener('keydown', unlock);

        this.initialized = true;
    }

    // SFX Methods - using only sounds that exist in /public/sfx/
    public playShoot(pitchMod: number = 1) { this.playSfx('shoot_blaster', 0.4, pitchMod); }
    public playExplosion(sz: string, pitchMod: number = 1) {
        // Map to existing sounds (explosion_boss doesn't exist, use explosion_large)
        const name = sz === 'large' || sz === 'boss' ? 'explosion_large' : 'explosion_small';
        this.playSfx(name, 0.5, pitchMod);
    }
    public playPowerUp() { this.playSfx('powerup_pickup', 0.6); }
    public playShard() { this.playSfx('ui_click', 0.2, 2.0); } // Use ui_click with high pitch
    public playHeavy(pitchMod: number = 1) { this.playSfx('shoot_spread', 0.6, pitchMod); } // Use spread for heavy
    public playDash() { this.playSfx('shoot_blaster', 0.3, 0.5); } // Use blaster low pitch for dash
    public playNuke() { this.playSfx('explosion_large', 1.0, 0.5); } // Use large explosion
    public playAlarm() { this.playSfx('hit_player', 0.5, 1.5); }

    // Combo sounds - fallback to ui_click with varying pitch since combo files don't exist
    public playComboUp(val: number) {
        const pitch = 1.0 + (val * 0.15); // Higher combo = higher pitch
        this.playSfx('ui_click', 0.6, pitch);
    }

    // Music Methods
    public playMusic(name: string) {
        const track = this.tracks[name];
        if (!track) return;

        if (this.currentTrack === track) {
            if (track.paused) track.play().catch(() => { });
            return;
        }

        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }

        this.currentTrack = track;
        this.lastTrackName = name;
        track.play().catch(e => console.warn("Music autoplay prevented:", e));
    }

    public pauseMusic() {
        if (this.currentTrack) this.currentTrack.pause();
    }

    public resumeMusic() {
        if (this.currentTrack) this.currentTrack.play().catch(() => { });
    }
}

export const audioSystem = new AudioSystem();
