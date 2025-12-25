import type { GameEngine } from '../core/GameEngine';

export type ModifierType = 'DOUBLE_SPEED' | 'GLASS_CANNON' | 'NO_SHIELDS' | 'ASTEROID_STORM' | 'TINY_SHIP' | 'GIANT_ENEMIES';

export interface ChallengeModifier {
    id: ModifierType;
    name: string;
    description: string;
    apply: (game: GameEngine) => void;
}

export const CHALLENGE_MODIFIERS: Record<ModifierType, ChallengeModifier> = {
    DOUBLE_SPEED: {
        id: 'DOUBLE_SPEED',
        name: 'Hyper Velocity',
        description: 'Enemies move 50% faster',
        apply: (game: GameEngine) => {
            // Logic to be applied in GameEngine or Entity
            game.globalSpeedMultiplier = 1.5;
        }
    },
    GLASS_CANNON: {
        id: 'GLASS_CANNON',
        name: 'Glass Cannon',
        description: '1 HP, but 200% Damage',
        apply: (game: GameEngine) => {
            if (game.ship) {
                game.ship.maxLives = 1;
                game.lives = 1;
                game.damageMultiplier = 2.0;
            }
        }
    },
    NO_SHIELDS: {
        id: 'NO_SHIELDS',
        name: 'Exposed Core',
        description: 'Shields are disabled',
        apply: (game: GameEngine) => {
            // Logic
            game.shieldsDisabled = true;
        }
    },
    ASTEROID_STORM: {
        id: 'ASTEROID_STORM',
        name: 'Asteroid Storm',
        description: 'Asteroid spawn rate doubled',
        apply: (game: GameEngine) => {
            game.spawnRateMultiplier = 2.0;
        }
    },
    TINY_SHIP: {
        id: 'TINY_SHIP',
        name: 'Nano Pilot',
        description: 'Ship is 50% smaller',
        apply: (game: GameEngine) => {
            if (game.ship) {
                game.ship.scale = 0.5;
            }
        }
    },
    GIANT_ENEMIES: {
        id: 'GIANT_ENEMIES',
        name: 'Titan Class',
        description: 'Enemies are 50% larger',
        apply: (game: GameEngine) => {
            game.enemyScaleMultiplier = 1.5;
        }
    }
};
