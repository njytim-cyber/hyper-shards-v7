// Achievement System
// Tracks player accomplishments with rewards

import { ICONS } from './Icons';

export type AchievementCategory = 'combat' | 'progression' | 'mastery' | 'collection' | 'special';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
    icon: string;  // Emoji
    steamId?: string; // Steam Achievement API name
    tiers: {
        target: number;
        reward: number;  // Shards
        title?: string;  // Optional title unlock
    }[];
    hidden?: boolean;  // Secret achievements
}

export const ACHIEVEMENTS: Achievement[] = [
    // Combat Achievements
    {
        id: 'asteroid_destroyer',
        name: 'Asteroid Destroyer',
        description: 'Destroy asteroids',
        category: 'combat',
        icon: ICONS.Game.Asteroid,
        tiers: [
            { target: 100, reward: 50 },
            { target: 500, reward: 150 },
            { target: 2000, reward: 500, title: 'Rock Crusher' },
        ]
    },
    {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat bosses',
        category: 'combat',
        icon: ICONS.Game.Boss,
        tiers: [
            { target: 5, reward: 100 },
            { target: 25, reward: 300 },
            { target: 100, reward: 1000, title: 'Boss Hunter' },
        ]
    },
    {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Reach combo level',
        category: 'combat',
        icon: ICONS.Game.Fire,
        tiers: [
            { target: 10, reward: 75 },
            { target: 25, reward: 200 },
            { target: 50, reward: 750, title: 'Combo King' },
        ]
    },
    {
        id: 'bullet_hell',
        name: 'Bullet Hell',
        description: 'Fire bullets',
        category: 'combat',
        icon: ICONS.Game.Damage,
        tiers: [
            { target: 1000, reward: 50 },
            { target: 10000, reward: 200 },
            { target: 100000, reward: 1000, title: 'Trigger Happy' },
        ]
    },

    // Progression Achievements
    {
        id: 'wave_survivor',
        name: 'Wave Survivor',
        description: 'Reach wave',
        category: 'progression',
        icon: ICONS.Game.Wave,
        tiers: [
            { target: 5, reward: 50 },
            { target: 10, reward: 150 },
            { target: 20, reward: 500, title: 'Wave Master' },
        ]
    },
    {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Achieve score',
        category: 'progression',
        icon: ICONS.Menu.Awards,
        tiers: [
            { target: 10000, reward: 100 },
            { target: 50000, reward: 300 },
            { target: 200000, reward: 1000, title: 'Score Legend' },
        ]
    },
    {
        id: 'games_played',
        name: 'Dedicated Pilot',
        description: 'Complete games',
        category: 'progression',
        icon: ICONS.Game.Controller,
        tiers: [
            { target: 10, reward: 50 },
            { target: 50, reward: 200 },
            { target: 200, reward: 750, title: 'Veteran Pilot' },
        ]
    },

    // Mastery Achievements
    {
        id: 'no_damage',
        name: 'Untouchable',
        description: 'Complete waves without taking damage',
        category: 'mastery',
        icon: ICONS.Game.Sparkle,
        tiers: [
            { target: 3, reward: 100 },
            { target: 10, reward: 400 },
            { target: 25, reward: 1500, title: 'Ghost' },
        ]
    },
    {
        id: 'speedrun',
        name: 'Speed Demon',
        description: 'Complete boss in under 30 seconds',
        category: 'mastery',
        icon: ICONS.Game.Lightning,
        tiers: [
            { target: 1, reward: 150 },
            { target: 5, reward: 500 },
            { target: 20, reward: 1500, title: 'Speed Runner' },
        ]
    },

    // Collection Achievements
    {
        id: 'shard_collector',
        name: 'Shard Collector',
        description: 'Collect total shards',
        category: 'collection',
        icon: ICONS.Currency.Shard,
        tiers: [
            { target: 1000, reward: 100 },
            { target: 10000, reward: 500 },
            { target: 100000, reward: 2000, title: 'Shard Tycoon' },
        ]
    },
    {
        id: 'powerup_hunter',
        name: 'Power-Up Hunter',
        description: 'Collect power-ups',
        category: 'collection',
        icon: ICONS.Game.Powerup,
        tiers: [
            { target: 50, reward: 75 },
            { target: 250, reward: 300 },
            { target: 1000, reward: 1000, title: 'Power Hungry' },
        ]
    },

    // Special/Hidden Achievements
    {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Destroy your first asteroid',
        category: 'special',
        icon: ICONS.Game.Target,
        tiers: [{ target: 1, reward: 25 }]
    },
    {
        id: 'mothership_slayer',
        name: 'Mothership Slayer',
        description: 'Defeat the Mothership (Wave 20)',
        category: 'special',
        icon: ICONS.Game.Rocket,
        tiers: [{ target: 1, reward: 1000, title: 'Mothership Hunter' }]
    },
    {
        id: 'daily_dedication',
        name: 'Daily Dedication',
        description: 'Claim daily rewards for 7 consecutive days',
        category: 'special',
        icon: ICONS.Menu.Calendar,
        tiers: [{ target: 1, reward: 500, title: 'Daily Hero' }]
    },
    {
        id: 'all_bosses',
        name: 'Boss Rush',
        description: 'Defeat all unique boss types',
        category: 'special',
        icon: ICONS.Game.Crown,
        hidden: true,
        tiers: [{ target: 7, reward: 2000, title: 'Boss Conqueror' }]
    }
];

export interface AchievementProgress {
    [achievementId: string]: {
        currentValue: number;
        unlockedTiers: number[];  // Indices of unlocked tiers
        dateUnlocked?: string;
    };
}

export function getDefaultAchievementProgress(): AchievementProgress {
    const progress: AchievementProgress = {};
    ACHIEVEMENTS.forEach(a => {
        progress[a.id] = { currentValue: 0, unlockedTiers: [] };
    });
    return progress;
}

export function checkAchievementProgress(
    achievement: Achievement,
    progress: AchievementProgress
): { newlyUnlocked: number[]; rewards: number } {
    const current = progress[achievement.id] || { currentValue: 0, unlockedTiers: [] };
    const newlyUnlocked: number[] = [];
    let rewards = 0;

    achievement.tiers.forEach((tier, index) => {
        if (current.currentValue >= tier.target && !current.unlockedTiers.includes(index)) {
            newlyUnlocked.push(index);
            rewards += tier.reward;
        }
    });

    return { newlyUnlocked, rewards };
}

export function updateAchievementProgress(
    achievementId: string,
    value: number,
    progress: AchievementProgress,
    increment: boolean = true
): AchievementProgress {
    const newProgress = { ...progress };
    if (!newProgress[achievementId]) {
        newProgress[achievementId] = { currentValue: 0, unlockedTiers: [] };
    }

    if (increment) {
        newProgress[achievementId].currentValue += value;
    } else {
        newProgress[achievementId].currentValue = Math.max(
            newProgress[achievementId].currentValue,
            value
        );
    }

    return newProgress;
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.category === category && !a.hidden);
}

export function getUnlockedTitles(progress: AchievementProgress): string[] {
    const titles: string[] = [];
    ACHIEVEMENTS.forEach(achievement => {
        const prog = progress[achievement.id];
        if (prog) {
            achievement.tiers.forEach((tier, index) => {
                if (prog.unlockedTiers.includes(index) && tier.title) {
                    titles.push(tier.title);
                }
            });
        }
    });
    return titles;
}
