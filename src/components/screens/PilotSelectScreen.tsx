import { useState } from 'react';
import { PILOT_CLASSES, getAllPilotClasses } from '../../game/config/PilotConfig';
import type { SkillNode } from '../../game/config/PilotConfig';
import { persistence } from '../../game/systems/Persistence';
import { CURRENCY } from '../../game/config/CurrencyConfig';

interface PilotSelectScreenProps {
    onClose: () => void;
    onSelect: (pilotId: string) => void;
}

export const PilotSelectScreen: React.FC<PilotSelectScreenProps> = ({ onClose, onSelect }) => {
    const [selectedPilot, setSelectedPilot] = useState<string>(persistence.profile.selectedPilot);
    const [viewingSkills, setViewingSkills] = useState(false);

    const pilots = getAllPilotClasses();
    const currentPilot = PILOT_CLASSES[selectedPilot];

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
        <div className="pilot-screen">
            <div className="pilot-container">
                <button className="close-btn" onClick={onClose}>✕</button>

                <h1>SELECT YOUR PILOT</h1>

                <div className="shards-display">
                    {CURRENCY.symbol} {persistence.profile.shards}
                </div>

                {!viewingSkills ? (
                    <>
                        <div className="pilots-grid">
                            {pilots.map(pilot => (
                                <div
                                    key={pilot.id}
                                    className={`pilot-card ${selectedPilot === pilot.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPilot(pilot.id)}
                                    style={{ borderColor: pilot.color }}
                                >
                                    <div className="pilot-icon">{pilot.icon}</div>
                                    <div className="pilot-name">{pilot.name}</div>
                                    <div className="pilot-title" style={{ color: pilot.color }}>{pilot.title}</div>
                                </div>
                            ))}
                        </div>

                        {currentPilot && (
                            <div className="pilot-details" style={{ borderColor: currentPilot.color }}>
                                <div className="pilot-desc">{currentPilot.description}</div>

                                <div className="pilot-stats">
                                    <div className="stat">
                                        <span className="stat-label">DMG</span>
                                        <div className="stat-bar">
                                            <div className="stat-fill" style={{
                                                width: `${currentPilot.baseStats.damage * 50}%`,
                                                background: currentPilot.baseStats.damage >= 1.2 ? '#f00' : '#0ff'
                                            }} />
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">SPD</span>
                                        <div className="stat-bar">
                                            <div className="stat-fill" style={{
                                                width: `${currentPilot.baseStats.speed * 50}%`,
                                                background: currentPilot.baseStats.speed >= 1.2 ? '#f00' : '#0ff'
                                            }} />
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">RATE</span>
                                        <div className="stat-bar">
                                            <div className="stat-fill" style={{
                                                width: `${currentPilot.baseStats.fireRate * 50}%`,
                                                background: currentPilot.baseStats.fireRate >= 1.2 ? '#f00' : '#0ff'
                                            }} />
                                        </div>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">DEF</span>
                                        <div className="stat-bar">
                                            <div className="stat-fill" style={{
                                                width: `${currentPilot.baseStats.shields * 40}%`,
                                                background: currentPilot.baseStats.shields >= 1.2 ? '#f00' : '#0ff'
                                            }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pilot-passive">
                                    <span className="passive-label">PASSIVE: </span>
                                    <span className="passive-name">{currentPilot.passive.name}</span>
                                    <p className="passive-desc">{currentPilot.passive.description}</p>
                                </div>

                                <div className="button-row">
                                    <button className="skill-btn" onClick={() => setViewingSkills(true)}>
                                        🔧 SKILL TREE
                                    </button>
                                    <button
                                        className="select-btn"
                                        style={{ background: currentPilot.color }}
                                        onClick={handleConfirm}
                                    >
                                        SELECT PILOT
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="skill-tree-view">
                        <button className="back-btn" onClick={() => setViewingSkills(false)}>
                            ← BACK TO PILOTS
                        </button>

                        <h2 style={{ color: currentPilot.color }}>
                            {currentPilot.icon} {currentPilot.name}'s SKILL TREE
                        </h2>

                        <div className="skill-tree">
                            {currentPilot.skills.map((skill, i) => {
                                const level = getSkillLevel(skill.id);
                                const canUnlock = canUnlockSkill(skill);
                                const isMaxed = level >= skill.maxLevel;

                                return (
                                    <div key={skill.id} className="skill-row">
                                        {i > 0 && <div className="skill-connector" />}
                                        <div
                                            className={`skill-node ${isMaxed ? 'maxed' : ''} ${canUnlock ? 'available' : ''}`}
                                            style={{ borderColor: currentPilot.color }}
                                        >
                                            <div className="skill-name">{skill.name}</div>
                                            <div className="skill-desc">{skill.description}</div>
                                            <div className="skill-level">
                                                Level: {level} / {skill.maxLevel}
                                            </div>
                                            {!isMaxed && (
                                                <button
                                                    className="unlock-btn"
                                                    disabled={!canUnlock}
                                                    onClick={() => unlockSkill(skill)}
                                                >
                                                    {canUnlock ? `UPGRADE (${skill.cost[level]} ${CURRENCY.symbol})` :
                                                        skill.requires && getSkillLevel(skill.requires) === 0 ? 'LOCKED' :
                                                            `NEED ${skill.cost[level]} ${CURRENCY.symbol}`}
                                                </button>
                                            )}
                                            {isMaxed && <div className="maxed-label">MAXED!</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .pilot-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 500;
                    overflow-y: auto;
                }
                .pilot-container {
                    width: 95%;
                    max-width: 800px;
                    max-height: 90vh;
                    background: linear-gradient(135deg, #0a0a15 0%, #151525 100%);
                    border: 2px solid #444;
                    border-radius: 15px;
                    padding: 25px;
                    position: relative;
                    overflow-y: auto;
                }
                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: 1px solid #666;
                    color: #666;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 18px;
                }
                .close-btn:hover { border-color: #f00; color: #f00; }
                
                h1 {
                    text-align: center;
                    color: #fff;
                    font-size: 28px;
                    margin: 0 0 10px 0;
                    letter-spacing: 3px;
                }
                .shards-display {
                    text-align: center;
                    font-size: 20px;
                    color: #0ff;
                    margin-bottom: 20px;
                }
                .pilots-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }
                @media (max-width: 600px) {
                    .pilots-grid { grid-template-columns: repeat(3, 1fr); }
                }
                .pilot-card {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid #333;
                    border-radius: 12px;
                    padding: 15px 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .pilot-card:hover {
                    transform: translateY(-3px);
                    background: rgba(255,255,255,0.1);
                }
                .pilot-card.selected {
                    background: rgba(255,255,255,0.15);
                    transform: scale(1.05);
                    box-shadow: 0 0 25px rgba(255,255,255,0.2);
                }
                .pilot-icon { font-size: 36px; margin-bottom: 8px; }
                .pilot-name { font-size: 11px; color: #fff; font-weight: bold; }
                .pilot-title { font-size: 9px; letter-spacing: 1px; margin-top: 4px; }
                
                .pilot-details {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid #444;
                    border-radius: 12px;
                    padding: 20px;
                }
                .pilot-desc {
                    color: #aaa;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 14px;
                }
                .pilot-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .stat { text-align: center; }
                .stat-label { display: block; font-size: 10px; color: #666; margin-bottom: 5px; }
                .stat-bar { height: 8px; background: #222; border-radius: 4px; overflow: hidden; }
                .stat-fill { height: 100%; transition: width 0.3s; }
                
                .pilot-passive {
                    background: rgba(255,215,0,0.1);
                    border: 1px solid rgba(255,215,0,0.3);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 20px;
                }
                .passive-label { color: #888; font-size: 11px; }
                .passive-name { color: #ffd700; font-weight: bold; }
                .passive-desc { color: #aaa; font-size: 13px; margin: 5px 0 0 0; }
                
                .button-row {
                    display: flex;
                    gap: 15px;
                }
                .skill-btn, .select-btn {
                    flex: 1;
                    padding: 15px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .skill-btn {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    border: 1px solid #444;
                }
                .skill-btn:hover { background: rgba(255,255,255,0.2); }
                .select-btn { color: #000; }
                .select-btn:hover { filter: brightness(1.2); }
                
                /* Skill Tree View */
                .skill-tree-view { padding: 10px 0; }
                .back-btn {
                    background: none;
                    border: 1px solid #666;
                    color: #888;
                    padding: 8px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-bottom: 20px;
                }
                .back-btn:hover { border-color: #0ff; color: #0ff; }
                
                h2 {
                    text-align: center;
                    margin-bottom: 25px;
                    font-size: 20px;
                }
                .skill-tree {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .skill-row {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .skill-connector {
                    width: 3px;
                    height: 20px;
                    background: linear-gradient(to bottom, #333, #555);
                    margin-bottom: 10px;
                }
                .skill-node {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid #444;
                    border-radius: 12px;
                    padding: 20px;
                    width: 100%;
                    max-width: 350px;
                    text-align: center;
                    transition: all 0.3s;
                }
                .skill-node.available {
                    border-color: #0ff;
                    box-shadow: 0 0 15px rgba(0,255,255,0.2);
                }
                .skill-node.maxed {
                    border-color: #ffd700;
                    background: rgba(255,215,0,0.1);
                }
                .skill-name {
                    font-size: 16px;
                    color: #fff;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .skill-desc {
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 10px;
                }
                .skill-level {
                    font-size: 14px;
                    color: #0ff;
                    margin-bottom: 12px;
                }
                .unlock-btn {
                    padding: 10px 25px;
                    background: linear-gradient(90deg, #0ff, #0a0);
                    border: none;
                    border-radius: 6px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .unlock-btn:disabled {
                    background: #333;
                    color: #666;
                    cursor: not-allowed;
                }
                .unlock-btn:not(:disabled):hover {
                    filter: brightness(1.2);
                    transform: scale(1.05);
                }
                .maxed-label {
                    color: #ffd700;
                    font-weight: bold;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};
