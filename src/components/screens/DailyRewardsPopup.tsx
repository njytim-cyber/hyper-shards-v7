import { useState, useEffect } from 'react';
import { persistence } from '../../game/systems/Persistence';
import {
    DAILY_REWARDS,
    canClaimDailyReward,
    claimDailyReward,
    getStreakBonus
} from '../../game/config/DailyRewardsConfig';
import { CURRENCY } from '../../game/config/CurrencyConfig';

interface DailyRewardsPopupProps {
    onClose: () => void;
    onClaim: (shards: number) => void;
}

export const DailyRewardsPopup: React.FC<DailyRewardsPopupProps> = ({ onClose, onClaim }) => {
    const [canClaim, setCanClaim] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [claimedReward, setClaimedReward] = useState<{ shards: number; bonus?: string } | null>(null);

    const dailyState = persistence.profile.dailyRewards;
    const currentStreak = dailyState.currentStreak;
    const streakBonus = getStreakBonus(currentStreak);

    useEffect(() => {
        setCanClaim(canClaimDailyReward(dailyState));
    }, [dailyState]);

    const handleClaim = () => {
        if (!canClaim || claimed) return;

        const { newState, reward } = claimDailyReward(dailyState);
        const bonusShards = Math.floor(reward.shards * streakBonus);

        persistence.profile.dailyRewards = newState;
        persistence.addShards(bonusShards);

        setClaimedReward({
            shards: bonusShards,
            bonus: reward.bonus?.type === 'skill_point' ? '+1 Skill Point!' : undefined
        });
        setClaimed(true);

        if (reward.bonus?.type === 'skill_point') {
            persistence.addSkillPoints(1);
        }

        onClaim(bonusShards);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} className="screen-enter">
            <div className="detail-panel" style={{ width: '90%', maxWidth: '600px', border: '2px solid #ffd700', padding: '30px', background: '#111' }}>
                <button className="close-btn" style={{ position: 'absolute', top: '15px', right: '15px' }} onClick={onClose}>✕</button>

                <h2 className="screen-title" style={{ textAlign: 'center', color: '#ffd700', marginBottom: '20px', fontSize: '28px' }}>
                    📅 DAILY REWARDS
                </h2>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '15px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid #ffd700'
                }}>
                    <span style={{ color: '#ccc' }}>Current Streak:</span>
                    <span style={{ color: '#ffd700', fontSize: '24px', fontWeight: 'bold' }}>{currentStreak} Days</span>
                    {streakBonus > 1 && (
                        <span style={{ color: '#f80', fontWeight: 'bold', marginLeft: '10px' }}>+{Math.round((streakBonus - 1) * 100)}% Bonus!</span>
                    )}
                </div>

                <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {DAILY_REWARDS.map((reward, i) => {
                        const dayNum = i + 1;
                        const isPast = dayNum < (currentStreak || 0);
                        const isCurrent = dayNum === (currentStreak || 0) + 1 && !claimed;
                        const isToday = dayNum === currentStreak && claimed;
                        const isJackpot = dayNum === 7;

                        return (
                            <div
                                key={i}
                                className={`feature-card ${isCurrent ? 'selected' : ''}`}
                                style={{
                                    padding: '10px',
                                    opacity: (isPast || isToday) ? 0.5 : 1,
                                    borderColor: isCurrent ? '#ffd700' : (isJackpot ? '#f00' : '#444'),
                                    background: isCurrent ? 'rgba(255,215,0,0.1)' : (isJackpot ? 'rgba(255,0,0,0.1)' : undefined),
                                    gridColumn: isJackpot ? 'span 4' : 'span 1', // Make day 7 wide
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Day {dayNum}</div>
                                <div style={{ fontSize: '16px', color: '#0ff', fontWeight: 'bold' }}>
                                    {CURRENCY.symbol} {reward.shards}
                                </div>
                                {reward.bonus && (
                                    <div style={{ fontSize: '11px', color: '#f80', marginTop: '4px' }}>
                                        {reward.bonus.type === 'powerup' && `+${reward.bonus.value}`}
                                        {reward.bonus.type === 'skill_point' && '+1 SKILL PT'}
                                    </div>
                                )}
                                {(isPast || isToday) && <div style={{ color: '#0f0', position: 'absolute', top: '5px', right: '5px', fontWeight: 'bold' }}>✓</div>}
                            </div>
                        );
                    })}
                </div>

                {!claimed && canClaim && (
                    <button
                        className="main-btn"
                        onClick={handleClaim}
                        style={{ width: '100%', marginTop: '25px', borderColor: '#ffd700', color: '#ffd700', fontSize: '18px', padding: '15px' }}
                    >
                        CLAIM REWARD
                    </button>
                )}

                {claimed && claimedReward && (
                    <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'rgba(0,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>REWARD CLAIMED!</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0ff' }}>+{claimedReward.shards} {CURRENCY.symbol}</div>
                        {claimedReward.bonus && <div style={{ color: '#ffd700', fontWeight: 'bold', marginTop: '5px' }}>{claimedReward.bonus}</div>}
                        <div style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>Come back tomorrow!</div>
                    </div>
                )}

                {!canClaim && !claimed && (
                    <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', padding: '15px' }}>
                        <div>Already claimed today!</div>
                        <div style={{ color: '#0ff', marginTop: '5px', fontSize: '14px' }}>Next reward in: {getTimeUntilNextClaim()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

function getTimeUntilNextClaim(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}
