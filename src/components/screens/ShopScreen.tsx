import React, { useState, useEffect } from 'react';
import { persistence } from '../../game/systems/Persistence';
import { audioSystem } from '../../game/systems/AudioSystem';
import { UPGRADE_CONFIG, SKIN_CONFIG } from '../../game/config/ShopConfig';

interface ShopScreenProps {
    onClose: () => void;
}

import { drawIcon, drawShipPreview } from '../../game/utils/IconDrawer';

interface ShopItemIconProps {
    type: string;
    isSkin?: boolean;
    color?: string;
    design?: string;
    isSecret?: boolean;
}

const ShopItemIcon: React.FC<ShopItemIconProps> = ({ type, isSkin, color, design, isSecret }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            if (isSkin) {
                drawShipPreview(canvasRef.current, color!, design!, isSecret);
            } else {
                drawIcon(canvasRef.current, type);
            }
        }
    }, [type, isSkin, color, design, isSecret]);

    return <canvas ref={canvasRef} width={40} height={40} className="shop-item-preview" style={isSkin ? { borderColor: color, boxShadow: `0 0 10px ${color}` } : {}} />;
};

export const ShopScreen: React.FC<ShopScreenProps> = ({ onClose }) => {
    const [tab, setTab] = useState<'OFFENSE' | 'DEFENSE' | 'UTILITY' | 'SKINS'>('OFFENSE');
    const [shards, setShards] = useState(persistence.profile.shards);
    const [upgrades, setUpgrades] = useState({ ...persistence.profile.upgrades });
    const [unlockedSkins, setUnlockedSkins] = useState([...persistence.profile.unlockedSkins]);
    const [equippedSkin, setEquippedSkin] = useState(persistence.profile.equippedSkin);

    useEffect(() => {
        audioSystem.playMusic('shop');
        return () => {
            // Music handling is now done in App.tsx onClose
        };
    }, []);

    const buyUpgrade = (key: string) => {
        const item = UPGRADE_CONFIG[key];
        if (!item) return;
        const current = upgrades[key] || 0;

        if (current >= item.max) return;

        const discountLevel = upgrades.discount || 0;
        const discountMult = 1 - (discountLevel * 0.1);
        const cost = Math.floor((item.costBase * Math.pow(item.costMult, current)) * discountMult);

        if (shards >= cost) {
            const newShards = shards - cost;
            const newLevel = current + 1;

            // Update Persistence
            persistence.profile.shards = newShards;
            persistence.profile.upgrades[key] = newLevel;
            persistence.save();

            // Update Local State
            setShards(newShards);
            setUpgrades(prev => ({ ...prev, [key]: newLevel }));

            audioSystem.playPowerUp();
        } else {
            // audioSystem.playHeavy(); // Assuming playHeavy is error sound
        }
    };

    const buySkin = (key: string) => {
        const item = SKIN_CONFIG[key];

        const applySkin = () => {
            persistence.profile.equippedSkin = key;
            persistence.save();
            setEquippedSkin(key);
            audioSystem.playPowerUp();
        };

        if (item.unlockReq) {
            const reqMet = (item.unlockReq.type === 'score' && persistence.profile.highScore >= item.unlockReq.val) ||
                (item.unlockReq.type === 'wave' && persistence.profile.maxWave >= item.unlockReq.val);

            if (!reqMet && !unlockedSkins.includes(key)) {
                // Locked
                return;
            }

            if (reqMet && !unlockedSkins.includes(key)) {
                // Unlock
                persistence.profile.unlockedSkins.push(key);
                persistence.save();
                setUnlockedSkins(prev => [...prev, key]);
                audioSystem.playPowerUp();
                return;
            }
        }

        if (unlockedSkins.includes(key)) {
            // Equip
            applySkin();
        } else {
            // Buy
            if (shards >= item.cost) {
                const newShards = shards - item.cost;

                persistence.profile.shards = newShards;
                persistence.profile.unlockedSkins.push(key);
                persistence.save();

                setShards(newShards);
                setUnlockedSkins(prev => [...prev, key]);
                applySkin();
            }
        }
    };

    return (
        <div id="shop-screen">
            <div className="shop-container">
                <div className="shop-currency-floater">
                    <svg className="shard-icon" style={{ width: '24px', height: '24px' }}><use xlinkHref="#icon-shard" /></svg>
                    <span>{shards}</span>
                </div>
                <div className="shop-header-container">
                    <h1 className="neon-header" style={{ fontSize: '40px', color: '#b0f', textShadow: '0 0 20px #b0f' }}>BLACK MARKET</h1>
                </div>
                <div className="shop-tabs" role="tablist">
                    {['OFFENSE', 'DEFENSE', 'UTILITY', 'SKINS'].map(t => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={tab === t}
                            className={`shop-tab ${tab === t ? 'active' : ''}`}
                            onClick={() => setTab(t as any)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="shop-grid">
                    {tab === 'SKINS' ? (
                        Object.entries(SKIN_CONFIG).map(([key, item]) => {
                            const owned = unlockedSkins.includes(key);
                            const equipped = equippedSkin === key;

                            let isSecretLocked = false;
                            if (item.unlockReq && !owned) {
                                const reqMet = (item.unlockReq.type === 'score' && persistence.profile.highScore >= item.unlockReq.val) ||
                                    (item.unlockReq.type === 'wave' && persistence.profile.maxWave >= item.unlockReq.val);
                                if (!reqMet) isSecretLocked = true;
                            }

                            const affordable = shards >= item.cost;
                            const displayName = (isSecretLocked && item.name === '???') ? '???' : (item.realName || item.name);

                            return (
                                <div key={key} className="shop-item">
                                    <div className="shop-item-title">{displayName}</div>
                                    <ShopItemIcon type={key} isSkin={true} color={item.colors.main} design={item.design} isSecret={isSecretLocked} />
                                    <button
                                        className={`buy-btn ${equipped ? 'equipped' : (owned ? 'equip' : (affordable && !isSecretLocked ? 'affordable' : 'locked'))}`}
                                        onClick={() => buySkin(key)}
                                    >
                                        {equipped ? 'EQUIPPED' : (owned ? 'EQUIP' : (isSecretLocked ? item.unlockReq?.hint : (
                                            <>
                                                BUY {item.cost} <svg className="shard-icon" style={{ width: '12px', height: '12px', fill: 'currentColor', display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}><use xlinkHref="#icon-shard" /></svg>
                                            </>
                                        )))}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        Object.entries(UPGRADE_CONFIG).filter(([_, item]) => item.cat === tab).map(([key, item]) => {
                            const level = upgrades[key] || 0;
                            const maxed = level >= item.max;

                            const discountLevel = upgrades.discount || 0;
                            const discountMult = 1 - (discountLevel * 0.1);
                            const cost = Math.floor((item.costBase * Math.pow(item.costMult, level)) * discountMult);

                            const affordable = !maxed && shards >= cost;

                            return (
                                <div key={key} className="shop-item">
                                    <div className="shop-item-title">{item.name}</div>
                                    <ShopItemIcon type={key} />
                                    <div className="progress-bar" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={item.max}>
                                        {Array.from({ length: item.max }).map((_, i) => (
                                            <div key={i} className={`progress-pip ${i < level ? (maxed ? 'maxed' : 'filled') : ''}`}></div>
                                        ))}
                                    </div>
                                    <div className="shop-item-desc">{item.desc}</div>
                                    <button
                                        className={`buy-btn ${maxed ? 'owned' : (affordable ? 'affordable' : 'locked')}`}
                                        onClick={() => buyUpgrade(key)}
                                        disabled={maxed || (!affordable)}
                                    >
                                        {maxed ? 'MAXED' : (
                                            <>
                                                <svg className="shard-icon" style={{ width: '12px', height: '12px', fill: 'currentColor' }}><use xlinkHref="#icon-shard" /></svg>
                                                {cost}
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button className="main-btn" style={{ fontSize: '16px', padding: '10px 30px', border: '2px solid #0ff', color: '#0ff', background: 'transparent', textShadow: '0 0 10px #0ff' }} onClick={onClose}>ALL SET!</button>
                </div>
            </div>
        </div>
    );
};
