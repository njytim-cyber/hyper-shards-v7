/**
 * Steam Achievements Bridge
 * Handles communication with Steam SDK for achievement unlocks.
 * Uses Tauri's invoke API to call Rust backend which wraps Steamworks SDK.
 */

import { ACHIEVEMENTS, type AchievementProgress } from '../config/AchievementConfig';

// Steam Achievement ID mappings
export const STEAM_ACHIEVEMENT_IDS: Record<string, string> = {
    'asteroid_destroyer_0': 'ACH_ASTEROID_100',
    'asteroid_destroyer_1': 'ACH_ASTEROID_500',
    'asteroid_destroyer_2': 'ACH_ASTEROID_2000',
    'boss_slayer_0': 'ACH_BOSS_5',
    'boss_slayer_1': 'ACH_BOSS_25',
    'boss_slayer_2': 'ACH_BOSS_100',
    'combo_master_0': 'ACH_COMBO_10',
    'combo_master_1': 'ACH_COMBO_25',
    'combo_master_2': 'ACH_COMBO_50',
    'bullet_hell_0': 'ACH_BULLETS_1K',
    'bullet_hell_1': 'ACH_BULLETS_10K',
    'bullet_hell_2': 'ACH_BULLETS_100K',
    'wave_survivor_0': 'ACH_WAVE_5',
    'wave_survivor_1': 'ACH_WAVE_10',
    'wave_survivor_2': 'ACH_WAVE_20',
    'high_scorer_0': 'ACH_SCORE_10K',
    'high_scorer_1': 'ACH_SCORE_50K',
    'high_scorer_2': 'ACH_SCORE_200K',
    'games_played_0': 'ACH_GAMES_10',
    'games_played_1': 'ACH_GAMES_50',
    'games_played_2': 'ACH_GAMES_200',
    'no_damage_0': 'ACH_NODMG_3',
    'no_damage_1': 'ACH_NODMG_10',
    'no_damage_2': 'ACH_NODMG_25',
    'speedrun_0': 'ACH_SPEED_1',
    'speedrun_1': 'ACH_SPEED_5',
    'speedrun_2': 'ACH_SPEED_20',
    'shard_collector_0': 'ACH_SHARDS_1K',
    'shard_collector_1': 'ACH_SHARDS_10K',
    'shard_collector_2': 'ACH_SHARDS_100K',
    'powerup_hunter_0': 'ACH_POWERUP_50',
    'powerup_hunter_1': 'ACH_POWERUP_250',
    'powerup_hunter_2': 'ACH_POWERUP_1K',
    'first_blood_0': 'ACH_FIRST_BLOOD',
    'mothership_slayer_0': 'ACH_MOTHERSHIP',
    'daily_dedication_0': 'ACH_DAILY_7',
    'all_bosses_0': 'ACH_ALL_BOSSES'
};

class SteamAchievementsService {
    private isSteamAvailable: boolean = false;

    constructor() {
        this.checkSteamAvailability();
    }

    private async checkSteamAvailability() {
        // Check if running in Tauri with Steam feature
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
            try {
                const { invoke } = await import('@tauri-apps/api/core');
                const result = await invoke('steam_is_available');
                this.isSteamAvailable = result === true;
                console.log('[Steam] Availability:', this.isSteamAvailable);
            } catch (e) {
                console.warn('[Steam] Not available:', e);
                this.isSteamAvailable = false;
            }
        }
    }

    /**
     * Unlock a Steam achievement by its mapped ID.
     */
    public async unlockAchievement(achievementId: string, tierIndex: number): Promise<boolean> {
        if (!this.isSteamAvailable) return false;

        const steamKey = `${achievementId}_${tierIndex}`;
        const steamAchievementId = STEAM_ACHIEVEMENT_IDS[steamKey];
        if (!steamAchievementId) {
            console.warn(`[Steam] No mapping for ${steamKey}`);
            return false;
        }

        try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('steam_unlock_achievement', { achievementId: steamAchievementId });
            console.log(`[Steam] Unlocked: ${steamAchievementId}`);
            return true;
        } catch (e) {
            console.error(`[Steam] Failed to unlock ${steamAchievementId}:`, e);
            return false;
        }
    }

    /**
     * Sync all already-unlocked achievements to Steam.
     * Call this on game startup to ensure Steam is in sync.
     */
    public async syncAllAchievements(progress: AchievementProgress): Promise<void> {
        if (!this.isSteamAvailable) return;

        for (const achievement of ACHIEVEMENTS) {
            const p = progress[achievement.id];
            if (p && p.unlockedTiers.length > 0) {
                for (const tierIdx of p.unlockedTiers) {
                    await this.unlockAchievement(achievement.id, tierIdx);
                }
            }
        }
        console.log('[Steam] Achievement sync complete.');
    }

    /**
     * Get list of unlocked Steam achievements.
     */
    public async getUnlockedAchievements(): Promise<string[]> {
        if (!this.isSteamAvailable) return [];

        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const result = await invoke<string[]>('steam_get_unlocked');
            return result || [];
        } catch (e) {
            console.error('[Steam] Failed to get unlocked achievements:', e);
            return [];
        }
    }
}

export const steamAchievements = new SteamAchievementsService();
