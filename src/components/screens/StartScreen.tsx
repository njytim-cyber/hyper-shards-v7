import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onOpenShop: () => void;
    onOpenAchievements?: () => void;
    onOpenPilots?: () => void;
    onOpenCampaign?: () => void;
    highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
    onStart,
    onOpenShop,
    onOpenAchievements,
    onOpenPilots,
    onOpenCampaign,
    highScore
}) => {

    return (
        <div id="start-screen">
            <h1 className="neon-header cyan-glow">Hyper Shards</h1>
            <div style={{ color: '#ccc', marginBottom: '2vh', fontStyle: 'italic', fontSize: '14px' }}>Created by Ethan and Evan with Gemini 3.0</div>


            <p id="start-highscore" style={{
                color: '#ff0',
                fontWeight: 900,
                fontSize: '20px',
                marginBottom: '15px',
                textShadow: '0 0 20px #ff0',
                display: highScore > 0 ? 'block' : 'none'
            }}>
                HIGH SCORE: {highScore}
            </p>


            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <button id="start-btn" className="main-btn" onClick={onStart}>ARCADE MODE</button>

                {onOpenCampaign && (
                    <button
                        className="main-btn"
                        onClick={onOpenCampaign}
                        style={{
                            background: 'linear-gradient(135deg, #0ff, #0af)',
                            color: '#000',
                            padding: '12px 30px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        🚀 CAMPAIGN
                    </button>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        className="menu-btn"
                        style={{
                            background: 'transparent',
                            padding: '10px 20px',
                            border: '1px solid #b0f',
                            color: '#b0f',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.3s'
                        }}
                        onClick={onOpenShop}
                    >
                        💎 SHOP
                    </button>

                    {onOpenPilots && (
                        <button
                            className="menu-btn"
                            style={{
                                background: 'transparent',
                                padding: '10px 20px',
                                border: '1px solid #0ff',
                                color: '#0ff',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'all 0.3s'
                            }}
                            onClick={onOpenPilots}
                        >
                            👨‍🚀 PILOTS
                        </button>
                    )}

                    {onOpenAchievements && (
                        <button
                            className="menu-btn"
                            style={{
                                background: 'transparent',
                                padding: '10px 20px',
                                border: '1px solid #ffd700',
                                color: '#ffd700',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'all 0.3s'
                            }}
                            onClick={onOpenAchievements}
                        >
                            🏆 ACHIEVEMENTS
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
