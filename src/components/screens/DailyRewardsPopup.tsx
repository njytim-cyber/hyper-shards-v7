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
        <div className="daily-rewards-popup">
            <div className="daily-rewards-container">
                <button className="close-btn" onClick={onClose}>✕</button>

                <h2>📅 DAILY REWARDS</h2>

                <div className="streak-display">
                    <span className="streak-label">Current Streak:</span>
                    <span className="streak-value">{currentStreak} Days</span>
                    {streakBonus > 1 && (
                        <span className="streak-bonus">+{Math.round((streakBonus - 1) * 100)}% Bonus!</span>
                    )}
                </div>

                <div className="rewards-grid">
                    {DAILY_REWARDS.map((reward, i) => {
                        const dayNum = i + 1;
                        const isPast = dayNum < (currentStreak || 0);
                        const isCurrent = dayNum === (currentStreak || 0) + 1 && !claimed;
                        const isToday = dayNum === currentStreak && claimed;

                        return (
                            <div
                                key={i}
                                className={`reward-day ${isPast || isToday ? 'claimed' : ''} ${isCurrent ? 'current' : ''} ${dayNum === 7 ? 'jackpot' : ''}`}
                            >
                                <div className="day-label">Day {dayNum}</div>
                                <div className="day-reward">
                                    <span className="reward-shards">{CURRENCY.symbol} {reward.shards}</span>
                                    {reward.bonus && (
                                        <span className="reward-bonus">
                                            {reward.bonus.type === 'powerup' && `+${reward.bonus.value}`}
                                            {reward.bonus.type === 'skill_point' && '+1 SP'}
                                        </span>
                                    )}
                                </div>
                                {(isPast || isToday) && <div className="claimed-check">✓</div>}
                            </div>
                        );
                    })}
                </div>

                {!claimed && canClaim && (
                    <button className="claim-btn" onClick={handleClaim}>
                        CLAIM TODAY'S REWARD!
                    </button>
                )}

                {claimed && claimedReward && (
                    <div className="claimed-message">
                        <div className="claimed-amount">+{claimedReward.shards} {CURRENCY.symbol}</div>
                        {claimedReward.bonus && <div className="claimed-bonus">{claimedReward.bonus}</div>}
                        <div className="claimed-text">Come back tomorrow!</div>
                    </div>
                )}

                {!canClaim && !claimed && (
                    <div className="already-claimed">
                        <div>Already claimed today!</div>
                        <div className="next-claim">Next reward in: {getTimeUntilNextClaim()}</div>
                    </div>
                )}
            </div>

            <style>{`
                .daily-rewards-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 600;
                }
                .daily-rewards-container {
                    background: linear-gradient(135deg, #0a0a15 0%, #151530 100%);
                    border: 2px solid #ffd700;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    box-shadow: 0 0 50px rgba(255,215,0,0.2);
                }
                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: 1px solid #666;
                    color: #666;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .close-btn:hover {
                    border-color: #f00;
                    color: #f00;
                }
                h2 {
                    text-align: center;
                    color: #ffd700;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    text-shadow: 0 0 20px rgba(255,215,0,0.5);
                }
                .streak-display {
                    text-align: center;
                    margin-bottom: 25px;
                    padding: 15px;
                    background: rgba(255,215,0,0.1);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .streak-label {
                    color: #888;
                }
                .streak-value {
                    color: #ffd700;
                    font-size: 24px;
                    font-weight: bold;
                }
                .streak-bonus {
                    background: linear-gradient(90deg, #f80, #ffd700);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: bold;
                }
                .rewards-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 8px;
                    margin-bottom: 25px;
                }
                @media (max-width: 500px) {
                    .rewards-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                .reward-day {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid #333;
                    border-radius: 10px;
                    padding: 10px 5px;
                    text-align: center;
                    transition: all 0.3s;
                    position: relative;
                }
                .reward-day.claimed {
                    opacity: 0.5;
                    background: rgba(0,255,0,0.1);
                    border-color: #0f0;
                }
                .reward-day.current {
                    border-color: #ffd700;
                    background: rgba(255,215,0,0.15);
                    animation: pulseGold 1.5s infinite;
                    transform: scale(1.05);
                }
                @keyframes pulseGold {
                    0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
                    50% { box-shadow: 0 0 25px rgba(255,215,0,0.6); }
                }
                .reward-day.jackpot {
                    background: linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,215,0,0.2));
                    border-color: #f00;
                }
                .day-label {
                    font-size: 10px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .reward-shards {
                    display: block;
                    font-size: 14px;
                    color: #0ff;
                }
                .reward-bonus {
                    display: block;
                    font-size: 10px;
                    color: #f80;
                    margin-top: 3px;
                }
                .claimed-check {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    color: #0f0;
                    font-size: 12px;
                }
                .claim-btn {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    font-size: 18px;
                    font-weight: bold;
                    background: linear-gradient(90deg, #ffd700, #f80);
                    border: none;
                    border-radius: 10px;
                    color: #000;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .claim-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 0 30px rgba(255,215,0,0.5);
                }
                .claimed-message {
                    text-align: center;
                    padding: 20px;
                    background: rgba(0,255,0,0.1);
                    border-radius: 10px;
                }
                .claimed-amount {
                    font-size: 36px;
                    color: #0ff;
                    font-weight: bold;
                    margin-bottom: 10px;
                    animation: popIn 0.5s ease-out;
                }
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .claimed-bonus {
                    color: #ffd700;
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                .claimed-text {
                    color: #888;
                    font-size: 14px;
                }
                .already-claimed {
                    text-align: center;
                    color: #888;
                    padding: 15px;
                }
                .next-claim {
                    color: #0ff;
                    margin-top: 10px;
                }
            `}</style>
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
