
import React, { useMemo } from 'react';
import { ChallengeMode } from '../../game/modes/ChallengeMode';
import { type ChallengeModifier } from '../../game/config/ChallengeModifiers';
import { BackButton } from '../ui/BackButton';
import { ICONS } from '../../game/config/Icons';
import { Icon } from '../ui/Icon';

interface ChallengeScreenProps {
    onClose: () => void;
    onStart: (modifiers: ChallengeModifier[]) => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ onClose, onStart }) => {
    const challenge = useMemo(() => ChallengeMode.getDailyChallenge(), []);

    // Local Icon removed, using global Icon

    if (!challenge) return <div className="screen-container"><div className="feature-desc">Loading Protocol...</div></div>;

    return (
        <div className="screen-container screen-enter">
            {/* Header - Aligned to grid */}
            <div className="screen-header-row" style={{ maxWidth: '1000px', width: '100%' }}>
                <BackButton onClick={onClose} />
                <div style={{ textAlign: 'center', flex: 1 }}> {/* Centered Title for Balance */}
                    <h1 className="screen-title" style={{ marginRight: '0' }}>DAILY RUN</h1>
                    <div className="screen-subtitle">RESETS IN <span style={{ fontFamily: 'monospace', color: '#0ff' }}>04:22:15</span></div>
                </div>
                <div style={{ width: '80px' }}></div> {/* Spacer to balance Back Button */}
            </div>

            <div className="screen-content" style={{ maxWidth: '1000px', width: '100%', gap: '30px' }}>

                {/* Main Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', width: '100%', alignItems: 'start' }}>

                    {/* Left Column: Mission Briefing */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Primary Mission Card */}
                        <div className="feature-card" style={{ borderColor: '#f0f', padding: '25px', alignItems: 'flex-start', background: 'linear-gradient(135deg, rgba(255,0,255,0.05) 0%, rgba(0,0,0,0.4) 100%)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <Icon name={ICONS.Game.Kill} style={{ color: '#f0f', width: '1.2em', height: '1.2em' }} />
                                <div>
                                    <div className="feature-title" style={{ color: '#f0f', textAlign: 'left', marginBottom: '5px' }}>ASTEROID STORM</div>
                                    <div className="feature-desc" style={{ textAlign: 'left', fontSize: '14px', color: '#ddd' }}>
                                        Survive the intense asteroid field with increased spawn rates.
                                        Visibility is reduced. Sensors are fluctuating.
                                    </div>
                                </div>
                            </div>

                            {/* Consolidated Briefing Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', marginTop: '10px' }}>
                                {/* Threat & Flux */}
                                <div className="info-container info-container--threat" style={{ padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ color: '#ff4500', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Icon name={ICONS.Game.Warning} /> HOSTILE THREAT
                                    </div>
                                    <div style={{ fontSize: '16px', color: '#ffaa80' }}>Enemy Speed +20%</div>
                                </div>

                                <div className="info-container info-container--flux" style={{ padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ color: '#d0f', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Icon name={ICONS.Game.Lightning} /> ENV FLUX
                                    </div>
                                    <div style={{ fontSize: '16px', color: '#e0c0ff' }}>Shield Regen -50%</div>
                                </div>

                                {/* Rewards */}
                                <div className="info-container info-container--reward" style={{ gridColumn: 'span 2', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Mission Rewards</div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                                            <Icon name={ICONS.Currency.Gem} style={{ color: '#0ff', width: '1.2em', height: '1.2em' }} /> <span style={{ fontWeight: 'bold' }}>50-150</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                                            <Icon name={ICONS.Currency.Shard} style={{ color: '#b0f', width: '1.2em', height: '1.2em' }} /> <span style={{ fontWeight: 'bold' }}>2000+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Start Button Area */}
                        <div style={{ marginTop: '10px', width: '100%' }}>
                            <button
                                onClick={() => onStart(challenge.modifiers)}
                                className="main-btn btn-primary-pulse"
                                style={{ width: '100%', padding: '20px', fontSize: '24px', letterSpacing: '2px', borderColor: '#f0f', color: '#f0f', background: 'rgba(255, 0, 255, 0.1)' }}
                            >
                                COMMENCE RUN
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Leaderboard */}
                    <div className="feature-card" style={{ height: '100%', alignSelf: 'stretch', background: 'rgba(0,0,0,0.2)', borderColor: '#444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>TOP PILOTS</span>
                            <span style={{ fontSize: '10px', color: '#888', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>GLOBAL</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { name: "Ace_Viper", score: 125400, rank: 1 },
                                { name: "Neon_Drifter", score: 118950, rank: 2 },
                                { name: "Star_Gazer", score: 112300, rank: 3 },
                                { name: "Void_Walker", score: 98750, rank: 4 },
                                { name: "Hyper_Nova", score: 85200, rank: 5 }
                            ].map(player => (
                                <div key={player.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', fontSize: '13px', background: player.rank === 1 ? 'rgba(255, 215, 0, 0.1)' : 'transparent', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{
                                            width: '20px', textAlign: 'center', fontWeight: 'bold',
                                            color: player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : '#666'
                                        }}>#{player.rank}</span>
                                        <span style={{ color: '#ccc' }}>{player.name}</span>
                                    </div>
                                    <span style={{ fontFamily: 'monospace', color: '#0ff' }}>{player.score.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
                            Your Rank: --
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
