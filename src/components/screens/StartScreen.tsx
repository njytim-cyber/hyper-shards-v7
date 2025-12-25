import React from 'react';
import { useTranslation } from '../../i18n/I18nContext';
import { persistence } from '../../game/systems/Persistence';
// Icons are now handled via SVG sprites defined in index.html
import { ICONS } from '../../game/config/Icons';
import { Icon } from '../ui/Icon';

interface StartScreenProps {
    onStart: () => void;
    onOpenShop: () => void;
    onOpenAchievements?: () => void;
    onOpenPilots?: () => void;
    onOpenCampaign?: () => void;
    onOpenChallenge?: () => void;
    onOpenMatchmaking?: () => void;
    onOpenSettings?: () => void;
    onOpenProfile?: () => void;
    highScore: number;
}

// Local Icon removed

export const StartScreen: React.FC<StartScreenProps> = ({
    onStart,
    onOpenShop,
    onOpenAchievements,
    onOpenPilots,
    onOpenCampaign,
    onOpenChallenge,
    onOpenMatchmaking,
    onOpenSettings,
    onOpenProfile,
    highScore
}) => {
    const { t } = useTranslation();
    const shards = persistence.profile.shards;

    return (
        <div id="start-screen" className="screen-container screen-enter" style={{ justifyContent: 'flex-start', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 0 }}>

            {/* === PROMOS / TICKER === */}
            {/* Ticker Removed */}

            {/* === HEADER: Branding === */}
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <h1 className="screen-title" style={{ fontSize: 'clamp(32px, 8vw, 48px)' }}>
                    HYPER SHARDS
                </h1>
            </div>

            {/* === SETTINGS & CURRENCY (Top Corners) === */}
            <div style={{ position: 'absolute', top: 'max(20px, env(safe-area-inset-top))', left: '20px' }}>
                <button onClick={onOpenShop} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <Icon name={ICONS.Currency.Shard} className="mode-icon" style={{ width: '20px', height: '20px', fill: '#b0f', marginBottom: 0 }} />
                    <span style={{ color: '#b0f', fontWeight: 'bold' }}>{shards.toLocaleString()}</span>
                </button>
            </div>

            {/* === USER PROFILE WIDGET (Top Right) === */}
            <div style={{ position: 'absolute', top: 'max(20px, env(safe-area-inset-top))', right: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {highScore > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <Icon name={ICONS.Menu.Awards} className="mode-icon" style={{ width: '14px', height: '14px', marginBottom: 0, color: '#ffd700' }} />
                        <span style={{ color: '#ffd700', fontWeight: 800, fontSize: '14px' }}>{highScore.toLocaleString()}</span>
                    </div>
                )}
                {onOpenSettings && (
                    <button onClick={onOpenSettings} style={{ background: 'transparent', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer' }}>
                        <Icon name={ICONS.Menu.Settings} className="mode-icon" style={{ width: '24px', height: '24px', marginBottom: 0 }} />
                    </button>
                )}
            </div>

            {/* === GAME HUB CENTER === */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1000px',
                gap: '40px', /* Reduced gap slightly to prevent overflow with top padding */
                paddingBottom: '40px',
                marginTop: '5vh' /* Explicit 5% top margin safe area buffer */
            }}>

                {/* 1. HERO ACTION: ARCADE */}
                <button
                    id="start-btn"
                    className="main-btn juicy-button"
                    onClick={onStart}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        fontSize: '28px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.35) 0%, rgba(0, 200, 200, 0.25) 50%, rgba(0, 255, 255, 0.35) 100%)',
                        border: '3px solid #0ff',
                        boxShadow: '0 0 50px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        letterSpacing: '6px',
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        marginTop: '20px'
                    }}
                >
                    <Icon name={ICONS.Menu.Play} style={{ width: '1.2em', height: '1.2em', filter: 'drop-shadow(0 0 10px #0ff)' }} />
                    <span style={{ fontWeight: 900, textShadow: '0 0 10px rgba(0,255,255,0.8)' }}>ARCADE MODE</span>
                </button>

                {/* 2. MODE GRID */}
                <div className="mode-grid">
                    {onOpenCampaign && (
                        <div className="mode-card cyan" onClick={onOpenCampaign}>
                            <Icon name={ICONS.Game.Level} className="mode-icon" style={{ width: '72px', height: '72px', fill: '#0ff' }} />
                            <span className="mode-label">CAMPAIGN</span>
                        </div>
                    )}

                    {onOpenChallenge && (
                        <div className="mode-card purple" onClick={onOpenChallenge}>
                            <Icon name={ICONS.Game.Time} className="mode-icon" style={{ width: '72px', height: '72px', fill: '#b0f' }} />
                            <span className="mode-label">DAILY RUN</span>
                        </div>
                    )}

                    {onOpenMatchmaking && (
                        <div className="mode-card orange" onClick={onOpenMatchmaking}>
                            <Icon name={ICONS.Game.Boss} className="mode-icon" style={{ width: '72px', height: '72px', fill: '#f80' }} />
                            <span className="mode-label">PVP ARENA</span>
                        </div>
                    )}
                </div>

            </div>

            {/* === NAV DOCK === */}
            <div className="nav-dock">
                <UtilityButton id="start-shop-btn" icon={ICONS.Menu.Shop} label={t('menu.shop')} onClick={onOpenShop} color="#b0f" />
                <UtilityButton id="start-pilots-btn" icon={ICONS.Menu.Pilots} label="Pilots" onClick={onOpenPilots} color="#0ff" />
                <UtilityButton id="start-achievements-btn" icon={ICONS.Menu.Awards} label="Awards" onClick={onOpenAchievements} color="#ffd700" />
                <UtilityButton id="start-profile-btn" icon={ICONS.Menu.Settings} label="Profile" onClick={onOpenProfile} color="#4ade80" />
            </div>

        </div>
    );
};

// Compact utility button component using SVGs and CSS hover effects
interface UtilityButtonProps {
    icon: string;
    label: string;
    onClick?: () => void;
    color: string;
    id?: string;
}

const UtilityButton: React.FC<UtilityButtonProps> = ({ icon, label, onClick, color, id }) => (
    <button
        id={id}
        className="nav-icon-btn"
        onClick={onClick}
        style={{ '--hover-color': color } as React.CSSProperties}
    >
        <div className="icon-wrap">
            <Icon name={icon} />
        </div>
        <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
    </button>
);
