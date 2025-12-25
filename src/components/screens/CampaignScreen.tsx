import React, { useState, useMemo } from 'react';
import { CAMPAIGN_LEVELS, isLevelUnlocked, type CampaignLevel, MAX_CAMPAIGN_STARS } from '../../game/config/CampaignConfig';
import { persistence } from '../../game/systems/Persistence';
import { ICONS } from '../../game/config/Icons';
import { BackButton } from '../ui/BackButton';
import { Icon } from '../ui/Icon';

interface CampaignScreenProps {
    onClose: () => void;
    onStartLevel: (levelId: number) => void;
}

// Node positions for the star map (percentage-based for responsiveness)
const NODE_POSITIONS: Record<number, { x: number; y: number }> = {
    1: { x: 10, y: 85 },
    2: { x: 18, y: 70 },
    3: { x: 28, y: 60 },
    4: { x: 38, y: 48 },
    5: { x: 48, y: 38 },
    6: { x: 58, y: 30 },
    7: { x: 68, y: 22 },
    8: { x: 78, y: 35 },
    9: { x: 72, y: 50 },
    10: { x: 62, y: 62 },
    11: { x: 52, y: 75 },
    12: { x: 42, y: 85 },
    13: { x: 55, y: 92 },
    14: { x: 85, y: 75 },
    15: { x: 90, y: 55 }
};

// Connection paths between levels
const CONNECTIONS: [number, number][] = [
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
    [13, 14], [14, 15]
];

const StarIcon: React.FC<{ filled: boolean; size?: number }> = ({ filled, size = 12 }) => (
    <span style={{
        color: filled ? '#ffd700' : '#444',
        textShadow: filled ? '0 0 8px #ffd700' : 'none',
        fontSize: `${size}px`,
        lineHeight: 1
    }}>★</span>
);

