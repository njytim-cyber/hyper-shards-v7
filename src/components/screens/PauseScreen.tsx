import React, { useEffect } from 'react';
import { spriteCache } from '../../game/systems/SpriteCache';

interface PauseScreenProps {
    onResume: () => void;
    onOpenShop: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onOpenShop }) => {
    useEffect(() => {
        const draw = (id: string, img: HTMLCanvasElement) => {
            const cvs = document.getElementById(id) as HTMLCanvasElement;
            if (cvs) {
                const ctx = cvs.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    const scale = Math.min(cvs.width / img.width, cvs.height / img.height) * 0.8;
                    const x = (cvs.width - img.width * scale) / 2;
                    const y = (cvs.height - img.height * scale) / 2;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                }
            }
        };

        draw('p-blaster', spriteCache.getBullet('BLASTER'));
        draw('p-spread', spriteCache.getBullet('SPREAD'));
        draw('p-rapid', spriteCache.getBullet('RAPID'));
        draw('p-heavy', spriteCache.getBullet('HEAVY'));

        draw('p-shield', spriteCache.getPowerUp('SHIELD'));
        draw('p-nuke', spriteCache.getPowerUp('NUKE'));
        draw('p-speed', spriteCache.getPowerUp('SPEED'));

        draw('p-asteroid', spriteCache.getAsteroid('medium', '#f0f'));
        draw('p-ufo', spriteCache.getUFO());
        draw('p-boss', spriteCache.getBoss());
        draw('p-dreadnought', spriteCache.getDreadnought());

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyS') {
                onOpenShop();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onOpenShop]);

    return (
        <div id="pause-screen">
            <h1 className="neon-header cyan-glow">PAUSED</h1>
            <div className="pause-features-box">
                <div style={{ color: '#0ff', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', fontSize: '14px' }}>v7.0</div>
                <div style={{ fontSize: '13px', color: '#ddd', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}><span>★ Tutorial</span> <span>★ Combo Multipliers</span> <span>★ Bosses</span></div>
            </div>
            <div className="pause-grid">
                <div className="pause-col">
                    <div className="pause-header">Arsenal</div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-blaster" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#ff0' }}>BLASTER</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-spread" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#0f0' }}>SPREAD</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-rapid" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f0f' }}>RAPID</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-heavy" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f00' }}>HEAVY</div></div></div>
                </div>
                <div className="pause-col">
                    <div className="pause-header">Power-Ups</div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-shield" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#0ff' }}>SHIELD</div><div className="pause-desc">Armor +1</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-nuke" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f00' }}>NUKE</div><div className="pause-desc">Clear Screen</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-speed" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#ff0' }}>SPEED</div><div className="pause-desc">Boost Engines</div></div></div>
                </div>
                <div className="pause-col">
                    <div className="pause-header">Threats</div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-asteroid" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f0f' }}>ASTEROID</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-ufo" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f60' }}>UFO</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-boss" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f05' }}>BOSS</div></div></div>
                    <div className="pause-item"><canvas className="pause-icon-canvas" id="p-dreadnought" width="30" height="30"></canvas><div><div className="pause-label" style={{ color: '#f30' }}>DREADNOUGHT</div><div className="pause-desc">Level 10 Boss</div></div></div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px', gap: '15px' }}>
                <div className="tap-text blink" style={{ color: '#0ff', fontSize: '20px', cursor: 'pointer' }} onClick={onResume}>PRESS P TO RESUME</div>
                <div id="pause-shop-btn" className="spend-btn" onClick={onOpenShop}>PRESS S TO SPEND SHARDS</div>
            </div>
        </div>
    );
};
