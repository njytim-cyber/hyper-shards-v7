import React from 'react';


interface StartScreenProps {
    onStart: () => void;
    onOpenShop: () => void;
    highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onOpenShop, highScore }) => {
    return (
        <div id="start-screen">
            <h1 className="neon-header cyan-glow">Hyper Shards</h1>
            <div style={{ color: '#ccc', marginBottom: '2vh', fontStyle: 'italic', fontSize: '14px' }}>Created by Ethan and Evan with Gemini 3.0</div>
            <p id="start-highscore" style={{ color: '#ff0', fontWeight: 900, fontSize: '20px', marginBottom: '15px', textShadow: '0 0 20px #ff0', display: highScore > 0 ? 'block' : 'none' }}>
                HIGH SCORE: {highScore}
            </p>
            <div className="instructions-container">
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '10px', textTransform: 'uppercase', borderBottom: '1px solid #333', width: '100%', paddingBottom: '5px', textAlign: 'center' }}>Controls</div>
                <div id="desktop-instructions">
                    <div className="control-row">
                        <div className="control-group"><div className="key-group"><div className="key-icon">W</div><div className="key-icon">A</div><div className="key-icon">S</div><div className="key-icon">D</div></div><div className="label-text">Move</div></div>
                        <div className="control-group" style={{ margin: '0 10px', opacity: 0.3 }}>|</div>
                        <div className="control-group"><div className="key-group"><div className="key-icon">Q</div><div className="key-icon">E</div></div><div className="label-text">Rotate</div></div>
                        <div className="control-group" style={{ margin: '0 10px', opacity: 0.3 }}>|</div>
                        <div className="control-group"><div className="key-icon key-space">SPACE</div><div className="label-text">Shoot</div></div>
                        <div className="control-group"><div className="key-icon">F</div><div className="label-text">Swap</div></div>
                        <div className="control-group"><div className="key-icon">SHIFT</div><div className="label-text">Dash</div></div>
                    </div>
                </div>
                <div id="mobile-instructions">
                    <div className="control-row">
                        <div className="control-group"><svg className="icon-graphic" style={{ width: '48px', height: '30px' }}><use xlinkHref="#icon-touch-left" /></svg><div className="label-text">Move (Left)</div></div>
                        <div className="control-group"><svg className="icon-graphic" style={{ width: '48px', height: '30px' }}><use xlinkHref="#icon-touch-right" /></svg><div className="label-text">Aim & Shoot (Right)</div></div>
                    </div>
                </div>
                <div id="briefing-display" className="briefing-text briefing-visible">INITIALIZING SYSTEM...</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                <button id="start-btn" className="main-btn" onClick={onStart}>LET'S GO!</button>
                <button id="shop-btn" className="main-btn" style={{ background: 'transparent', fontSize: '14px', padding: '10px', width: '200px', border: '1px solid #b0f' }} onClick={onOpenShop}>SPEND MY SHARDS</button>
            </div>
        </div>
    );
};
