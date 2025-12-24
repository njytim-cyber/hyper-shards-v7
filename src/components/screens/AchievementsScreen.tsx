import { useState } from 'react';
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '../../game/config/AchievementConfig';
import { persistence } from '../../game/systems/Persistence';
import { CURRENCY } from '../../game/config/CurrencyConfig';

interface AchievementsScreenProps {
    onClose: () => void;
}

const CATEGORIES: { id: AchievementCategory; name: string; icon: string }[] = [
    { id: 'combat', name: 'Combat', icon: '⚔️' },
    { id: 'progression', name: 'Progress', icon: '📈' },
    { id: 'mastery', name: 'Mastery', icon: '🎯' },
    { id: 'collection', name: 'Collection', icon: '💎' },
    { id: 'special', name: 'Special', icon: '⭐' },
];

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('combat');
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const achievements = ACHIEVEMENTS.filter(a => a.category === selectedCategory && !a.hidden);
    const progress = persistence.profile.achievements;

    const getTotalProgress = () => {
        let unlocked = 0;
        let total = 0;
        ACHIEVEMENTS.forEach(a => {
            if (!a.hidden) {
                total += a.tiers.length;
                const p = progress[a.id];
                if (p) unlocked += p.unlockedTiers.length;
            }
        });
        return { unlocked, total };
    };

    const { unlocked, total } = getTotalProgress();

    return (
        <div className="achievements-screen">
            <div className="achievements-container">
                <div className="achievements-header">
                    <h1>🏆 ACHIEVEMENTS</h1>
                    <div className="achievements-total">
                        {unlocked} / {total} Unlocked
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="achievements-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            <span className="cat-icon">{cat.icon}</span>
                            <span className="cat-name">{cat.name}</span>
                        </button>
                    ))}
                </div>

                <div className="achievements-list">
                    {achievements.map(achievement => {
                        const prog = progress[achievement.id] || { currentValue: 0, unlockedTiers: [] };
                        const highestTier = achievement.tiers.length;
                        const unlockedCount = prog.unlockedTiers.length;
                        const currentTarget = achievement.tiers[unlockedCount]?.target || achievement.tiers[highestTier - 1].target;
                        const progressPercent = Math.min(100, (prog.currentValue / currentTarget) * 100);
                        const isComplete = unlockedCount === highestTier;

                        return (
                            <div
                                key={achievement.id}
                                className={`achievement-card ${isComplete ? 'complete' : ''} ${selectedAchievement?.id === achievement.id ? 'selected' : ''}`}
                                onClick={() => setSelectedAchievement(achievement)}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-info">
                                    <div className="achievement-name">{achievement.name}</div>
                                    <div className="achievement-desc">{achievement.description}</div>
                                    <div className="achievement-progress-bar">
                                        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                    <div className="achievement-progress-text">
                                        {prog.currentValue} / {currentTarget}
                                    </div>
                                </div>
                                <div className="achievement-tier">
                                    {unlockedCount} / {highestTier}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedAchievement && (
                    <div className="achievement-detail">
                        <h3>{selectedAchievement.icon} {selectedAchievement.name}</h3>
                        <p>{selectedAchievement.description}</p>
                        <div className="tier-list">
                            {selectedAchievement.tiers.map((tier, i) => {
                                const prog = progress[selectedAchievement.id] || { currentValue: 0, unlockedTiers: [] };
                                const isUnlocked = prog.unlockedTiers.includes(i);
                                return (
                                    <div key={i} className={`tier-item ${isUnlocked ? 'unlocked' : ''}`}>
                                        <span className="tier-target">Tier {i + 1}: {tier.target}</span>
                                        <span className="tier-reward">+{tier.reward} {CURRENCY.symbol}</span>
                                        {tier.title && <span className="tier-title">Title: "{tier.title}"</span>}
                                        {isUnlocked && <span className="tier-check">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .achievements-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 500;
                }
                .achievements-container {
                    width: 90%;
                    max-width: 900px;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #0a0a15 0%, #151525 100%);
                    border: 2px solid #333;
                    border-radius: 15px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .achievements-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 25px;
                    border-bottom: 1px solid #333;
                    background: rgba(0,0,0,0.3);
                }
                .achievements-header h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #ffd700;
                    text-shadow: 0 0 20px rgba(255,215,0,0.5);
                }
                .achievements-total {
                    color: #888;
                    font-size: 16px;
                }
                .close-btn {
                    background: none;
                    border: 1px solid #666;
                    color: #666;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.3s;
                }
                .close-btn:hover {
                    border-color: #f00;
                    color: #f00;
                }
                .achievements-categories {
                    display: flex;
                    gap: 5px;
                    padding: 15px;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid #222;
                    overflow-x: auto;
                }
                .category-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    padding: 10px 20px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: #888;
                    cursor: pointer;
                    transition: all 0.3s;
                    min-width: 80px;
                }
                .category-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                .category-btn.active {
                    background: rgba(0,255,255,0.1);
                    border-color: #0ff;
                    color: #0ff;
                }
                .cat-icon {
                    font-size: 24px;
                }
                .cat-name {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .achievements-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .achievement-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid #222;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .achievement-card:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: #444;
                }
                .achievement-card.selected {
                    border-color: #0ff;
                    background: rgba(0,255,255,0.05);
                }
                .achievement-card.complete {
                    border-color: #ffd700;
                    background: rgba(255,215,0,0.05);
                }
                .achievement-icon {
                    font-size: 36px;
                    width: 50px;
                    text-align: center;
                }
                .achievement-info {
                    flex: 1;
                }
                .achievement-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 3px;
                }
                .achievement-desc {
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 8px;
                }
                .achievement-progress-bar {
                    height: 4px;
                    background: #222;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0ff, #0f0);
                    transition: width 0.3s;
                }
                .achievement-card.complete .progress-fill {
                    background: linear-gradient(90deg, #ffd700, #f90);
                }
                .achievement-progress-text {
                    font-size: 11px;
                    color: #666;
                }
                .achievement-tier {
                    font-size: 14px;
                    color: #666;
                    padding: 5px 10px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 5px;
                }
                .achievement-detail {
                    padding: 20px;
                    border-top: 1px solid #333;
                    background: rgba(0,0,0,0.3);
                }
                .achievement-detail h3 {
                    margin: 0 0 10px 0;
                    color: #fff;
                }
                .achievement-detail p {
                    color: #888;
                    margin: 0 0 15px 0;
                }
                .tier-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .tier-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 5px;
                    font-size: 13px;
                    color: #666;
                }
                .tier-item.unlocked {
                    color: #0f0;
                    background: rgba(0,255,0,0.05);
                }
                .tier-target { flex: 1; }
                .tier-reward { color: #0ff; }
                .tier-title { color: #ffd700; font-style: italic; }
                .tier-check { color: #0f0; font-weight: bold; }
            `}</style>
        </div>
    );
};
