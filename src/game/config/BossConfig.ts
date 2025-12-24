// Boss Type Definitions - Data-driven boss configuration
// Each boss has unique appearance, stats, and attack pattern

export type AttackPattern = 'radial' | 'spiral' | 'burst' | 'aimed' | 'wave' | 'combined';
export type BossSpriteType = 'hexagon' | 'diamond' | 'triangle' | 'cross' | 'star' | 'ring' | 'mothership';

export interface BossType {
    id: string;
    name: string;
    sprite: BossSpriteType;
    color: string;
    glowColor: string;
    baseHp: number;
    hpPerWave: number;
    fireRate: number;
    attackPattern: AttackPattern;
    bulletCount: number;
    rotationSpeed: number;
    size: number;
    isFinalBoss: boolean;
}

// Mini-bosses appear at waves 3, 6, 9, 12, 15, 18
// Final boss appears at wave 20
export const BOSS_CONFIG: Record<number, BossType> = {
    // Wave 3 - Sentinel (Easy intro boss)
    3: {
        id: 'sentinel',
        name: 'SENTINEL',
        sprite: 'hexagon',
        color: '#f0f',
        glowColor: '#f0f',
        baseHp: 80,
        hpPerWave: 10,
        fireRate: 1.8,
        attackPattern: 'radial',
        bulletCount: 10,
        rotationSpeed: 0.8,
        size: 55,
        isFinalBoss: false
    },
    // Wave 6 - Vortex (Spinning spiral)
    6: {
        id: 'vortex',
        name: 'VORTEX',
        sprite: 'diamond',
        color: '#0ff',
        glowColor: '#0ff',
        baseHp: 120,
        hpPerWave: 12,
        fireRate: 0.8,
        attackPattern: 'spiral',
        bulletCount: 4,
        rotationSpeed: 2.0,
        size: 50,
        isFinalBoss: false
    },
    // Wave 9 - Striker (Aims at player)
    9: {
        id: 'striker',
        name: 'STRIKER',
        sprite: 'triangle',
        color: '#ff0',
        glowColor: '#fa0',
        baseHp: 160,
        hpPerWave: 15,
        fireRate: 1.2,
        attackPattern: 'aimed',
        bulletCount: 3,
        rotationSpeed: 0.5,
        size: 60,
        isFinalBoss: false
    },
    // Wave 12 - Barrier (Wave pattern)
    12: {
        id: 'barrier',
        name: 'BARRIER',
        sprite: 'cross',
        color: '#0f0',
        glowColor: '#0f0',
        baseHp: 200,
        hpPerWave: 18,
        fireRate: 1.0,
        attackPattern: 'wave',
        bulletCount: 8,
        rotationSpeed: 0.3,
        size: 65,
        isFinalBoss: false
    },
    // Wave 15 - Nova (Rapid burst)
    15: {
        id: 'nova',
        name: 'NOVA',
        sprite: 'star',
        color: '#f80',
        glowColor: '#f50',
        baseHp: 250,
        hpPerWave: 20,
        fireRate: 2.0,
        attackPattern: 'burst',
        bulletCount: 5,
        rotationSpeed: 1.5,
        size: 60,
        isFinalBoss: false
    },
    // Wave 18 - Void (Hybrid attacks)
    18: {
        id: 'void',
        name: 'VOID',
        sprite: 'ring',
        color: '#b0f',
        glowColor: '#80f',
        baseHp: 300,
        hpPerWave: 22,
        fireRate: 1.4,
        attackPattern: 'radial',  // Alternates with aimed
        bulletCount: 12,
        rotationSpeed: 1.0,
        size: 70,
        isFinalBoss: false
    },
    // Wave 20 - Mothership (Final boss)
    20: {
        id: 'mothership',
        name: 'MOTHERSHIP',
        sprite: 'mothership',
        color: '#f30',
        glowColor: '#f00',
        baseHp: 500,
        hpPerWave: 25,
        fireRate: 1.0,
        attackPattern: 'combined',
        bulletCount: 16,
        rotationSpeed: 0.4,
        size: 100,
        isFinalBoss: true
    }
};

// Get boss config for a specific wave, returns undefined if no boss
export function getBossForWave(wave: number): BossType | undefined {
    return BOSS_CONFIG[wave];
}

// Check if wave is a boss wave
export function isBossWave(wave: number): boolean {
    return wave in BOSS_CONFIG;
}

// Game length constant
export const MAX_WAVES = 20;
