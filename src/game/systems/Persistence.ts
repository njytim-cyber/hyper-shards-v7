import type { DailyRewardState } from '../config/DailyRewardsConfig';
import type { AchievementProgress } from '../config/AchievementConfig';
import { getDefaultDailyRewardState } from '../config/DailyRewardsConfig';
import { getDefaultAchievementProgress } from '../config/AchievementConfig';

export interface PilotSkillProgress {
    [skillId: string]: number;  // Level of each skill
}

export interface CampaignProgress {
    currentLevel: number;
    completedLevels: number[];
    levelStars: Record<number, number>;  // levelId -> stars (1-3)
    unlockedWeapons: string[];
    unlockedUpgrades: string[];
    unlockedPilots: string[];
}

export interface UserProfile {
    // Core stats
    shards: number;
    gems: number;  // Premium currency from campaign stars
    highScore: number;
    maxWave: number;
    totalGamesPlayed: number;
    totalAsteroidsDestroyed: number;
    totalBossesDefeated: number;
    totalBulletsFired: number;
    totalPowerUpsCollected: number;
    maxCombo: number;
    perfectWaves: number;  // Waves completed without damage
    speedKills: number;    // Boss kills under 30s

    // Campaign mode
    campaign: CampaignProgress;

    // Cosmetics
    equippedSkin: string;
    unlockedSkins: string[];
    equippedTitle: string;
    unlockedTitles: string[];

    // Legacy upgrades (shop system)
    upgrades: Record<string, number>;

    // Pilot system
    selectedPilot: string;
    pilotSkills: Record<string, PilotSkillProgress>;  // Per-pilot skill levels
    skillPoints: number;

    // Daily rewards
    dailyRewards: DailyRewardState;

    // Achievements
    achievements: AchievementProgress;

    // Bosses defeated (for achievement tracking)
    bossesDefeated: string[];  // List of unique boss IDs defeated

    // Progression
    tutorialComplete: boolean;
    hasSeenIntro: boolean;

    // Meta
    firstPlayDate: string | null;
    lastPlayDate: string | null;
}

const DEFAULT_CAMPAIGN: CampaignProgress = {
    currentLevel: 1,
    completedLevels: [],
    levelStars: {},
    unlockedWeapons: ['BLASTER'],  // Start with basic weapon
    unlockedUpgrades: [],
    unlockedPilots: ['striker'],   // Start with Striker pilot
};

const DEFAULT_PROFILE: UserProfile = {
    shards: 0,
    gems: 0,
    highScore: 0,
    maxWave: 0,
    totalGamesPlayed: 0,
    totalAsteroidsDestroyed: 0,
    totalBossesDefeated: 0,
    totalBulletsFired: 0,
    totalPowerUpsCollected: 0,
    maxCombo: 0,
    perfectWaves: 0,
    speedKills: 0,

    campaign: DEFAULT_CAMPAIGN,

    equippedSkin: 'default',
    unlockedSkins: ['default'],
    equippedTitle: '',
    unlockedTitles: [],

    upgrades: {},

    selectedPilot: 'striker',
    pilotSkills: {},
    skillPoints: 0,

    dailyRewards: getDefaultDailyRewardState(),
    achievements: getDefaultAchievementProgress(),
    bossesDefeated: [],

    tutorialComplete: false,
    hasSeenIntro: false,

    firstPlayDate: null,
    lastPlayDate: null
};

import { supabase } from '../../lib/supabase';
import { authSystem } from './AuthSystem';

export class Persistence {
    public profile: UserProfile = { ...DEFAULT_PROFILE };
    private syncPending: boolean = false;

    constructor() {
        this.load();

        // Listen for auth changes to sync
        window.addEventListener('auth-changed', async () => {
            if (authSystem.isAuthenticated()) {
                await this.loadFromCloud();
                this.save(); // Force sync up after merge
            }
        });
    }

