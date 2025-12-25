import { useState } from 'react';
import { PILOT_CLASSES, getAllPilotClasses } from '../../game/config/PilotConfig';
import type { SkillNode, PilotId } from '../../game/config/PilotConfig';
import { persistence } from '../../game/systems/Persistence';
import { CURRENCY } from '../../game/config/CurrencyConfig';
import { BackButton } from '../ui/BackButton';
import { Icon } from '../ui/Icon';

interface PilotSelectScreenProps {
    onClose: () => void;
    onSelect: (pilotId: string) => void;
}

export const PilotSelectScreen: React.FC<PilotSelectScreenProps> = ({ onClose, onSelect }) => {
    const [selectedPilot, setSelectedPilot] = useState<string>(persistence.profile.selectedPilot);
    const [viewingSkills, setViewingSkills] = useState(false);

    const pilots = getAllPilotClasses();
    const currentPilot = PILOT_CLASSES[selectedPilot as PilotId];

    const handleConfirm = () => {
        persistence.profile.selectedPilot = selectedPilot;
        persistence.save();
        onSelect(selectedPilot);
    };

    const getSkillLevel = (skillId: string): number => {
        return persistence.getSkillLevel(selectedPilot, skillId);
    };

    const canUnlockSkill = (skill: SkillNode): boolean => {
        const currentLevel = getSkillLevel(skill.id);
        if (currentLevel >= skill.maxLevel) return false;

        const cost = skill.cost[currentLevel];
        if (persistence.profile.shards < cost) return false;

        if (skill.requires) {
            const reqLevel = getSkillLevel(skill.requires);
            if (reqLevel === 0) return false;
        }

        return true;
    };

    const unlockSkill = (skill: SkillNode) => {
        const currentLevel = getSkillLevel(skill.id);
        const cost = skill.cost[currentLevel];

        if (persistence.spendSkillPoint(selectedPilot, skill.id, cost)) {
            // Force re-render
            setSelectedPilot(selectedPilot);
        }
    };



    return (
        <div className="screen-container screen-enter" style={{ paddingTop: '5vh' }}>
            <div className="screen-header-row" style={{ maxWidth: '1000px', width: '100%', marginBottom: '20px' }}>
                <div style={{ width: '100px' }}>
                    <BackButton onClick={onClose} label="BACK" />
                </div>
                <div className="screen-title-group">
                    <h1 className="screen-title">SELECT YOUR PILOT</h1>
                    <span className="screen-subtitle">CHOOSE YOUR SHIP CLASS</span>
                </div>
                <div style={{ fontSize: '20px', color: '#0ff', fontWeight: 'bold' }}>
                    {CURRENCY.symbol} {persistence.profile.shards}
                </div>
            </div>

            <div className="screen-content">
                {!viewingSkills ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 400px',
                        gap: '20px',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}>
                        {/* Left: Pilot List */}
                        <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
                            <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                {pilots.map(pilot => (
                                    <div
                                        key={pilot.id}
                                        className={`feature-card ${selectedPilot === pilot.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedPilot(pilot.id)}
                                        style={selectedPilot === pilot.id ? { borderColor: pilot.color } : {}}
                                    >
                                        <div className="feature-icon" style={{ fontSize: '32px', marginBottom: '10px', color: pilot.color }}>
                                            <Icon name={pilot.icon} />
                                        </div>
                                        <div className="feature-title">{pilot.name}</div>
                                        <div className="feature-desc" style={{ color: pilot.color }}>{pilot.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Details Panel */}
                        {currentPilot && (
                            <div className="detail-panel">
                                <div className="detail-header">
                                    <h2 style={{ color: currentPilot.color, margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Icon name={currentPilot.icon} style={{ fontSize: '30px' }} />
                                        {currentPilot.name}
                                    </h2>
                                    <div className="pill primary" style={{ borderColor: currentPilot.color, color: currentPilot.color, marginTop: '10px', display: 'inline-block' }}>
                                        {currentPilot.title}
                                    </div>
                                </div>
                                <div className="feature-desc" style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                                    {currentPilot.description}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'DMG', val: currentPilot.baseStats.damage },
                                        { label: 'SPD', val: currentPilot.baseStats.speed },
                                        { label: 'RATE', val: currentPilot.baseStats.fireRate },
                                        { label: 'DEF', val: currentPilot.baseStats.shields }
                                    ].map(stat => (
                                        <div key={stat.label}>
                                            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{stat.label}</div>
                                            <div style={{ height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${stat.val * 35}%`, // Scaling for visual representations
                                                    height: '100%',
                                                    background: stat.val >= 1.2 ? `linear-gradient(90deg, ${currentPilot.color}, #fff)` : currentPilot.color,
                                                    boxShadow: `0 0 5px ${currentPilot.color}`,
                                                    transition: 'width 0.3s'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="feature-card" style={{ marginBottom: '20px', padding: '15px' }}>
                                    <div style={{ color: '#888', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Signature Passive</div>
                                    <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '16px' }}>{currentPilot.passive.name}</div>
                                    <div style={{ color: '#ccc', fontSize: '13px', marginTop: '5px' }}>{currentPilot.passive.description}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <button className="menu-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewingSkills(true)}>
                                        🔧 SKILL TREE
                                    </button>
                                    <button
                                        className="main-btn"
                                        style={{ flex: 1, fontSize: '16px', padding: '10px', background: currentPilot.color, color: '#000', border: 'none', marginTop: 0 }}
                                        onClick={handleConfirm}
                                    >
                                        SELECT PILOT
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #333' }}>
                            <h2 style={{ color: currentPilot.color, fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Icon name={currentPilot.icon} /> {currentPilot.name} SKILL TREE
                            </h2>
                            <button className="back-btn" onClick={() => setViewingSkills(false)}>
                                ← BACK TO PILOTS
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
                                {currentPilot.skills.map((skill: SkillNode, i: number) => {
                                    const level = getSkillLevel(skill.id);
                                    const canUnlock = canUnlockSkill(skill);
                                    const isMaxed = level >= skill.maxLevel;

                                    return (
                                        <div key={skill.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                            {i > 0 && (
                                                <div style={{ width: '2px', height: '30px', background: 'linear-gradient(to bottom, #333, #555)', marginBottom: '0' }} />
                                            )}
                                            <div
                                                className={`feature-card ${isMaxed ? 'selected' : ''}`}
                                                style={{
                                                    width: '100%',
                                                    borderColor: isMaxed ? '#ffd700' : (canUnlock ? '#0ff' : '#444'),
                                                    cursor: 'default',
                                                    marginTop: i === 0 ? '0' : '0',
                                                    position: 'relative',
                                                    zIndex: 1,
                                                    backgroundColor: '#111'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div>
                                                        <div className="feature-title" style={{ fontSize: '18px', color: isMaxed ? '#ffd700' : '#fff' }}>{skill.name}</div>
                                                        <div className="feature-desc" style={{ fontSize: '13px' }}>{skill.description}</div>
                                                    </div>
                                                    <div style={{ color: isMaxed ? '#ffd700' : '#0ff', fontSize: '14px', fontWeight: 'bold' }}>
                                                        {level} / {skill.maxLevel}
                                                    </div>
                                                </div>

                                                {!isMaxed ? (
                                                    <button
                                                        className="menu-btn"
                                                        disabled={!canUnlock}
                                                        onClick={() => unlockSkill(skill)}
                                                        style={{
                                                            width: '100%',
                                                            justifyContent: 'center',
                                                            borderColor: canUnlock ? '#0ff' : '#444',
                                                            color: canUnlock ? '#0ff' : '#666',
                                                            marginTop: '10px',
                                                            background: canUnlock ? 'rgba(0,255,255,0.05)' : 'transparent'
                                                        }}
                                                    >
                                                        {canUnlock ? `UPGRADE (${skill.cost[level]} ${CURRENCY.symbol})` :
                                                            skill.requires && getSkillLevel(skill.requires) === 0 ? 'LOCKED (Requires Previous Skill)' :
                                                                `NEED ${skill.cost[level]} ${CURRENCY.symbol}`}
                                                    </button>
                                                ) : (
                                                    <div style={{ color: '#ffd700', fontWeight: 'bold', marginTop: '10px', textAlign: 'center', padding: '10px', background: 'rgba(255,215,0,0.1)', borderRadius: '4px' }}>
                                                        ★ SKILL MAXED ★
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
