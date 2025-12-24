// Pilot Skill Tree System
// 5 unique pilot personas with distinct skill trees

export type PilotId = 'striker' | 'phantom' | 'sentinel' | 'technomancer' | 'berserker';
export interface SkillNode {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    cost: number[];  // Cost per level
    requires?: string;  // Prerequisite skill ID
    effect: {
        type: 'damage' | 'speed' | 'fireRate' | 'shield' | 'special';
        value: number[];  // Value per level
    };
}

export interface PilotClass {
    id: string;
    name: string;
    title: string;
    description: string;
    color: string;
    icon: string;  // Emoji for now
    baseStats: {
        damage: number;
        speed: number;
        fireRate: number;
        shields: number;
    };
    skills: SkillNode[];
    passive: {
        name: string;
        description: string;
    };
}

export const PILOT_CLASSES: Record<string, PilotClass> = {
    striker: {
        id: 'striker',
        name: 'Commander Rex',
        title: 'THE STRIKER',
        description: 'Aggressive combat specialist. Maximum firepower, minimal patience.',
        color: '#f00',
        icon: '⚔️',
        baseStats: { damage: 1.2, speed: 1.0, fireRate: 1.0, shields: 0.8 },
        passive: {
            name: 'Rage Mode',
            description: 'Deal +25% damage when below 50% health'
        },
        skills: [
            {
                id: 'striker_damage',
                name: 'Heavy Rounds',
                description: '+10% bullet damage per level',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'damage', value: [0.1, 0.2, 0.3, 0.4, 0.5] }
            },
            {
                id: 'striker_crit',
                name: 'Critical Strike',
                description: '5% crit chance per level',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'striker_damage',
                effect: { type: 'special', value: [0.05, 0.10, 0.15] }
            },
            {
                id: 'striker_execute',
                name: 'Execute',
                description: 'Instant kill enemies below 10% HP',
                maxLevel: 1,
                cost: [1000],
                requires: 'striker_crit',
                effect: { type: 'special', value: [0.1] }
            }
        ]
    },
    phantom: {
        id: 'phantom',
        name: 'Agent Nova',
        title: 'THE PHANTOM',
        description: 'Stealth specialist. Speed and evasion over raw power.',
        color: '#b0f',
        icon: '👻',
        baseStats: { damage: 0.9, speed: 1.3, fireRate: 1.1, shields: 0.9 },
        passive: {
            name: 'Phase Shift',
            description: 'Dash cooldown reduced by 50%'
        },
        skills: [
            {
                id: 'phantom_speed',
                name: 'Afterburner',
                description: '+15% movement speed per level',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'speed', value: [0.15, 0.30, 0.45, 0.60, 0.75] }
            },
            {
                id: 'phantom_dodge',
                name: 'Evasive Maneuvers',
                description: '10% chance to dodge bullets',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'phantom_speed',
                effect: { type: 'special', value: [0.1, 0.2, 0.3] }
            },
            {
                id: 'phantom_cloak',
                name: 'Cloak',
                description: 'Become invisible for 2s after dash',
                maxLevel: 1,
                cost: [1000],
                requires: 'phantom_dodge',
                effect: { type: 'special', value: [2] }
            }
        ]
    },
    sentinel: {
        id: 'sentinel',
        name: 'Captain Ironwall',
        title: 'THE SENTINEL',
        description: 'Defensive juggernaut. Built to take hits and keep fighting.',
        color: '#0ff',
        icon: '🛡️',
        baseStats: { damage: 0.8, speed: 0.8, fireRate: 0.9, shields: 1.5 },
        passive: {
            name: 'Fortified',
            description: 'Start each run with +1 shield'
        },
        skills: [
            {
                id: 'sentinel_armor',
                name: 'Reinforced Hull',
                description: '+1 max shield capacity per level',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'shield', value: [1, 2, 3, 4, 5] }
            },
            {
                id: 'sentinel_regen',
                name: 'Auto-Repair',
                description: 'Regenerate 1 shield every 30s',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'sentinel_armor',
                effect: { type: 'special', value: [30, 25, 20] }
            },
            {
                id: 'sentinel_reflect',
                name: 'Deflector Shield',
                description: 'Reflect 25% of blocked damage',
                maxLevel: 1,
                cost: [1000],
                requires: 'sentinel_regen',
                effect: { type: 'special', value: [0.25] }
            }
        ]
    },
    technomancer: {
        id: 'technomancer',
        name: 'Dr. Circuit',
        title: 'THE TECHNOMANCER',
        description: 'Tech genius. Upgrades and power-ups enhanced.',
        color: '#0f0',
        icon: '🔧',
        baseStats: { damage: 1.0, speed: 1.0, fireRate: 1.2, shields: 1.0 },
        passive: {
            name: 'Scavenger',
            description: 'Power-ups drop 25% more often'
        },
        skills: [
            {
                id: 'tech_firerate',
                name: 'Overclocked Guns',
                description: '+10% fire rate per level',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'fireRate', value: [0.1, 0.2, 0.3, 0.4, 0.5] }
            },
            {
                id: 'tech_duration',
                name: 'Extended Duration',
                description: 'Power-ups last 25% longer per level',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'tech_firerate',
                effect: { type: 'special', value: [0.25, 0.50, 0.75] }
            },
            {
                id: 'tech_double',
                name: 'Quantum Duplication',
                description: '10% chance to duplicate power-ups',
                maxLevel: 1,
                cost: [1000],
                requires: 'tech_duration',
                effect: { type: 'special', value: [0.1] }
            }
        ]
    },
    berserker: {
        id: 'berserker',
        name: 'Havoc',
        title: 'THE BERSERKER',
        description: 'Chaotic force of destruction. High risk, high reward.',
        color: '#f80',
        icon: '💥',
        baseStats: { damage: 1.4, speed: 1.1, fireRate: 0.8, shields: 0.6 },
        passive: {
            name: 'Bloodlust',
            description: 'Each kill increases damage by 1% (resets on hit)'
        },
        skills: [
            {
                id: 'berserker_frenzy',
                name: 'Frenzy',
                description: '+5% damage per combo level',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'damage', value: [0.05, 0.10, 0.15, 0.20, 0.25] }
            },
            {
                id: 'berserker_chain',
                name: 'Chain Reaction',
                description: 'Explosions deal area damage',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'berserker_frenzy',
                effect: { type: 'special', value: [15, 25, 40] }
            },
            {
                id: 'berserker_unstoppable',
                name: 'Unstoppable',
                description: 'Immune to damage during combos 5+',
                maxLevel: 1,
                cost: [1000],
                requires: 'berserker_chain',
                effect: { type: 'special', value: [5] }
            }
        ]
    }
};

export function getPilotClass(id: string): PilotClass | undefined {
    return PILOT_CLASSES[id];
}

export function getAllPilotClasses(): PilotClass[] {
    return Object.values(PILOT_CLASSES);
}
