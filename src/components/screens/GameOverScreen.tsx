import React, { useMemo } from 'react';
import { CURRENCY } from '../../game/config/CurrencyConfig';
import { ICONS } from '../../game/config/Icons';
import { Icon } from '../ui/Icon';

interface GameOverScreenProps {
    score: number;
    highScore: number;
    isNewHighScore?: boolean;
    isVictory?: boolean;
    onRestart: () => void;
    onOpenShop: () => void;
}

const FUNNY_MESSAGES = [
    "GAME OVER MAN, GAME OVER",
    "MISSION FAILED SUCCESSFULLY",
    "ASTEROID HUGGED YOU",
    "SPACESHIP NEEDS A NAP",
    "OUT OF FUEL (AND LUCK)",
    "BETTER LUCK NEXT ORBIT",
    "YOU BECAME STARDUST",
    "NICE TRY, CAPTAIN!",
    "R.I.P. (REST IN PLASMA)",
    "DID YOU FORGET TO DASH?"
];

const VICTORY_MESSAGES = [
    "MOTHERSHIP DESTROYED!",
    "HUMANITY IS SAVED!",
    "YOU ARE A LEGEND!",
    "THE COLLECTIVE FALLS!",
    "GALAXY DEFENDER!"
];

// Stable instance counter for component IDs (avoids random during render)
let instanceCounter = 0;

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
    score,
    highScore,
    isNewHighScore,
    isVictory,
    onRestart,
    onOpenShop
}) => {
    // Generate stable ID on first mount using useMemo with empty deps
    const instanceId = useMemo(() => instanceCounter++, []);

    // Use instance ID to seed deterministic message selection
    const randomMessage = useMemo(() => {
        const funnyIdx = instanceId % FUNNY_MESSAGES.length;
        const victoryIdx = instanceId % VICTORY_MESSAGES.length;
        return isVictory
            ? VICTORY_MESSAGES[victoryIdx]
            : FUNNY_MESSAGES[funnyIdx];
    }, [isVictory, instanceId]);

    return (
        <div id="game-over-screen" className="screen-enter" style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: isVictory
                ? 'linear-gradient(135deg, rgba(0,50,0,0.95) 0%, rgba(0,0,0,0.98) 100%)'
                : 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            {isVictory && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
            )}

            <h1
                className="screen-title"
                style={{
                    color: isVictory ? '#ffd700' : '#0ff',
                    textShadow: isVictory ? '0 0 30px #ffd700, 0 0 60px #ff0' : undefined,
                    marginBottom: '10px',
                    fontSize: '48px'
                }}
            >
                {randomMessage}
            </h1>

            {isVictory && (
                <div style={{
                    fontSize: '80px',
                    margin: '10px 0',
                    animation: 'victoryPulse 1s infinite'
                }}>
                    <Icon name={ICONS.Menu.Awards} />
                </div>
            )}

            <div className="feature-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', marginBottom: '30px', borderColor: isVictory ? '#ffd700' : '#444' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                    SCORE: <span style={{ fontFamily: 'monospace', color: '#0ff' }}>{score.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
                    HIGH SCORE: <span style={{ fontFamily: 'monospace' }}>{highScore.toLocaleString()}</span>
                </div>

                {isNewHighScore && (
                    <div className="blink" style={{ color: '#ff0', fontWeight: 'bold', marginTop: '15px' }}>
                        ★ NEW HIGH SCORE! ★
                    </div>
                )}
            </div>

            {isVictory && (
                <div style={{
                    color: '#0f0',
                    fontSize: '16px',
                    marginBottom: '20px',
                    padding: '10px 20px',
                    background: 'rgba(0,255,0,0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,255,0,0.3)'
                }}>
                    <Icon name={ICONS.Status.Party} style={{ marginRight: '8px' }} /> +500 {CURRENCY.symbol} Bonus Awarded!
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                <button
                    id="restart-btn"
                    className="main-btn"
                    style={{
                        width: '250px',
                        background: isVictory ? 'linear-gradient(90deg, #ffd700, #ff8800)' : undefined,
                        borderColor: isVictory ? '#ffd700' : undefined,
                        color: isVictory ? '#000' : undefined
                    }}
                    onClick={onRestart}
                >
                    {isVictory ? <><Icon name={ICONS.Menu.Awards} style={{ marginRight: '8px' }} /> PLAY AGAIN</> : <><Icon name={ICONS.Menu.Play} style={{ marginRight: '8px' }} /> RESTART</>}
                </button>

                <button
                    id="home-btn"
                    className="menu-btn"
                    style={{ width: '250px', color: '#b0f', borderColor: '#b0f' }}
                    onClick={onOpenShop}
                >
                    <Icon name={ICONS.Menu.Shop} style={{ marginRight: '8px' }} /> SPEND SHARDS
                </button>
            </div>

            <LeaderboardDisplay />

            <style>{`
                @keyframes victoryPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

interface LeaderboardScore {
    username: string | null;
    score: number;
    wave: number;
}

const LeaderboardDisplay: React.FC = () => {
    const [scores, setScores] = React.useState<LeaderboardScore[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Dynamic import to avoid circular dependencies if any, or just direct import
        import('../../game/systems/Persistence').then(({ persistence }) => {
            persistence.getLeaderboard(5).then(data => {
                setScores(data);
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div style={{ color: '#aaa', marginTop: '20px', fontSize: '12px' }}>Loading leaderboards...</div>;
    if (scores.length === 0) return null;

    return (
        <div className="feature-card" style={{ marginTop: '20px', maxWidth: '400px', width: '100%', padding: '15px', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ color: '#ffd700', borderBottom: '1px solid #444', paddingBottom: '5px', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>GLOBAL TOP 5</div>
            <table style={{ width: '100%', fontSize: '14px', color: '#ccc', borderCollapse: 'collapse' }}>
                <tbody>
                    {scores.map((s, i) => (
                        <tr key={i} style={{ borderBottom: i < scores.length - 1 ? '1px solid #333' : 'none' }}>
                            <td style={{ padding: '8px 5px', color: i === 0 ? '#ff0' : (i < 3 ? '#fff' : '#aaa'), fontWeight: 'bold' }}>#{i + 1}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'left' }}>{s.username || 'Unknown Pilot'}</td>
                            <td style={{ padding: '8px 5px', color: '#0ff', textAlign: 'right', fontFamily: 'monospace' }}>{s.score.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
