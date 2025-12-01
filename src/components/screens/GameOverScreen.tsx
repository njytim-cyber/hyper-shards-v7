import React from 'react';

interface GameOverScreenProps {
    score: number;
    highScore: number;
    isNewHighScore?: boolean;
    onRestart: () => void;
    onOpenShop: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, isNewHighScore, onRestart, onOpenShop }) => {
    const funnyMessages = [
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

    const randomMessage = React.useMemo(() => {
        return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    }, []);

    return (
        <div id="game-over-screen">
            <h1 className="neon-header cyan-glow">{randomMessage}</h1>
            <p id="final-score" style={{ fontSize: '20px', color: '#fff', lineHeight: 1.6, marginBottom: '30px' }}>
                Score: {score}<br />High Score: {highScore}
            </p>
            {isNewHighScore && (
                <div className="blink" style={{ color: '#ff0', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textShadow: '0 0 10px #ff0' }}>
                    NEW HIGH SCORE!
                </div>
            )}
            <div id="restart-btn" className="tap-text blink" style={{ color: '#0ff', fontSize: '20px', cursor: 'pointer' }} onClick={onRestart}>TAP TO RESTART</div>
            <div id="home-btn" className="spend-btn" style={{ marginTop: '20px' }} onClick={onOpenShop}>SPEND MY SHARDS</div>
        </div>
    );
};
