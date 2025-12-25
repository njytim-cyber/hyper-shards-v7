import React, { useEffect } from 'react';
import { spriteCache } from '../../game/systems/SpriteCache';
import { ICONS } from '../../game/config/Icons';
import { Icon } from '../ui/Icon';

interface PauseScreenProps {
    onResume: () => void;
    onOpenShop: () => void;
    onQuitToMenu?: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onOpenShop, onQuitToMenu }) => {
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
            } else if (e.code === 'KeyQ' && onQuitToMenu) {
                onQuitToMenu();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onOpenShop, onQuitToMenu]);

    return (
        <div id="pause-screen" className="screen-enter" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)', // Modern glass blur
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <h1 className="screen-title" style={{ fontSize: '48px', marginBottom: '10px' }}>PAUSED</h1>

            <div className="pause-features-box" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ color: '#0ff', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', fontSize: '14px' }}>v7.0</div>
                <div style={{ fontSize: '13px', color: '#888', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <span>★ Tutorial</span> <span>★ Combo Multipliers</span> <span>★ Bosses</span>
                </div>
            </div>

            <div className="feature-grid" style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                maxWidth: '800px',
                width: '100%',
                marginBottom: '30px'
            }}>
                {/* Column 1: Arsenal */}
                <div className="feature-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                    <div className="feature-title" style={{ width: '100%', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>ARSENAL</div>
                    {[
                        { icon: 'blaster', color: '#ff0', label: 'BLASTER' },
                        { icon: 'spread', color: '#0f0', label: 'SPREAD' },
                        { icon: 'rapid', color: '#f0f', label: 'RAPID' },
                        { icon: 'heavy', color: '#f00', label: 'HEAVY' }
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '14px' }}>
                            <Icon name={item.icon} style={{ width: '20px', height: '20px', color: item.color }} />
                            <span style={{ color: item.color, fontWeight: 'bold' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Column 2: Power-Ups */}
                <div className="feature-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                    <div className="feature-title" style={{ width: '100%', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>POWER-UPS</div>
                    {[
                        { id: 'p-shield', label: 'SHIELD', desc: 'Armor +1', color: '#0ff' },
                        { id: 'p-nuke', label: 'NUKE', desc: 'Clear Screen', color: '#f00' },
                        { id: 'p-speed', label: 'SPEED', desc: 'Boost Engines', color: '#ff0' }
                    ].map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <canvas id={item.id} width="30" height="30" style={{ flexShrink: 0 }}></canvas>
                            <div>
                                <div style={{ color: item.color, fontWeight: 'bold', fontSize: '14px' }}>{item.label}</div>
                                <div style={{ fontSize: '11px', color: '#888' }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Column 3: Threats */}
                <div className="feature-card" style={{ height: 'auto', alignItems: 'flex-start' }}>
                    <div className="feature-title" style={{ width: '100%', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>THREATS</div>
                    {[
                        { id: 'p-asteroid', label: 'ASTEROID', color: '#f0f' },
                        { id: 'p-ufo', label: 'UFO', color: '#f60' },
                        { id: 'p-boss', label: 'BOSS', color: '#f05' },
                        { id: 'p-dreadnought', label: 'DREADNOUGHT', color: '#f30', desc: 'Level 10 Boss' }
                    ].map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <canvas id={item.id} width="30" height="30" style={{ flexShrink: 0 }}></canvas>
                            <div>
                                <div style={{ color: item.color, fontWeight: 'bold', fontSize: '14px' }}>{item.label}</div>
                                {item.desc && <div style={{ fontSize: '11px', color: '#888' }}>{item.desc}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <button id="resume-btn" className="main-btn" onClick={onResume} style={{ width: '220px', padding: '15px 30px', fontSize: '18px' }}>
                    <Icon name={ICONS.Menu.Play} style={{ marginRight: '10px' }} /> RESUME
                </button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button id="pause-shop-btn" className="menu-btn" onClick={onOpenShop} style={{ color: '#b0f', borderColor: '#b0f', minWidth: '140px' }}>
                        <Icon name={ICONS.Menu.Shop} style={{ marginRight: '6px' }} /> SHOP [S]
                    </button>
                    {onQuitToMenu && (
                        <button className="menu-btn" onClick={onQuitToMenu} style={{ color: '#f66', borderColor: '#f66', minWidth: '140px' }}>
                            <Icon name={ICONS.Menu.Quit} style={{ marginRight: '6px' }} /> QUIT [Q]
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