    public save() {
        this.profile.lastPlayDate = new Date().toISOString();
        localStorage.setItem('hyperShardsProfile', JSON.stringify(this.profile));
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: this.profile }));

        // Debounced cloud sync
        if (authSystem.isAuthenticated() && !this.syncPending) {
            this.syncPending = true;
            setTimeout(() => this.syncToCloud(), 2000);
        }
    }

    private async syncToCloud() {
        try {
            const user = authSystem.user;
            if (!user || !supabase) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    updated_at: new Date().toISOString(),
                    data: this.profile
                });

            if (error) console.error('Cloud save failed:', error);
        } finally {
            this.syncPending = false;
        }
    }

    public async loadFromCloud() {
        const user = authSystem.user;
        if (!user || !supabase) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('data, updated_at')
            .eq('id', user.id)
            .single();

        if (error) {
            console.warn('Cloud load error (new user?):', error);
            return;
        }

        if (data && data.data) {
            // Simple conflict resolution: Cloud wins if newer (or we assume cloud is source of truth on login)
            // Implementation: deep merge, favoring higher values for accumulations
            // For now, just taking cloud data as it's likely a fresh login
            console.log('Loaded cloud save:', data.updated_at);
            const cloudProfile = data.data as UserProfile;

            // Merge logic could be complex. For now, simple override if cloud is valid.
            if (cloudProfile.totalGamesPlayed > this.profile.totalGamesPlayed) {
                this.profile = { ...this.profile, ...cloudProfile };
                this.save(); // Save merged back to local
            }
        }
    }

    public load() {
        try {
            const stored = localStorage.getItem('hyperShardsProfile');
            if (stored) {
                const d = JSON.parse(stored);
                this.profile = {
                    ...DEFAULT_PROFILE,
                    ...d,
                    upgrades: { ...DEFAULT_PROFILE.upgrades, ...d.upgrades },
                    dailyRewards: { ...DEFAULT_PROFILE.dailyRewards, ...d.dailyRewards },
                    achievements: { ...DEFAULT_PROFILE.achievements, ...d.achievements },
                    pilotSkills: { ...DEFAULT_PROFILE.pilotSkills, ...d.pilotSkills },
                    unlockedSkins: d.unlockedSkins || DEFAULT_PROFILE.unlockedSkins,
                    unlockedTitles: d.unlockedTitles || DEFAULT_PROFILE.unlockedTitles,
                    bossesDefeated: d.bossesDefeated || DEFAULT_PROFILE.bossesDefeated,
                    campaign: { ...DEFAULT_CAMPAIGN, ...d.campaign },
                    gems: d.gems || 0,
                };
            }
        } catch (e) {
            console.warn('Failed to load profile from localStorage, using defaults:', e);
            this.profile = { ...DEFAULT_PROFILE };
        }

        // Set first play date on first load
        if (!this.profile.firstPlayDate) {
            this.profile.firstPlayDate = new Date().toISOString();
            this.save();
        }
    }

    public addShards(amount: number) {
        const mult = 1 + ((this.profile.upgrades.greed || 0) * 0.2);
        this.profile.shards += Math.ceil(amount * mult);
        this.save();
    }

    public spendShards(amount: number): boolean {
        if (this.profile.shards >= amount) {
            this.profile.shards -= amount;
            this.save();
            return true;
        }
        return false;
    }

    public addSkillPoints(amount: number) {
        this.profile.skillPoints += amount;
        this.save();
    }

    public spendSkillPoint(pilotId: string, skillId: string, cost: number): boolean {
        if (this.profile.shards >= cost) {
            this.profile.shards -= cost;

            if (!this.profile.pilotSkills[pilotId]) {
                this.profile.pilotSkills[pilotId] = {};
            }

            const currentLevel = this.profile.pilotSkills[pilotId][skillId] || 0;
            this.profile.pilotSkills[pilotId][skillId] = currentLevel + 1;

            this.save();
            return true;
        }
        return false;
    }

    public getSkillLevel(pilotId: string, skillId: string): number {
        return this.profile.pilotSkills[pilotId]?.[skillId] || 0;
    }

    public trackStat(stat: keyof UserProfile, value: number, max: boolean = false) {
        if (typeof this.profile[stat] === 'number') {
            if (max) {
                (this.profile[stat] as number) = Math.max(this.profile[stat] as number, value);
            } else {
                (this.profile[stat] as number) += value;
            }
            this.save();
        }
    }

    public recordBossDefeat(bossId: string) {
        if (!this.profile.bossesDefeated.includes(bossId)) {
            this.profile.bossesDefeated.push(bossId);
        }
        this.profile.totalBossesDefeated++;
        this.save();
    }

    public unlockTitle(title: string) {
        if (!this.profile.unlockedTitles.includes(title)) {
            this.profile.unlockedTitles.push(title);
            this.save();
        }
    }

    public setIntroSeen() {
        this.profile.hasSeenIntro = true;
        this.save();
    }

    public purchaseUpgrade(upgradeId: string, cost: number): boolean {
        if (this.profile.shards >= cost) {
            this.profile.shards -= cost;
            const currentLevel = this.profile.upgrades[upgradeId] || 0;
            this.profile.upgrades[upgradeId] = currentLevel + 1;
            this.save();
            return true;
        }
        return false;
    }

    public equipSkin(skinId: string) {
        // Verify ownership if needed, for now assuming UI checks it
        if (this.profile.unlockedSkins.includes(skinId)) {
            this.profile.equippedSkin = skinId;
            this.save();
        }
    }

    // Campaign Methods
    public addGems(amount: number) {
        this.profile.gems += amount;
        this.save();
    }

    public spendGems(amount: number): boolean {
        if (this.profile.gems >= amount) {
            this.profile.gems -= amount;
            this.save();
            return true;
        }
        return false;
    }

    public completeCampaignLevel(levelId: number, stars: number, rewards: {
        shards: number;
        gems: number;
        unlock?: { type: string; id: string };
    }) {
        const campaign = this.profile.campaign;

        // Only add rewards if first time completing this level
        const isFirstComplete = !campaign.completedLevels.includes(levelId);
        const previousStars = campaign.levelStars[levelId] || 0;
        const newStars = Math.max(previousStars, stars);

        // Update completion
        if (isFirstComplete) {
            campaign.completedLevels.push(levelId);
            this.profile.shards += rewards.shards;
        }

        // Award gems for new stars only
        if (newStars > previousStars) {
            this.profile.gems += rewards.gems;
        }

        campaign.levelStars[levelId] = newStars;
        campaign.currentLevel = Math.max(campaign.currentLevel, levelId + 1);

        // Handle unlock
        if (rewards.unlock && isFirstComplete) {
            this.unlockCampaignReward(rewards.unlock.type, rewards.unlock.id);
        }

        this.save();
        return { isFirstComplete, newStars, previousStars };
    }

    private unlockCampaignReward(type: string, id: string) {
        const campaign = this.profile.campaign;

        switch (type) {
            case 'weapon':
                if (!campaign.unlockedWeapons.includes(id)) {
                    campaign.unlockedWeapons.push(id);
                }
                break;
            case 'upgrade':
                if (!campaign.unlockedUpgrades.includes(id)) {
                    campaign.unlockedUpgrades.push(id);
                }
                break;
            case 'pilot':
                if (!campaign.unlockedPilots.includes(id)) {
                    campaign.unlockedPilots.push(id);
                }
                break;
            case 'skin':
                if (!this.profile.unlockedSkins.includes(id)) {
                    this.profile.unlockedSkins.push(id);
                }
                break;
            case 'title':
                if (!this.profile.unlockedTitles.includes(id)) {
                    this.profile.unlockedTitles.push(id);
                }
                break;
        }
    }

    public isWeaponUnlocked(weaponId: string): boolean {
        return this.profile.campaign.unlockedWeapons.includes(weaponId);
    }

    public isUpgradeUnlocked(upgradeId: string): boolean {
        // In arcade mode, all upgrades available; in campaign, check unlock
        return this.profile.campaign.unlockedUpgrades.includes(upgradeId);
    }

    public isPilotUnlocked(pilotId: string): boolean {
        return this.profile.campaign.unlockedPilots.includes(pilotId);
    }

    public getCampaignStars(): number {
        return Object.values(this.profile.campaign.levelStars).reduce((a, b) => a + b, 0);
    }

    public async submitScore(score: number, wave: number) {
        if (!authSystem.isAuthenticated() || !supabase) return;

        // Only submit if it's a high score to prevent spam?
        // Actually, let's just submit specific milestones or end of game.

        const { error } = await supabase
            .from('leaderboards')
            .insert({
                user_id: authSystem.user!.id,
                score,
                wave,
                pilot_id: this.profile.selectedPilot
            });

        if (error) console.error('Score submission failed:', error);
    }

    public async getLeaderboard(limit: number = 10): Promise<{ username: string | null; score: number; wave: number }[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('top_scores')
            .select('*')
            .limit(limit);

        if (error) {
            console.error('Leaderboard fetch failed:', error);
            return [];
        }
        return data || [];
    }

    public reset() {
        this.profile = { ...DEFAULT_PROFILE };
        localStorage.removeItem('hyperShardsProfile');
    }
}

export const persistence = new Persistence();
