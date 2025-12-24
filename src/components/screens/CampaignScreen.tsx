import React, { useState } from 'react';
import { CAMPAIGN_LEVELS, isLevelUnlocked, type CampaignLevel, MAX_CAMPAIGN_STARS } from '../../game/config/CampaignConfig';
import { persistence } from '../../game/systems/Persistence';

interface CampaignScreenProps {
    onClose: () => void;
    onStartLevel: (levelId: number) => void;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <span style={{
        color: filled ? '#ffd700' : '#333',
        textShadow: filled ? '0 0 10px #ffd700' : 'none',
        fontSize: '16px'
    }}>★</span>
);

const LevelCard: React.FC<{
    level: CampaignLevel;
    isUnlocked: boolean;
    stars: number;
    isSelected: boolean;
    onClick: () => void;
}> = ({ level, isUnlocked, stars, isSelected, onClick }) => {
    const typeColors: Record<string, string> = {
        standard: '#0ff',
        boss: '#f0f',
        survival: '#f80',
        boss_rush: '#f00'
    };

    const borderColor = isUnlocked ? typeColors[level.type] : '#333';

    return (
        <button
            onClick={onClick}
            disabled={!isUnlocked}
            style={{
                width: '100%',
                aspectRatio: '1',
                background: isSelected
                    ? `linear-gradient(135deg, ${borderColor}22, ${borderColor}44)`
                    : isUnlocked ? 'rgba(0,0,0,0.6)' : 'rgba(20,20,20,0.8)',
                border: `2px solid ${isSelected ? '#fff' : borderColor}`,
                borderRadius: '10px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                transition: 'all 0.2s',
                opacity: isUnlocked ? 1 : 0.5,
                boxShadow: isSelected ? `0 0 20px ${borderColor}` : 'none'
            }}
        >
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: borderColor,
                marginBottom: '4px'
            }}>
                {isUnlocked ? level.id : '🔒'}
            </div>
            {isUnlocked && (
                <>
                    <div style={{
                        fontSize: '10px',
                        color: '#aaa',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                    }}>
                        {level.name}
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <StarIcon filled={stars >= 1} />
                        <StarIcon filled={stars >= 2} />
                        <StarIcon filled={stars >= 3} />
                    </div>
                </>
            )}
        </button>
    );
};

export const CampaignScreen: React.FC<CampaignScreenProps> = ({ onClose, onStartLevel }) => {
    const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(null);
    const { campaign, gems, shards } = persistence.profile;
    const totalStars = persistence.getCampaignStars();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            overflow: 'auto'
        }}>
            {/* Header */}
            <div style={{
                width: '100%',
                maxWidth: '800px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: '1px solid #666',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    ← BACK
                </button>

                <h1 style={{
                    color: '#0ff',
                    fontSize: '28px',
                    textShadow: '0 0 20px #0ff',
                    margin: 0
                }}>
                    CAMPAIGN
                </h1>

                <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                    <span style={{ color: '#ffd700' }}>⭐ {totalStars}/{MAX_CAMPAIGN_STARS}</span>
                    <span style={{ color: '#b0f' }}>💎 {shards}</span>
                    <span style={{ color: '#0ff' }}>💠 {gems}</span>
                </div>
            </div>

            {/* Level Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                width: '100%',
                maxWidth: '500px',
                marginBottom: '20px'
            }}>
                {CAMPAIGN_LEVELS.map(level => {
                    const isUnlocked = isLevelUnlocked(level.id, campaign.completedLevels);
                    const stars = campaign.levelStars[level.id] || 0;

                    return (
                        <LevelCard
                            key={level.id}
                            level={level}
                            isUnlocked={isUnlocked}
                            stars={stars}
                            isSelected={selectedLevel?.id === level.id}
                            onClick={() => setSelectedLevel(level)}
                        />
                    );
                })}
            </div>

            {/* Level Details Panel */}
            {selectedLevel && (
                <div style={{
                    width: '100%',
                    maxWidth: '500px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid #0ff',
                    borderRadius: '10px',
                    padding: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <h2 style={{
                                color: '#0ff',
                                margin: 0,
                                fontSize: '20px'
                            }}>
                                {selectedLevel.id}. {selectedLevel.name}
                            </h2>
                            <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                                {selectedLevel.subtitle}
                            </div>
                        </div>
                        <div style={{
                            background: selectedLevel.type === 'boss' ? '#f0f' :
                                selectedLevel.type === 'survival' ? '#f80' :
                                    selectedLevel.type === 'boss_rush' ? '#f00' : '#0ff',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}>
                            {selectedLevel.type.toUpperCase().replace('_', ' ')}
                        </div>
                    </div>

                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '15px' }}>
                        {selectedLevel.description}
                    </p>

                    {/* Star Objectives */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ color: '#ffd700', fontSize: '12px', marginBottom: '8px' }}>
                            OBJECTIVES:
                        </div>
                        {selectedLevel.stars.map((star, i) => {
                            const currentStars = campaign.levelStars[selectedLevel.id] || 0;
                            const achieved = currentStars > i;
                            return (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px',
                                    opacity: achieved ? 1 : 0.6
                                }}>
                                    <StarIcon filled={achieved} />
                                    <span style={{ color: '#aaa', fontSize: '12px' }}>
                                        {star.description}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Rewards */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#0f0', fontSize: '12px', marginBottom: '8px' }}>
                            REWARDS:
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#b0f', fontSize: '12px' }}>
                                💎 {selectedLevel.rewards.complete.shards} shards
                            </span>
                            {selectedLevel.rewards.complete.unlock && (
                                <span style={{ color: '#ffd700', fontSize: '12px' }}>
                                    🎁 {selectedLevel.rewards.complete.unlock.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => onStartLevel(selectedLevel.id)}
                        disabled={!isLevelUnlocked(selectedLevel.id, campaign.completedLevels)}
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: 'linear-gradient(135deg, #0ff, #0af)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        START MISSION
                    </button>
                </div>
            )}
        </div>
    );
};
