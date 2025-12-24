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

    constructor() {
        Object.values(this.tracks).forEach(t => {
            t.loop = true;
            t.volume = 0.4;
        });
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

    private playTone(freq: number, type: OscillatorType, dur: number, vol: number = 0.5) {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    // SFX Methods
    public playShoot(pitchMod: number = 1) { this.playTone(880 * pitchMod, 'square', 0.1, 0.3); }
    public playExplosion(sz: string, pitchMod: number = 1) { this.playTone(100 * pitchMod, 'sawtooth', sz === 'large' ? 0.4 : 0.2, 0.4); }
    public playPowerUp() {
        if (!this.ctx) return;
        this.playTone(440, 'sine', 0.1);
        setTimeout(() => this.playTone(880, 'sine', 0.2), 100);
    }
    public playShard() { this.playTone(1200, 'sine', 0.1, 0.1); }
    public playHeavy(pitchMod: number = 1) { this.playTone(150 * pitchMod, 'square', 0.3, 0.5); }
    public playDash() { this.playTone(600, 'sine', 0.2, 0.5); }
    public playNuke() { this.playTone(100, 'sawtooth', 1.0, 0.8); }
    public playAlarm() { this.playTone(400, 'sawtooth', 1.5, 0.4); }
    public playComboUp(val: number) {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400 + ((val || 1) * 100), this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
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
