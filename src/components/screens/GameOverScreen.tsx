import React, { useMemo } from 'react';
import { CURRENCY } from '../../game/config/CurrencyConfig';

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
        <div id="game-over-screen" style={{
            background: isVictory
                ? 'linear-gradient(135deg, rgba(0,50,0,0.95) 0%, rgba(0,0,0,0.98) 100%)'
                : undefined
        }}>
            {isVictory && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 30%, rgba(255,215,0,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
            )}

            <h1
                className="neon-header"
                style={{
                    color: isVictory ? '#ffd700' : '#0ff',
                    textShadow: isVictory
                        ? '0 0 30px #ffd700, 0 0 60px #ff0'
                        : '0 0 20px #0ff'
                }}
            >
                {randomMessage}
            </h1>

            {isVictory && (
                <div style={{
                    fontSize: '80px',
                    margin: '20px 0',
                    animation: 'victoryPulse 1s infinite'
                }}>
                    🏆
                </div>
            )}

            <p id="final-score" style={{
                fontSize: '20px',
                color: '#fff',
                lineHeight: 1.6,
                marginBottom: '30px'
            }}>
                Score: {score}<br />High Score: {highScore}
            </p>

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
                    🎉 +500 {CURRENCY.symbol} Bonus Awarded!
                </div>
            )}

            {isNewHighScore && (
                <div className="blink" style={{
                    color: '#ff0',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    textShadow: '0 0 10px #ff0'
                }}>
                    NEW HIGH SCORE!
                </div>
            )}

            <div
                id="restart-btn"
                className="tap-text blink"
                style={{ color: isVictory ? '#ffd700' : '#0ff', fontSize: '20px', cursor: 'pointer' }}
                onClick={onRestart}
            >
                {isVictory ? 'PLAY AGAIN' : 'TAP TO RESTART'}
            </div>

            <div
                id="home-btn"
                className="spend-btn"
                style={{ marginTop: '20px' }}
                onClick={onOpenShop}
            >
                SPEND MY SHARDS
            </div>

            <style>{`
                @keyframes victoryPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};
