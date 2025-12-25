import React, { useState } from 'react';
import { gameEngine, type AIDifficulty } from '../../game/core/GameEngine';
import { BackButton } from '../ui/BackButton';
import { ICONS } from '../../game/config/Icons';
import { Icon } from '../ui/Icon';

interface MatchmakingScreenProps {
    onClose: () => void;
    onStartGame: () => void;
}

type ScreenMode = 'COOP' | 'VERSUS' | 'VS_PC';

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ onClose, onStartGame }) => {
    const [roomId, setRoomId] = useState('');
    const [mode, setMode] = useState<ScreenMode>('VS_PC');
    const [difficulty, setDifficulty] = useState<AIDifficulty>('NORMAL');
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED'>('IDLE');

    const joinRoom = async (id: string) => {
        setStatus('CONNECTING');
        try {
            const playerId = 'player_' + Math.random().toString(36).substring(2, 5);
            gameEngine.gameMode = mode === 'VS_PC' ? 'VS_PC' : mode;
            await gameEngine.multiplayerBridge.joinRoom(id, playerId);
            setStatus('CONNECTED');
            setTimeout(() => {
                onStartGame();
            }, 500);
        } catch (e) {
            console.error(e);
            setStatus('IDLE');
        }
    };

    const handleJoinRoom = async () => {
        if (!roomId) return;
        await joinRoom(roomId);
    };

    const handleStartVsPC = () => {
        gameEngine.startVsPC(difficulty);
        onStartGame();
    };

    const ModeCard = ({
        modeType,
        icon,
        title,
        desc,
        color
    }: {
        modeType: ScreenMode;
        icon: string;
        title: string;
        desc: string;
        color: string;
    }) => {
        const isActive = mode === modeType;
        return (
            <button
                className="feature-card"
                onClick={() => setMode(modeType)}
                style={{
                    alignItems: 'center',
                    borderColor: isActive ? color : '#333',
                    background: isActive ? `${color}15` : 'rgba(0,0,0,0.4)',
                    opacity: isActive ? 1 : 0.6,
                    boxShadow: isActive ? `0 0 20px ${color}25` : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    padding: '25px',
                    minHeight: '160px'
                }}
            >
                <Icon name={icon} style={{ width: '48px', height: '48px', color: isActive ? color : '#666', marginBottom: '15px' }} />
                <div className="feature-title" style={{ color: isActive ? color : '#888', fontSize: '20px' }}>{title}</div>
                <div className="feature-desc" style={{ textAlign: 'center', fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>{desc}</div>
            </button>
        );
    };

    return (
        <div className="screen-container screen-enter" style={{ paddingTop: '5vh' }}>
            {/* Header */}
            <div className="screen-header-row" style={{ maxWidth: '900px', width: '100%', marginBottom: '30px' }}>
                <div style={{ width: '100px' }}>
                    <BackButton onClick={onClose} />
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <h1 className="screen-title" style={{ marginRight: '0', fontSize: '28px', letterSpacing: '4px' }}>PVP ARENA</h1>
                </div>
                <div style={{ width: '100px' }}></div>
            </div>

            <div className="screen-content" style={{ maxWidth: '900px', width: '100%', gap: '30px' }}>

                {/* Mode Select - 3 Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%' }}>
                    <ModeCard modeType="VS_PC" icon={ICONS.Game.Boss} title="VS PC" desc="Battle the AI" color="#f80" />
                    <ModeCard modeType="COOP" icon={ICONS.Game.Shield} title="CO-OP" desc="Share lives & score" color="#0ff" />
                    <ModeCard modeType="VERSUS" icon={ICONS.Game.Sword} title="VERSUS" desc="Last ship standing" color="#f06" />
                </div>

                {/* VS PC Options */}
                {mode === 'VS_PC' && (
                    <div style={{
                        width: '100%',
                        maxWidth: '500px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        background: 'rgba(255,136,0,0.05)',
                        border: '1px solid rgba(255,136,0,0.2)',
                        borderRadius: '12px',
                        padding: '25px'
                    }}>
                        <div style={{ textAlign: 'center', color: '#f80', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}>
                            SELECT DIFFICULTY
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {(['EASY', 'NORMAL', 'HARD'] as AIDifficulty[]).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    style={{
                                        padding: '15px',
                                        background: difficulty === d ? 'rgba(255,136,0,0.2)' : 'rgba(0,0,0,0.3)',
                                        border: `2px solid ${difficulty === d ? '#f80' : '#444'}`,
                                        borderRadius: '8px',
                                        color: difficulty === d ? '#f80' : '#888',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleStartVsPC}
                            className="main-btn btn-primary-pulse"
                            style={{
                                width: '100%',
                                borderColor: '#f80',
                                color: '#f80',
                                background: 'rgba(255,136,0,0.2)',
                                fontSize: '18px',
                                padding: '18px',
                                marginTop: '10px'
                            }}
                        >
                            <Icon name={ICONS.Menu.Play} style={{ marginRight: '10px' }} />
                            START BATTLE
                        </button>
                    </div>
                )}

                {/* Online Multiplayer Options */}
                {(mode === 'COOP' || mode === 'VERSUS') && (
                    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Quick Match */}
                        <button className="menu-btn" style={{ width: '100%', fontSize: '16px', padding: '18px', borderStyle: 'solid', borderColor: '#444', color: '#ccc', justifyContent: 'center' }}>
                            <Icon name={ICONS.Game.Lightning} /> QUICK MATCH
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>
                            <div style={{ height: '1px', background: '#333', flex: 1 }}></div>
                            OR JOIN PRIVATE
                            <div style={{ height: '1px', background: '#333', flex: 1 }}></div>
                        </div>

                        {/* Room Input */}
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="ENTER ROOM ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    paddingRight: '50px',
                                    background: 'rgba(0,0,0,0.4)',
                                    border: 'none',
                                    borderBottom: '2px solid #444',
                                    borderRadius: '0',
                                    color: '#fff',
                                    textAlign: 'center',
                                    fontSize: '20px',
                                    letterSpacing: '4px',
                                    textTransform: 'uppercase',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    fontFamily: 'monospace',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = '#0ff'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#444'}
                                inputMode="numeric"
                            />
                            <button
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        setRoomId(text.trim().toUpperCase());
                                    } catch (err) {
                                        console.error('Failed to read clipboard', err);
                                    }
                                }}
                                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
                                title="Paste"
                            >
                                <Icon name={ICONS.Actions.Copy} />
                            </button>
                        </div>

                        {/* Join Button */}
                        <button
                            onClick={handleJoinRoom}
                            className="main-btn btn-primary-pulse"
                            disabled={!roomId && status === 'IDLE'}
                            style={{
                                width: '100%',
                                opacity: roomId || status !== 'IDLE' ? 1 : 0.5,
                                borderColor: status === 'CONNECTING' ? '#555' : '#0ff',
                                background: status === 'CONNECTING' ? '#333' : 'rgba(0, 255, 255, 0.2)',
                                fontSize: '18px',
                                padding: '18px',
                                marginTop: '10px'
                            }}
                        >
                            {status === 'IDLE' ? 'JOIN ROOM' : status === 'CONNECTING' ? 'CONNECTING...' : 'CONNECTED!'}
                        </button>

                        {status !== 'IDLE' && <div style={{ textAlign: 'center', color: '#0ff', fontSize: '14px' }}>{status}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};
