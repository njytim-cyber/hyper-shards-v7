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
    icon: string;
    baseStats: {
        damage: number;
        speed: number;
        fireRate: number;
        shields: number;
    };
    passive: {
        name: string;
        description: string;
    };
    skills: SkillNode[];
}

export const PILOT_CLASSES: Record<PilotId, PilotClass> = {
    striker: {
        id: 'striker',
        name: 'Commander Rex',
        title: 'THE STRIKER',
        description: 'Aggressive combat specialist. Maximum firepower, minimal patience.',
        color: '#f00',
        icon: 'swords',
        baseStats: { damage: 1.2, speed: 1.0, fireRate: 1.0, shields: 0.8 },
        passive: {
            name: 'Blitzkrieg',
            description: 'Damage increases by 2% for every 10% health missing.'
        },
        skills: [
            {
                id: 'striker_dmg',
                name: 'Weapon Overdrive',
                description: 'Increase base weapon damage',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'damage', value: [0.05, 0.10, 0.15, 0.20, 0.25] }
            },
            {
                id: 'striker_rapid',
                name: 'Rapid Fire',
                description: 'Increase fire rate',
                maxLevel: 3,
                cost: [100, 250, 500],
                requires: 'striker_dmg',
                effect: { type: 'fireRate', value: [0.10, 0.20, 0.30] }
            },
            {
                id: 'striker_ult',
                name: 'Omega Beam',
                description: 'Unlocks a powerful screen-clearing beam attack (Charge over time)',
                maxLevel: 1,
                cost: [1000],
                requires: 'striker_rapid',
                effect: { type: 'special', value: [1] }
            }
        ]
    },
    phantom: {
        id: 'phantom',
        name: 'Agent Nova',
        title: 'THE PHANTOM',
        description: 'Stealth specialist. Speed and evasion over raw power.',
        color: '#b0f',
        icon: 'skull',
        baseStats: { damage: 0.9, speed: 1.3, fireRate: 1.1, shields: 0.9 },
        passive: {
            name: 'Evasive Maneuvers',
            description: '15% chance to dodge incoming projectiles.'
        },
        skills: [
            {
                id: 'phantom_speed',
                name: 'Thruster Boost',
                description: 'Increase movement speed',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'speed', value: [0.05, 0.10, 0.15, 0.20, 0.25] }
            },
            {
                id: 'phantom_cloak',
                name: 'Phase Cloak',
                description: 'Dash grants invulnerability for 0.5s',
                maxLevel: 3,
                cost: [150, 300, 600],
                requires: 'phantom_speed',
                effect: { type: 'special', value: [0.5, 0.75, 1.0] }
            },
            {
                id: 'phantom_ult',
                name: 'Shadow Strike',
                description: 'Teleport behind enemies and deal massive crit damage',
                maxLevel: 1,
                cost: [1000],
                requires: 'phantom_cloak',
                effect: { type: 'special', value: [1] }
            }
        ]
    },
    sentinel: {
        id: 'sentinel',
        name: 'Captain Ironwall',
        title: 'THE SENTINEL',
        description: 'Defensive juggernaut. Built to take hits and keep fighting.',
        color: '#0ff',
        icon: 'shield-hud',
        baseStats: { damage: 0.8, speed: 0.8, fireRate: 0.9, shields: 1.5 },
        passive: {
            name: 'Iron Plating',
            description: 'Regenerate 1 shield point every 10 seconds.'
        },
        skills: [
            {
                id: 'sentinel_shield',
                name: 'Shield Capacity',
                description: 'Increase max shields',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'shield', value: [1, 2, 3, 4, 5] }
            },
            {
                id: 'sentinel_reflect',
                name: 'Reflective Hull',
                description: 'Chance to reflect projectiles back at enemies',
                maxLevel: 3,
                cost: [150, 300, 600],
                requires: 'sentinel_shield',
                effect: { type: 'special', value: [0.10, 0.20, 0.30] }
            },
            {
                id: 'sentinel_ult',
                name: 'Fortress Mode',
                description: 'Become immobile but invincible with infinite ammo for 5s',
                maxLevel: 1,
                cost: [1000],
                requires: 'sentinel_reflect',
                effect: { type: 'special', value: [5] }
            }
        ]
    },
    technomancer: {
        id: 'technomancer',
        name: 'Dr. Circuit',
        title: 'THE TECHNOMANCER',
        description: 'Tech genius. Upgrades and power-ups enhanced.',
        color: '#0f0',
        icon: 'settings',
        baseStats: { damage: 1.0, speed: 1.0, fireRate: 1.2, shields: 1.0 },
        passive: {
            name: 'Overclock',
            description: 'Power-ups last 25% longer.'
        },
        skills: [
            {
                id: 'techno_magnet',
                name: 'Loot Magnet',
                description: 'Increase pickup range for shards and powerups',
                maxLevel: 5,
                cost: [50, 100, 200, 400, 800],
                effect: { type: 'special', value: [1.2, 1.4, 1.6, 1.8, 2.0] }
            },
            {
                id: 'techno_drones',
                name: 'Support Drones',
                description: 'Spawn a drone that shoots weak lasers',
                maxLevel: 3,
                cost: [200, 400, 800],
                requires: 'techno_magnet',
                effect: { type: 'special', value: [1, 2, 3] }
            },
            {
                id: 'techno_ult',
                name: 'EMP Blast',
                description: 'Disable all enemy weapons and shields for 5s',
                maxLevel: 1,
                cost: [1000],
                requires: 'techno_drones',
                effect: { type: 'special', value: [5] }
            }
        ]
    },
    berserker: {
        id: 'berserker',
        name: 'Havoc',
        title: 'THE BERSERKER',
        description: 'Chaotic force of destruction. High risk, high reward.',
        color: '#f80',
        icon: 'heavy',
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
    return PILOT_CLASSES[id as PilotId];
}

export function getAllPilotClasses(): PilotClass[] {
    return Object.values(PILOT_CLASSES);
}
