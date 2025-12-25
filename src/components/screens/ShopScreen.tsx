/* eslint-disable react-refresh/only-export-components, react-hooks/purity */
import React, { useState, useEffect } from 'react';
import { persistence } from '../../game/systems/Persistence';
import { audioSystem } from '../../game/systems/AudioSystem';
import { UPGRADE_CONFIG, SKIN_CONFIG, type UpgradeItem, type SkinItem } from '../../game/config/ShopConfig';
import { ICONS } from '../../game/config/Icons';
import { drawIcon, drawShipPreview } from '../../game/utils/IconDrawer';
import { BackButton } from '../ui/BackButton';
import { Icon } from '../ui/Icon';

interface ShopScreenProps {
    onClose: () => void;
}

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

    return <canvas ref={canvasRef} width={40} height={40} />;
};

// Local Icon removed

type ShopCategory = 'OFFENSE' | 'DEFENSE' | 'UTILITY' | 'SKINS';

const ITEMS_BY_CAT: Record<string, Record<string, UpgradeItem | SkinItem>> = {
    OFFENSE: {},
    DEFENSE: {},
    UTILITY: {},
    SKINS: {}
};

// Populate categories
Object.entries(UPGRADE_CONFIG).forEach(([key, item]) => {
    if (ITEMS_BY_CAT[item.cat]) {
        ITEMS_BY_CAT[item.cat][key] = item;
    }
});

// Populate skins
Object.entries(SKIN_CONFIG).forEach(([key, item]) => {
    ITEMS_BY_CAT['SKINS'][key] = item;
});

