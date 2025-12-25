import { useState } from 'react';
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '../../game/config/AchievementConfig';
import { persistence } from '../../game/systems/Persistence';
import { ICONS } from '../../game/config/Icons';
import { CURRENCY } from '../../game/config/CurrencyConfig';
import { BackButton } from '../ui/BackButton';
import { Icon } from '../ui/Icon';

interface AchievementsScreenProps {
    onClose: () => void;
}

const CATEGORIES: { id: AchievementCategory; name: string; icon: string }[] = [
    { id: 'combat', name: 'Combat', icon: ICONS.Game.Sword },
    { id: 'progression', name: 'Progress', icon: ICONS.Menu.Stats },
    { id: 'mastery', name: 'Mastery', icon: ICONS.Game.Target },
    { id: 'collection', name: 'Collection', icon: ICONS.Currency.Shard },
    { id: 'special', name: 'Special', icon: ICONS.Game.Star },
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
        <div className="screen-container screen-enter" style={{ paddingTop: '5vh' }}>
            <div className="screen-header-row" style={{ maxWidth: '1000px', width: '100%', marginBottom: '20px' }}>
                <div style={{ width: '100px' }}>
                    <BackButton onClick={onClose} label="BACK" />
                </div>
                <div className="screen-title-group">
                    <h1 className="screen-title">ACHIEVEMENTS</h1>
                    <span className="screen-subtitle">
                        {unlocked} / {total} UNLOCKED
                    </span>
                </div>
                <div style={{ fontSize: '20px', color: '#0ff', fontWeight: 'bold' }}>
                    {CURRENCY.symbol} {persistence.profile.shards}
                </div>
            </div>

            <div className="screen-content">
                {/* Category Tabs - Centered and Wrapped */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`menu-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            style={{
                                flex: '1 1 120px', /* Allow flex grow/shrink, min width 120px */
                                maxWidth: '160px',
                                justifyContent: 'center',
                                backgroundColor: selectedCategory === cat.id ? 'rgba(0,255,255,0.1)' : 'transparent',
                                borderColor: selectedCategory === cat.id ? '#0ff' : '#444',
                                color: selectedCategory === cat.id ? '#0ff' : '#888',
                                padding: '10px 5px',
                                gap: '5px'
                            }}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                setSelectedAchievement(null);
                            }}
                        >
                            <Icon name={cat.icon} style={{ fontSize: '16px' }} />
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Grid: List + Details */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 1fr) 350px',
                    gap: '20px',
                    width: '100%',
                    flex: 1,
                    overflow: 'hidden'
                }}>

                    {/* Left: Achievement List */}
                    <div style={{ overflowY: 'auto', paddingRight: '5px' }}>
                        <div className="feature-grid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
                            {achievements
                                .sort((a, b) => {
                                    // Sorting logic remains same
                                    // const progA = progress[a.id];
                                    // const progB = progress[b.id];
                                    // const isCompleteA = progA?.unlockedTiers.length === a.tiers.length;
                                    // const isCompleteB = progB?.unlockedTiers.length === b.tiers.length;
                                    // Simple Claimable check requires calculating current target again, skipping precise sort logic copy for brevity if acceptable, 
                                    // but preserving original sort logic is safer:
                                    const getSortWeight = (ach: Achievement) => {
                                        const p = progress[ach.id] || { currentValue: 0, unlockedTiers: [] };
                                        const highest = ach.tiers.length;
                                        const unlocked = p.unlockedTiers.length;
                                        const currentTierIdx = Math.min(unlocked, highest - 1);
                                        const target = ach.tiers[currentTierIdx]?.target;
                                        const isComp = unlocked === highest;
                                        const isClaim = !isComp && p.currentValue >= target;
                                        if (isClaim) return 3;
                                        if (!isComp) return 2; // In progress
                                        return 1; // Complete
                                    };
                                    return getSortWeight(b) - getSortWeight(a);
                                })
                                .map(achievement => {
                                    const prog = progress[achievement.id] || { currentValue: 0, unlockedTiers: [] };
                                    const highestTier = achievement.tiers.length;
                                    const unlockedCount = prog.unlockedTiers.length;
                                    const currentTierIndex = Math.min(unlockedCount, highestTier - 1);
                                    const currentTarget = achievement.tiers[currentTierIndex]?.target || achievement.tiers[highestTier - 1].target;
                                    const progressPercent = Math.min(100, (prog.currentValue / currentTarget) * 100);
                                    const isComplete = unlockedCount === highestTier;
                                    const nextReward = !isComplete ? achievement.tiers[unlockedCount]?.reward : 0;
                                    const isClaimable = !isComplete && prog.currentValue >= currentTarget;

                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`feature-card ${selectedAchievement?.id === achievement.id ? 'selected' : ''}`}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                textAlign: 'left',
                                                padding: '12px 15px',
                                                borderColor: isClaimable ? '#ffd700' : (selectedAchievement?.id === achievement.id ? '#0ff' : (isComplete ? '#333' : 'rgba(255,255,255,0.1)')),
                                                opacity: isComplete && selectedAchievement?.id !== achievement.id ? 0.6 : 1,
                                                background: selectedAchievement?.id === achievement.id ? 'rgba(0,255,255,0.05)' : 'rgba(0,0,0,0.2)'
                                            }}
                                            onClick={() => setSelectedAchievement(achievement)}
                                        >
                                            <div className="feature-icon" style={{ fontSize: '24px', margin: 0, width: '40px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                                <Icon name={achievement.icon} />
                                            </div>
                                            <div style={{ flex: 1, padding: '0 15px', overflow: 'hidden' }}>
                                                <div className="feature-title" style={{ textAlign: 'left', fontSize: '14px', color: isComplete ? '#aaa' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {achievement.name}
                                                </div>
                                                <div style={{ height: '4px', background: '#222', borderRadius: '2px', marginTop: '6px', width: '100%' }}>
                                                    <div style={{
                                                        width: `${progressPercent}%`,
                                                        height: '100%',
                                                        background: isClaimable ? '#ffd700' : (isComplete ? '#444' : '#0ff'),
                                                        borderRadius: '2px'
                                                    }} />
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right', minWidth: '60px' }}>
                                                {isClaimable ? (
                                                    <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '12px' }}>!</span>
                                                ) : isComplete ? (
                                                    <span style={{ color: '#0f0', fontSize: '12px' }}>✔</span>
                                                ) : (
                                                    <span style={{ color: '#b0f', fontSize: '12px', fontWeight: 'bold' }}>{nextReward}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Right: Detail Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {selectedAchievement ? (
                            <div className="detail-panel" style={{ height: 'auto', maxHeight: '100%', overflowY: 'auto' }}>
                                <div className="detail-header">
                                    <h2 style={{ color: '#0ff', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Icon name={selectedAchievement.icon} style={{ fontSize: '24px' }} />
                                        {selectedAchievement.name}
                                    </h2>
                                </div>
                                <div className="feature-desc" style={{ fontSize: '14px', textAlign: 'left', marginBottom: '15px', lineHeight: '1.5' }}>
                                    {selectedAchievement.description}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedAchievement.tiers.map((tier, i) => {
                                        const prog = progress[selectedAchievement.id] || { currentValue: 0, unlockedTiers: [] };
                                        const isUnlocked = prog.unlockedTiers.includes(i);
                                        const unlockedCount = prog.unlockedTiers.length;
                                        const isNext = i === unlockedCount;
                                        const canClaim = !isUnlocked && isNext && prog.currentValue >= tier.target;

                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    padding: '10px',
                                                    background: isUnlocked ? 'rgba(0,255,0,0.05)' : (canClaim ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)'),
                                                    borderRadius: '6px',
                                                    border: '1px solid',
                                                    borderColor: isUnlocked ? '#0f0' : (canClaim ? '#ffd700' : '#333'),
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ color: isUnlocked || canClaim ? '#fff' : '#666' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>TIER {i + 1}</div>
                                                    <div style={{ fontSize: '11px' }}>Target: {tier.target}</div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#b0f', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                        +{tier.reward} <Icon name={ICONS.Currency.Shard} />
                                                    </div>
                                                    {canClaim && <div style={{ color: '#ffd700', fontSize: '10px', fontWeight: 'bold' }}>CLAIM</div>}
                                                    {isUnlocked && <div style={{ color: '#0f0', fontSize: '12px' }}>✔</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="detail-panel" style={{ height: '100%', opacity: 0.5, alignItems: 'center', justifyContent: 'center', display: 'flex', borderStyle: 'dashed' }}>
                                <div className="feature-desc">Select an achievement</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