const MapNode: React.FC<{
    level: CampaignLevel;
    x: number;
    y: number;
    isUnlocked: boolean;
    isCompleted: boolean;
    stars: number;
    isSelected: boolean;
    onClick: () => void;
}> = ({ level, x, y, isUnlocked, isCompleted, stars, isSelected, onClick }) => {
    const nodeColor = !isUnlocked ? '#333' :
        level.type === 'boss' || level.type === 'boss_rush' ? '#f44' :
            level.type === 'survival' ? '#fa0' : '#0ff';

    const nodeSize = level.type === 'boss' || level.type === 'boss_rush' ? 50 :
        level.type === 'survival' ? 45 : 38;

    return (
        <g
            onClick={isUnlocked ? onClick : undefined}
            style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
            transform={`translate(${x}, ${y})`}
        >
            {/* Glow effect for unlocked nodes */}
            {isUnlocked && (
                <circle
                    r={nodeSize * 0.8}
                    fill="transparent"
                    stroke={nodeColor}
                    strokeWidth="2"
                    opacity="0.3"
                    style={{
                        animation: isSelected ? 'pulse 1.5s infinite' : 'none',
                        filter: `drop-shadow(0 0 ${isSelected ? 15 : 8}px ${nodeColor})`
                    }}
                />
            )}

            {/* Main node */}
            <circle
                r={nodeSize / 2}
                fill={isUnlocked ? `${nodeColor}33` : '#111'}
                stroke={isUnlocked ? nodeColor : '#333'}
                strokeWidth={isSelected ? 3 : 2}
                style={{
                    filter: isUnlocked ? `drop-shadow(0 0 10px ${nodeColor})` : 'none',
                    transition: 'all 0.3s ease'
                }}
            />

            {/* Level number or lock icon */}
            <text
                y={isUnlocked ? 5 : 4}
                textAnchor="middle"
                fill={isUnlocked ? '#fff' : '#555'}
                fontSize={isUnlocked ? 14 : 12}
                fontWeight="bold"
                fontFamily="sans-serif"
            >
                {isUnlocked ? level.id : '🔒'}
            </text>

            {/* Stars indicator for completed levels */}
            {isCompleted && stars > 0 && (
                <g transform={`translate(0, ${nodeSize / 2 + 10})`}>
                    <rect
                        x={-20}
                        y={-8}
                        width={40}
                        height={16}
                        rx={8}
                        fill="rgba(0,0,0,0.7)"
                    />
                    <text
                        textAnchor="middle"
                        y={4}
                        fontSize={10}
                        fill="#ffd700"
                    >
                        {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                    </text>
                </g>
            )}

            {/* Level name tooltip on hover */}
            {isUnlocked && isSelected && (
                <g transform={`translate(0, ${-nodeSize / 2 - 25})`}>
                    <rect
                        x={-60}
                        y={-12}
                        width={120}
                        height={24}
                        rx={4}
                        fill="rgba(0,0,0,0.9)"
                        stroke={nodeColor}
                        strokeWidth={1}
                    />
                    <text
                        textAnchor="middle"
                        y={4}
                        fontSize={10}
                        fill="#fff"
                        fontWeight="bold"
                    >
                        {level.name}
                    </text>
                </g>
            )}
        </g>
    );
};

export const CampaignScreen: React.FC<CampaignScreenProps> = ({ onClose, onStartLevel }) => {
    const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(null);
    const { campaign, gems, shards } = persistence.profile;
    const totalStars = persistence.getCampaignStars();

    // Generate SVG paths for connections
    const connectionPaths = useMemo(() => {
        return CONNECTIONS.map(([from, to]) => {
            const fromPos = NODE_POSITIONS[from];
            const toPos = NODE_POSITIONS[to];
            const isCompleted = campaign.completedLevels.includes(from);
            const isNextUnlocked = isLevelUnlocked(to, campaign.completedLevels);

            return {
                from,
                to,
                path: `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`,
                color: isCompleted ? '#0ff' : isNextUnlocked ? '#666' : '#333',
                opacity: isCompleted ? 0.8 : 0.4,
                animated: isCompleted
            };
        });
    }, [campaign.completedLevels]);

    return (
        <div
            className="screen-container screen-enter"
            style={{
                padding: 0,
                background: `url('/assets/starmap_bg.png') center center / cover no-repeat`,
                position: 'relative'
            }}
        >
            {/* Overlay gradient */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 'max(20px, env(safe-area-inset-top))',
                left: '20px',
                right: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <BackButton onClick={onClose} label="BACK" />

                <h1 style={{
                    color: '#0ff',
                    fontSize: '28px',
                    fontWeight: 900,
                    letterSpacing: '6px',
                    textShadow: '0 0 20px #0ff, 0 2px 4px rgba(0,0,0,0.5)',
                    margin: 0
                }}>
                    STAR MAP
                </h1>

                <div style={{ display: 'flex', gap: '15px', fontSize: '14px', fontWeight: 'bold', alignItems: 'center' }}>
                    <span style={{ color: '#ffd700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name={ICONS.Game.Star} /> {totalStars}/{MAX_CAMPAIGN_STARS}
                    </span>
                    <span style={{ color: '#b0f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name={ICONS.Currency.Shard} /> {shards}
                    </span>
                    <span style={{ color: '#0ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name={ICONS.Currency.Gem} /> {gems}
                    </span>
                </div>
            </div>

            {/* Star Map SVG */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%'
                }}
            >
                <defs>
                    {/* Glow filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Animated dash for active paths */}
                    <style>{`
                        @keyframes dash {
                            to { stroke-dashoffset: 0; }
                        }
                        @keyframes pulse {
                            0%, 100% { opacity: 0.3; transform: scale(1); }
                            50% { opacity: 0.6; transform: scale(1.1); }
                        }
                    `}</style>
                </defs>

                {/* Connection lines */}
                {connectionPaths.map(({ from, to, path, color, opacity, animated }) => (
                    <path
                        key={`${from}-${to}`}
                        d={path}
                        stroke={color}
                        strokeWidth="0.3"
                        fill="none"
                        opacity={opacity}
                        strokeDasharray={animated ? "1 0.5" : "none"}
                        style={{
                            filter: animated ? 'url(#glow)' : 'none',
                            animation: animated ? 'dash 20s linear infinite' : 'none',
                            strokeDashoffset: animated ? 100 : 0
                        }}
                    />
                ))}

                {/* Level nodes */}
                {CAMPAIGN_LEVELS.map(level => {
                    const pos = NODE_POSITIONS[level.id];
                    if (!pos) return null;

                    const isUnlocked = isLevelUnlocked(level.id, campaign.completedLevels);
                    const isCompleted = campaign.completedLevels.includes(level.id);
                    const stars = campaign.levelStars[level.id] || 0;

                    return (
                        <MapNode
                            key={level.id}
                            level={level}
                            x={pos.x}
                            y={pos.y}
                            isUnlocked={isUnlocked}
                            isCompleted={isCompleted}
                            stars={stars}
                            isSelected={selectedLevel?.id === level.id}
                            onClick={() => setSelectedLevel(level)}
                        />
                    );
                })}
            </svg>

            {/* Level Details Panel */}
            <div style={{
                position: 'absolute',
                bottom: 'max(20px, env(safe-area-inset-bottom))',
                left: '20px',
                right: '20px',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10
            }}>
                {selectedLevel ? (
                    <div style={{
                        background: 'rgba(10, 15, 30, 0.95)',
                        border: '1px solid rgba(0, 255, 255, 0.3)',
                        borderRadius: '16px',
                        padding: '20px 30px',
                        maxWidth: '600px',
                        width: '100%',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div>
                                <h2 style={{ color: '#0ff', margin: 0, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                    {selectedLevel.id}. {selectedLevel.name}
                                </h2>
                                <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                                    {selectedLevel.subtitle}
                                </div>
                            </div>
                            <span style={{
                                background: selectedLevel.type === 'boss' || selectedLevel.type === 'boss_rush' ? 'rgba(255,68,68,0.2)' :
                                    selectedLevel.type === 'survival' ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,255,0.2)',
                                color: selectedLevel.type === 'boss' || selectedLevel.type === 'boss_rush' ? '#f44' :
                                    selectedLevel.type === 'survival' ? '#fa0' : '#0ff',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {selectedLevel.type.replace('_', ' ')}
                            </span>
                        </div>

                        <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 15px', lineHeight: 1.4 }}>
                            {selectedLevel.description}
                        </p>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            {/* Star objectives */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3].map(i => (
                                    <StarIcon
                                        key={i}
                                        filled={(campaign.levelStars[selectedLevel.id] || 0) >= i}
                                        size={18}
                                    />
                                ))}
                            </div>

                            {/* Rewards preview */}
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                                <span style={{ color: '#b0f' }}>
                                    <Icon name={ICONS.Currency.Shard} /> {selectedLevel.rewards.complete.shards}
                                </span>
                                {selectedLevel.rewards.complete.unlock && (
                                    <span style={{ color: '#ffd700' }}>
                                        <Icon name={ICONS.Actions.Claim} /> {selectedLevel.rewards.complete.unlock.name}
                                    </span>
                                )}
                            </div>

                            {/* Start button */}
                            <button
                                onClick={() => onStartLevel(selectedLevel.id)}
                                disabled={!isLevelUnlocked(selectedLevel.id, campaign.completedLevels)}
                                className="main-btn"
                                style={{
                                    marginLeft: 'auto',
                                    padding: '12px 30px',
                                    fontSize: '14px',
                                    minWidth: '140px'
                                }}
                            >
                                START
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(10, 15, 30, 0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '15px 30px',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        Select a mission node to view details
                    </div>
                )}
            </div>
        </div>
    );
};
