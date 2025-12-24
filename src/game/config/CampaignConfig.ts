// Campaign Mode Configuration
// 15 levels with progressive unlocks and difficulty scaling

export type UnlockType = 'weapon' | 'upgrade' | 'skin' | 'pilot' | 'title';
export type LevelType = 'standard' | 'boss' | 'survival' | 'boss_rush';

export interface LevelReward {
    shards: number;
    gems: number;
    unlock?: {
        type: UnlockType;
        id: string;
        name: string;
    };
}

export interface StarCriteria {
    description: string;
    check: 'complete' | 'no_damage' | 'time_limit' | 'survival_time' | 'combo';
    value?: number;  // Time in seconds, combo count, etc.
}

export interface CampaignLevel {
    id: number;
    name: string;
    subtitle: string;
    description: string;
    type: LevelType;
    waveStart: number;
    waveEnd: number;
    bossId?: string;

    // Difficulty modifiers (1.0 = normal)
    modifiers: {
        asteroidCount: number;
        asteroidSpeed: number;
        asteroidHp: number;
        bossHp: number;
    };

    // Rewards for completion
    rewards: {
        complete: LevelReward;
        star2: LevelReward;
        star3: LevelReward;
    };

    // Star criteria
    stars: [StarCriteria, StarCriteria, StarCriteria];