export const ShopScreen: React.FC<ShopScreenProps> = ({ onClose }) => {
    const [tab, setTab] = useState<ShopCategory>('OFFENSE');
    // Force update triggers
    const [, forceUpdate] = useState(0);
    const update = () => forceUpdate(n => n + 1);

    const shards = persistence.profile.shards;
    const gems = persistence.profile.gems;

    const buyItem = (key: string, cost: number) => {
        if (persistence.purchaseUpgrade(key, cost)) {
            // Audio handled by persistence? No, usually UI.
            audioSystem.playShard();
            update();
        }
    };

    const unlockSkin = (key: string, cost: number) => {
        if (persistence.profile.shards >= cost) {
            persistence.profile.shards -= cost;
            persistence.profile.unlockedSkins.push(key);
            persistence.save();
            audioSystem.playShard();
            update();
        }
    };

    const equipSkin = (skinId: string) => {
        persistence.equipSkin(skinId);
        update();
    };

    return (
        <div className="screen-container screen-enter">
            <div className="screen-header-row">
                <BackButton onClick={onClose} />
                <div className="screen-title-group">
                    <h1 className="screen-title">SHOP</h1>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '20px', fontWeight: 'bold', alignItems: 'center' }}>
                    <span style={{ color: '#b0f', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon name={ICONS.Currency.Shard} style={{ fill: '#b0f' }} /> {shards}
                    </span>
                    <span style={{ color: '#0ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon name={ICONS.Currency.Gem} /> {gems}
                    </span>
                </div>
            </div>

            <div className="screen-content">
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {(['OFFENSE', 'DEFENSE', 'UTILITY', 'SKINS'] as ShopCategory[]).map(t => (
                        <button
                            key={t}
                            className={`menu-btn ${tab === t ? 'active' : ''}`}
                            style={{
                                width: '150px',
                                justifyContent: 'center',
                                borderColor: tab === t ? '#0ff' : '#444',
                                color: tab === t ? '#0ff' : '#888',
                                backgroundColor: tab === t ? 'rgba(0,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="feature-grid">
                    {Object.entries(ITEMS_BY_CAT[tab]).map(([key, item]) => {
                        if (tab === 'SKINS') {
                            // Render Skin Item
                            const isOwned = persistence.profile.unlockedSkins.includes(key);
                            const isEquipped = persistence.profile.equippedSkin === key;
                            const skinItem = item as SkinItem;
                            // Check unlock req
                            const isLocked = skinItem.unlockReq && skinItem.cost === 0 && !isOwned;

                            return (
                                <div
                                    key={key}
                                    className={`feature-card ${isEquipped ? 'selected' : ''}`}
                                    style={{ borderColor: isEquipped ? '#0f0' : (isOwned ? '#444' : '#b0f') }}
                                    onClick={() => isOwned ? equipSkin(key) : null}
                                >
                                    <div className="feature-icon">
                                        <ShopItemIcon type={key} isSkin={true} color={skinItem.colors.main} design={skinItem.design} isSecret={skinItem.name === '???'} />
                                    </div>
                                    <div className="feature-title">{skinItem.name}</div>
                                    <div className="feature-desc">
                                        {isLocked ? `Unlock: ${skinItem.unlockReq!.hint}` : (skinItem.realName || skinItem.design)}
                                    </div>

                                    {!isOwned && !isLocked && (
                                        <button
                                            className="main-btn"
                                            onClick={(e) => { e.stopPropagation(); unlockSkin(key, skinItem.cost); }}
                                            disabled={shards < skinItem.cost}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Icon name={ICONS.Currency.Shard} style={{ fill: 'currentColor' }} /> {skinItem.cost}
                                            </span>
                                        </button>
                                    )}
                                    {isOwned && (
                                        <div style={{ color: isEquipped ? '#0f0' : '#888', fontWeight: 'bold' }}>
                                            {isEquipped ? 'EQUIPPED' : 'OWNED'}
                                        </div>
                                    )}
                                    {isLocked && <div style={{ color: '#f00' }}>LOCKED</div>}
                                </div>
                            );
                        } else {
                            // Render Upgrade Item
                            const upgradeItem = item as UpgradeItem;
                            const currentLevel = persistence.profile.upgrades[key] || 0;
                            const maxed = currentLevel >= upgradeItem.max;
                            const discountLevel = persistence.profile.upgrades.discount || 0;
                            const discountMult = 1 - (discountLevel * 0.1);
                            const cost = Math.floor((upgradeItem.costBase * Math.pow(upgradeItem.costMult, currentLevel)) * discountMult);
                            const affordable = !maxed && shards >= cost;

                            return (
                                <div
                                    key={key}
                                    className={`feature-card ${maxed ? 'maxed' : ''}`}
                                    style={{ borderColor: maxed ? '#0f0' : (affordable ? '#0ff' : '#444') }}
                                >
                                    <div className="feature-icon">
                                        <ShopItemIcon type={key} />
                                    </div>
                                    <div className="feature-title">{upgradeItem.name}</div>

                                    {/* Progress Bar */}
                                    <div className="progress-bar" style={{ margin: '10px 0', background: '#222' }}>
                                        {Array.from({ length: upgradeItem.max }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`progress-pip ${i < currentLevel ? (maxed ? 'maxed' : 'filled') : ''}`}
                                                style={{
                                                    background: i < currentLevel ? (maxed ? '#0f0' : '#0ff') : '#444',
                                                    flex: 1,
                                                    margin: '0 1px',
                                                    height: '4px'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="feature-desc" style={{ marginBottom: '15px' }}>
                                        {upgradeItem.desc}
                                    </div>

                                    <button
                                        className={`main-btn ${maxed ? 'success' : (affordable ? 'primary' : 'disabled')}`}
                                        style={{ width: '100%', padding: '8px' }}
                                        onClick={() => buyItem(key, cost)}
                                        disabled={maxed || !affordable}
                                    >
                                        {maxed ? 'MAXED' : (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                <Icon name={ICONS.Currency.Shard} style={{ fill: 'currentColor' }} /> {cost}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            );
                        }
                    })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button className="main-btn" style={{ fontSize: '16px', padding: '10px 30px', border: '2px solid #0ff', color: '#0ff', background: 'transparent', textShadow: '0 0 10px #0ff' }} onClick={onClose}>ALL SET!</button>
                </div>
            </div>
        </div>
    );
};
