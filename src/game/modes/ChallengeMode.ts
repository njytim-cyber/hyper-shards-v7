
import { CHALLENGE_MODIFIERS, type ModifierType } from '../config/ChallengeModifiers';

export class ChallengeMode {
    public static getDailySeed(): number {
        const date = new Date();
        // Seed based on YYYYMMDD
        return parseInt(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`);
    }

    // Simple pseudo-random number generator
    private static mulberry32(a: number) {
        return function () {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    }

    public static getDailyChallenge() {
        const seed = this.getDailySeed();
        const rand = this.mulberry32(seed);

        const keys = Object.keys(CHALLENGE_MODIFIERS) as ModifierType[];

        // Pick 2 random modifiers
        const mod1Index = Math.floor(rand() * keys.length);
        let mod2Index = Math.floor(rand() * keys.length);
        while (mod2Index === mod1Index) {
            mod2Index = Math.floor(rand() * keys.length);
        }

        const modifiers = [
            CHALLENGE_MODIFIERS[keys[mod1Index]],
            CHALLENGE_MODIFIERS[keys[mod2Index]]
        ];

        return {
            date: new Date().toLocaleDateString(),
            modifiers: modifiers,
            seed: seed
        };
    }
}
