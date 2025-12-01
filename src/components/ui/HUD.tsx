import React, { useEffect, useRef } from 'react';
import { gameEngine } from '../../game/core/GameEngine';

interface HUDProps {
    lives: number;
    shields: number;
    weapon: string;
    shards: number;
    onPause: () => void;
    showWave?: boolean;
    wave: number; // Keep wave as prop for structural visibility changes, or ref it too? Wave changes rarely.
}

// Sub-components (No React.memo, relying on React Compiler)
const LivesDisplay = ({ lives, shields }: { lives: number, shields: number }) => (
    <div id="lives-display">
        {Array.from({ length: Math.min(lives, 10) }).map((_, i) => (
            <svg key={`life-${i}`} className="hud-icon life-heart"><use xlinkHref="#icon-heart" /></svg>
        ))}
        {Array.from({ length: Math.min(shields, 5) }).map((_, i) => (
            <svg key={`shield-${i}`} className="hud-icon shield-pip"><use xlinkHref="#icon-shield-hud" /></svg>
        ))}
    </div>
);

const CurrencyDisplay = ({ shards }: { shards: number }) => (
    <div id="currency-display">
        <svg className="shard-icon"><use xlinkHref="#icon-shard" /></svg>
        <span id="hud-shards">{shards}</span>
    </div>
);

const WeaponDisplay = ({ weapon }: { weapon: string }) => (
    <button id="weapon-display-desktop" className="hud-btn" style={{
        borderColor: weapon === 'SPREAD' ? '#0f0' : weapon === 'RAPID' ? '#f0f' : weapon === 'HEAVY' ? '#f00' : '#ff0',
        color: weapon === 'SPREAD' ? '#0f0' : weapon === 'RAPID' ? '#f0f' : weapon === 'HEAVY' ? '#f00' : '#ff0',
        boxShadow: `0 0 15px ${weapon === 'SPREAD' ? '#0f0' : weapon === 'RAPID' ? '#f0f' : weapon === 'HEAVY' ? '#f00' : '#ff0'}`
    }}>
        <svg className="hud-icon" id="weapon-icon-desktop" style={{
            color: 'currentColor',
            filter: `drop-shadow(0 0 5px currentColor)`
        }}>
            <use xlinkHref={weapon === 'SPREAD' ? '#icon-spread' : weapon === 'RAPID' ? '#icon-rapid' : weapon === 'HEAVY' ? '#icon-heavy' : '#icon-blaster'} />
        </svg>
        <span id="weapon-val-desktop">{weapon}</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>(F)</span>
    </button>
);

const MobileControls = () => (
    <>
        <div id="mobile-controls-left">
            <div id="btn-dash-mobile" className="mobile-btn">
                <svg className="hud-icon"><use xlinkHref="#icon-dash" /></svg>
                <span style={{ fontSize: '8px', fontWeight: 'bold', marginTop: '2px' }}>DASH</span>
            </div>
        </div>
        <div id="mobile-controls-right">
            <div id="weapon-display-mobile" className="mobile-btn" style={{ borderColor: '#ff0', color: '#ff0' }}>
                <svg className="hud-icon" id="weapon-icon-mobile"><use xlinkHref="#icon-blaster" /></svg>
                <span id="weapon-val-mobile" style={{ fontSize: '8px', fontWeight: 'bold', marginTop: '2px' }}>BLAST</span>
            </div>
        </div>
    </>
);

export const HUD: React.FC<HUDProps> = ({ lives, shields, weapon, shards, onPause, showWave = true, wave }) => {
    // Refs for high-frequency updates
    const scoreRef = useRef<HTMLSpanElement>(null);
    const comboValRef = useRef<HTMLSpanElement>(null);
    const comboBarRef = useRef<HTMLDivElement>(null);
    const comboBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let animationFrameId: number;

        const updateHUD = () => {
            if (scoreRef.current) {
                scoreRef.current.innerText = gameEngine.score.toString();
            }
            if (comboValRef.current && comboBoxRef.current && comboBarRef.current) {
                const combo = gameEngine.combo;
                // const comboTimer = gameEngine.comboTimer; // Unused for now
                // Calculate max time based on upgrades (logic duplicated from GameEngine, ideally GameEngine exposes normalized progress)
                // For now, we'll just check if combo > 1

                if (combo > 1) {
                    comboBoxRef.current.style.opacity = '1';
                    comboValRef.current.innerText = combo.toString();

                    // We need maxTime to calculate percentage. 
                    // Let's assume GameEngine exposes a 'comboProgress' or we calculate it here if we know the formula.
                    // To keep it simple and performant, let's add a getter to GameEngine or just use what we have.
                    // GameEngine has 'comboTimer'. Max time varies.
                    // Let's just use a visual approximation or ask GameEngine.
                    // Actually, GameEngine was passing `val` (0-1) to callbacks.
                    // We can read `gameEngine.comboTimer` but we don't know `maxTime` easily without duplicating logic.
                    // Let's add `comboProgress` to GameEngine public state? 
                    // For now, let's just show the number.
                } else {
                    comboBoxRef.current.style.opacity = '0';
                }
            }
            animationFrameId = requestAnimationFrame(updateHUD);
        };

        updateHUD();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div id="ui-layer">
            <div className="hud-top">
                <div className="hud-left">
                    <div className="hud-row">
                        <LivesDisplay lives={lives} shields={shields} />
                        <CurrencyDisplay shards={shards} />
                    </div>

                    {/* Combo Display using Refs */}
                    <div id="combo-box" ref={comboBoxRef} style={{ opacity: 0 }}>
                        <div className="combo-count">x<span id="combo-val" ref={comboValRef}>1</span></div>
                        <div className="combo-label">COMBO</div>
                        <div className="combo-bar-bg">
                            <div id="combo-bar" ref={comboBarRef} className="combo-bar-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="hud-center">
                    {showWave && <div className="hud-stat" style={{ color: '#fff' }}>WAVE <span id="level-val" style={{ color: '#fff' }}>{wave}</span></div>}
                    <div className="hud-stat" style={{ color: '#fff' }}>SCORE <span id="score-val" ref={scoreRef} style={{ color: '#fff' }}>0</span></div>
                </div>

                <div className="hud-right">
                    <div id="desktop-controls">
                        <div id="dash-container">
                            <div style={{ textAlign: 'center', fontSize: '10px', color: '#0ff', fontWeight: 'bold', width: '100%' }}>DASH (SHIFT)</div>
                            <div id="dash-indicator"><div id="dash-fill"></div></div>
                        </div>
                        <button id="pause-btn-hud" className="hud-btn" onClick={onPause}><span></span><span>PAUSE</span><span style={{ fontSize: '10px', opacity: 0.7 }}>(P)</span></button>
                        <WeaponDisplay weapon={weapon} />
                    </div>
                    <button id="mobile-pause-btn" onClick={onPause}>PAUSE</button>
                </div>
            </div>
            <MobileControls />
        </div>
    );
};
