// Daily Rewards System
// 7-day cycle with escalating rewards

export interface DailyReward {
    day: number;
    shards: number;
    bonus?: {
        type: 'powerup' | 'skill_point' | 'skin_unlock';
        value: string | number;
    };
    description: string;
}

export const DAILY_REWARDS: DailyReward[] = [
    { day: 1, shards: 50, description: 'Welcome back, pilot!' },
    { day: 2, shards: 75, description: 'Keep it up!' },
    { day: 3, shards: 100, bonus: { type: 'powerup', value: 'SHIELD' }, description: 'Bonus shield!' },
    { day: 4, shards: 125, description: 'Halfway there!' },
    { day: 5, shards: 150, bonus: { type: 'skill_point', value: 1 }, description: '+1 Skill Point!' },
    { day: 6, shards: 200, description: 'Almost legendary!' },
    { day: 7, shards: 500, bonus: { type: 'powerup', value: 'NUKE' }, description: 'JACKPOT! Max reward!' },
];

export interface DailyRewardState {
    lastClaimDate: string | null;  // ISO date string
    currentStreak: number;
    totalDaysClaimed: number;
}

export function getDefaultDailyRewardState(): DailyRewardState {
    return {
        lastClaimDate: null,
        currentStreak: 0,
        totalDaysClaimed: 0
    };
}

export function canClaimDailyReward(state: DailyRewardState): boolean {
    if (!state.lastClaimDate) return true;

    const lastClaim = new Date(state.lastClaimDate);
    const now = new Date();

    // Reset to start of day for comparison
    lastClaim.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - lastClaim.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 1;
}

export function claimDailyReward(state: DailyRewardState): { newState: DailyRewardState; reward: DailyReward } {
    const now = new Date();
    const lastClaim = state.lastClaimDate ? new Date(state.lastClaimDate) : null;

    let newStreak = state.currentStreak;

    if (lastClaim) {
        lastClaim.setHours(0, 0, 0, 0);
        const nowDay = new Date(now);
        nowDay.setHours(0, 0, 0, 0);

        const diffTime = nowDay.getTime() - lastClaim.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            // Consecutive day - increase streak
            newStreak = (state.currentStreak % 7) + 1;
        } else if (diffDays > 1) {
            // Streak broken - reset to day 1
            newStreak = 1;
        }
    } else {
        // First claim ever
        newStreak = 1;
    }

    const reward = DAILY_REWARDS[newStreak - 1];

    const newState: DailyRewardState = {
        lastClaimDate: now.toISOString(),
        currentStreak: newStreak,
        totalDaysClaimed: state.totalDaysClaimed + 1
    };

    return { newState, reward };
}

export function getNextReward(state: DailyRewardState): DailyReward {
    const nextDay = (state.currentStreak % 7) + 1;
    return DAILY_REWARDS[nextDay - 1];
}

export function getStreakBonus(streak: number): number {
    // Bonus multiplier based on streak
    if (streak >= 7) return 2.0;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.25;
    return 1.0;
}
