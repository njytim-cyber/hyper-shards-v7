export interface UserProfile {
    shards: number;
    highScore: number;
    equippedSkin: string;
    unlockedSkins: string[];
    upgrades: Record<string, number>;
    maxWave: number;
    tutorialComplete: boolean;
}

export class Persistence {
    public profile: UserProfile = {
        shards: 0,
        highScore: 0,
        equippedSkin: 'default',
        unlockedSkins: ['default'],
        upgrades: {},
        maxWave: 0,
        tutorialComplete: false
    };

    constructor() {
        this.load();
    }

    public save() {
        localStorage.setItem('hyperShardsProfile', JSON.stringify(this.profile));
        // Dispatch event for UI updates if needed
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: this.profile }));
    }

    public load() {
        const stored = localStorage.getItem('hyperShardsProfile');
        if (stored) {
            const d = JSON.parse(stored);
            this.profile = {
                ...this.profile,
                ...d,
                upgrades: { ...this.profile.upgrades, ...d.upgrades }
            };
        }
    }

    public addShards(amount: number) {
        let mult = 1 + ((this.profile.upgrades.greed || 0) * 0.2);
        this.profile.shards += Math.ceil(amount * mult);
        this.save();
    }
}

export const persistence = new Persistence();