    // Narrative
    briefing: string[];
}

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
    // ===== LEVEL 1: First Contact =====
    {
        id: 1,
        name: 'FIRST CONTACT',
        subtitle: 'Training Complete',
        description: 'Your first mission. Destroy the asteroid field and defeat the Sentinel.',
        type: 'boss',
        waveStart: 1,
        waveEnd: 3,
        bossId: 'sentinel',
        modifiers: { asteroidCount: 0.8, asteroidSpeed: 0.8, asteroidHp: 1.0, bossHp: 0.8 },
        rewards: {
            complete: { shards: 50, gems: 0, unlock: { type: 'weapon', id: 'SPREAD', name: 'Spread Shot' } },
            star2: { shards: 25, gems: 5 },
            star3: { shards: 50, gems: 10 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 90 seconds', check: 'time_limit', value: 90 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Pilot, this is your first real mission.',
            'Navigate the asteroid field and engage the Sentinel.',
            'Good luck out there.'
        ]
    },

    // ===== LEVEL 2: Asteroid Belt =====
    {
        id: 2,
        name: 'ASTEROID BELT',
        subtitle: 'Into the Debris',
        description: 'Dense asteroid field. No boss, pure survival.',
        type: 'standard',
        waveStart: 4,
        waveEnd: 5,
        modifiers: { asteroidCount: 1.2, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.0 },
        rewards: {
            complete: { shards: 75, gems: 0, unlock: { type: 'upgrade', id: 'damage', name: 'Overcharge' } },
            star2: { shards: 30, gems: 8 },
            star3: { shards: 60, gems: 15 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 5x combo', check: 'combo', value: 5 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Heavy asteroid concentration ahead.',
            'Use your new Spread Shot to clear groups.',
            'No major threats detected.'
        ]
    },

    // ===== LEVEL 3: The Storm =====
    {
        id: 3,
        name: 'THE STORM',
        subtitle: 'Vortex Approaches',
        description: 'Face the spinning terror known as Vortex.',
        type: 'boss',
        waveStart: 6,
        waveEnd: 6,
        bossId: 'vortex',
        modifiers: { asteroidCount: 0.5, asteroidSpeed: 1.2, asteroidHp: 1.0, bossHp: 1.0 },
        rewards: {
            complete: { shards: 100, gems: 0, unlock: { type: 'skin', id: 'ruby', name: 'Ruby Ace' } },
            star2: { shards: 40, gems: 10 },
            star3: { shards: 80, gems: 20 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 60 seconds', check: 'time_limit', value: 60 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The Vortex has been detected.',
            'It creates spiral bullet patterns.',
            'Stay calm and weave through the gaps.'
        ]
    },

    // ===== LEVEL 4: Hunter's Moon =====
    {
        id: 4,
        name: "HUNTER'S MOON",
        subtitle: 'Speed Is Key',
        description: 'Fast asteroids and tight spaces.',
        type: 'standard',
        waveStart: 7,
        waveEnd: 8,
        modifiers: { asteroidCount: 1.0, asteroidSpeed: 1.3, asteroidHp: 1.0, bossHp: 1.0 },
        rewards: {
            complete: { shards: 100, gems: 0, unlock: { type: 'weapon', id: 'RAPID', name: 'Rapid Fire' } },
            star2: { shards: 40, gems: 10 },
            star3: { shards: 80, gems: 20 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 8x combo', check: 'combo', value: 8 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Asteroids moving faster than usual.',
            'Your new Rapid Fire will help.',
            'Keep your distance and fire continuously.'
        ]
    },

    // ===== LEVEL 5: The Hunter =====
    {
        id: 5,
        name: 'THE HUNTER',
        subtitle: 'Striker Awaits',
        description: 'The Striker tracks your every move.',
        type: 'boss',
        waveStart: 9,
        waveEnd: 9,
        bossId: 'striker',
        modifiers: { asteroidCount: 0.0, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.1 },
        rewards: {
            complete: { shards: 150, gems: 0, unlock: { type: 'pilot', id: 'vanguard', name: 'Vanguard' } },
            star2: { shards: 60, gems: 15 },
            star3: { shards: 120, gems: 30 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 45 seconds', check: 'time_limit', value: 45 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The Striker is a precision hunter.',
            'It aims where you ARE, not where you will be.',
            'Keep moving unpredictably.'
        ]
    },

    // ===== LEVEL 6: Deep Space =====
    {
        id: 6,
        name: 'DEEP SPACE',
        subtitle: 'Armored Rocks',
        description: 'Asteroids with increased durability.',
        type: 'standard',
        waveStart: 10,
        waveEnd: 11,
        modifiers: { asteroidCount: 1.0, asteroidSpeed: 1.0, asteroidHp: 1.5, bossHp: 1.0 },
        rewards: {
            complete: { shards: 150, gems: 0, unlock: { type: 'upgrade', id: 'pierce', name: 'Drill Rounds' } },
            star2: { shards: 60, gems: 15 },
            star3: { shards: 120, gems: 30 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 10x combo', check: 'combo', value: 10 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Reinforced asteroids ahead.',
            'They take more hits to destroy.',
            'Drill Rounds will help pierce through.'
        ]
    },

    // ===== LEVEL 7: The Wall =====
    {
        id: 7,
        name: 'THE WALL',
        subtitle: 'Barrier Blocks',
        description: 'Face the defensive fortress Barrier.',
        type: 'boss',
        waveStart: 12,
        waveEnd: 12,
        bossId: 'barrier',
        modifiers: { asteroidCount: 0.3, asteroidSpeed: 0.8, asteroidHp: 1.2, bossHp: 1.2 },
        rewards: {
            complete: { shards: 200, gems: 0, unlock: { type: 'skin', id: 'gold', name: 'Gold Hawk' } },
            star2: { shards: 80, gems: 20 },
            star3: { shards: 160, gems: 40 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 75 seconds', check: 'time_limit', value: 75 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The Barrier creates wave patterns.',
            'Timing is everything.',
            'Move with the rhythm of its attacks.'
        ]
    },

    // ===== LEVEL 8: Danger Zone =====
    {
        id: 8,
        name: 'DANGER ZONE',
        subtitle: 'Heavy Fire Required',
        description: 'Dense, fast, armored asteroids.',
        type: 'standard',
        waveStart: 13,
        waveEnd: 14,
        modifiers: { asteroidCount: 1.3, asteroidSpeed: 1.2, asteroidHp: 1.3, bossHp: 1.0 },
        rewards: {
            complete: { shards: 200, gems: 0, unlock: { type: 'weapon', id: 'HEAVY', name: 'Heavy Cannon' } },
            star2: { shards: 80, gems: 20 },
            star3: { shards: 160, gems: 40 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 12x combo', check: 'combo', value: 12 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Extremely dangerous sector.',
            'Heavy ordinance is your best friend.',
            'Stay focused, pilot.'
        ]
    },

    // ===== LEVEL 9: Solar Fury =====
    {
        id: 9,
        name: 'SOLAR FURY',
        subtitle: 'Nova Burns Bright',
        description: 'Face the rapid-fire Nova.',
        type: 'boss',
        waveStart: 15,
        waveEnd: 15,
        bossId: 'nova',
        modifiers: { asteroidCount: 0.0, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.3 },
        rewards: {
            complete: { shards: 250, gems: 0, unlock: { type: 'pilot', id: 'phantom', name: 'Phantom' } },
            star2: { shards: 100, gems: 25 },
            star3: { shards: 200, gems: 50 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 60 seconds', check: 'time_limit', value: 60 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Nova fires in rapid bursts.',
            'After each burst, it pauses briefly.',
            'That pause is your attack window.'
        ]
    },

    // ===== LEVEL 10: No Escape =====
    {
        id: 10,
        name: 'NO ESCAPE',
        subtitle: 'Homing Technology',
        description: 'Asteroids everywhere. You need homing rounds.',
        type: 'standard',
        waveStart: 16,
        waveEnd: 17,
        modifiers: { asteroidCount: 1.5, asteroidSpeed: 1.1, asteroidHp: 1.2, bossHp: 1.0 },
        rewards: {
            complete: { shards: 250, gems: 0, unlock: { type: 'upgrade', id: 'homing', name: 'Seeker Chip' } },
            star2: { shards: 100, gems: 25 },
            star3: { shards: 200, gems: 50 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 15x combo', check: 'combo', value: 15 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'Asteroid density is off the charts.',
            'Your new Seeker Chip will auto-track targets.',
            'Just stay alive.'
        ]
    },

    // ===== LEVEL 11: The Abyss =====
    {
        id: 11,
        name: 'THE ABYSS',
        subtitle: 'Void Commander',
        description: 'Face the elite commander Void.',
        type: 'boss',
        waveStart: 18,
        waveEnd: 18,
        bossId: 'void',
        modifiers: { asteroidCount: 0.2, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.4 },
        rewards: {
            complete: { shards: 300, gems: 0, unlock: { type: 'skin', id: 'shadow', name: 'Stealth' } },
            star2: { shards: 120, gems: 30 },
            star3: { shards: 240, gems: 60 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 90 seconds', check: 'time_limit', value: 90 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The Void is an elite commander.',
            'It combines multiple attack patterns.',
            'There is no single weakness. Adapt or die.'
        ]
    },

    // ===== LEVEL 12: Final Approach =====
    {
        id: 12,
        name: 'FINAL APPROACH',
        subtitle: 'Last Gauntlet',
        description: 'The final asteroid field before the Mothership.',
        type: 'standard',
        waveStart: 19,
        waveEnd: 19,
        modifiers: { asteroidCount: 1.4, asteroidSpeed: 1.3, asteroidHp: 1.4, bossHp: 1.0 },
        rewards: {
            complete: { shards: 300, gems: 0, unlock: { type: 'upgrade', id: 'rear', name: 'Rear Gun' } },
            star2: { shards: 120, gems: 30 },
            star3: { shards: 240, gems: 60 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Reach 20x combo', check: 'combo', value: 20 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'This is it. The final approach.',
            'Your Rear Gun will cover your back.',
            'Push through to the Mothership.'
        ]
    },

    // ===== LEVEL 13: The Core =====
    {
        id: 13,
        name: 'THE CORE',
        subtitle: 'Mothership',
        description: 'Destroy the Mothership and end the war.',
        type: 'boss',
        waveStart: 20,
        waveEnd: 20,
        bossId: 'mothership',
        modifiers: { asteroidCount: 0.0, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.5 },
        rewards: {
            complete: { shards: 500, gems: 0, unlock: { type: 'pilot', id: 'ace', name: 'Ace' } },
            star2: { shards: 200, gems: 50 },
            star3: { shards: 400, gems: 100 }
        },
        stars: [
            { description: 'Complete the level', check: 'complete' },
            { description: 'Complete in under 120 seconds', check: 'time_limit', value: 120 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The Mothership. Heart of the Collective.',
            'It uses ALL attack patterns in rotation.',
            'Learn the sequence. End this war.'
        ]
    },

    // ===== LEVEL 14: Endless Night (Survival) =====
    {
        id: 14,
        name: 'ENDLESS NIGHT',
        subtitle: 'Survival Mode',
        description: 'How long can you survive the endless onslaught?',
        type: 'survival',
        waveStart: 1,
        waveEnd: 99,  // Endless
        modifiers: { asteroidCount: 1.5, asteroidSpeed: 1.2, asteroidHp: 1.2, bossHp: 1.0 },
        rewards: {
            complete: { shards: 1000, gems: 0, unlock: { type: 'skin', id: 'void', name: 'Void Walker' } },
            star2: { shards: 400, gems: 100 },
            star3: { shards: 800, gems: 200 }
        },
        stars: [
            { description: 'Survive 2 minutes', check: 'survival_time', value: 120 },
            { description: 'Survive 4 minutes', check: 'survival_time', value: 240 },
            { description: 'Survive 5 minutes', check: 'survival_time', value: 300 }
        ],
        briefing: [
            'This is a survival challenge.',
            'Endless waves. No boss.',
            'How long can you last?'
        ]
    },

    // ===== LEVEL 15: Boss Rush =====
    {
        id: 15,
        name: 'BOSS RUSH',
        subtitle: 'All Seven',
        description: 'Face all seven bosses in sequence. No breaks.',
        type: 'boss_rush',
        waveStart: 1,
        waveEnd: 7,  // 7 bosses
        modifiers: { asteroidCount: 0.0, asteroidSpeed: 1.0, asteroidHp: 1.0, bossHp: 1.0 },
        rewards: {
            complete: { shards: 2000, gems: 0, unlock: { type: 'title', id: 'legend', name: 'THE LEGEND' } },
            star2: { shards: 800, gems: 200 },
            star3: { shards: 1600, gems: 400 }
        },
        stars: [
            { description: 'Defeat all 7 bosses', check: 'complete' },
            { description: 'Complete in under 10 minutes', check: 'time_limit', value: 600 },
            { description: 'Take no damage', check: 'no_damage' }
        ],
        briefing: [
            'The ultimate challenge.',
            'All seven bosses. Back to back.',
            'Prove you are a legend.'
        ]
    }
];

// Helper functions
export function getCampaignLevel(id: number): CampaignLevel | undefined {
    return CAMPAIGN_LEVELS.find(l => l.id === id);
}

export function isLevelUnlocked(levelId: number, completedLevels: number[]): boolean {
    if (levelId === 1) return true;
    return completedLevels.includes(levelId - 1);
}

export function getTotalStars(levelStars: Record<number, number>): number {
    return Object.values(levelStars).reduce((sum, stars) => sum + stars, 0);
}

export const MAX_CAMPAIGN_STARS = CAMPAIGN_LEVELS.length * 3;  // 45 stars total
