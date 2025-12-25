
import React, { useState, useEffect } from 'react';
import { authSystem } from '../../game/systems/AuthSystem';
import { ICONS } from '../../game/config/Icons';

interface AuthScreenProps {
    onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState(authSystem.user);

    useEffect(() => {
        const handleAuthChange = (e: Event) => {
            const detail = (e as CustomEvent<{ user: typeof authSystem.user }>).detail;
            setUser(detail.user);
        };
        window.addEventListener('auth-changed', handleAuthChange);
        return () => window.removeEventListener('auth-changed', handleAuthChange);
    }, []);

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        const { error } = await authSystem.signInWithEmail(email);
        if (error) {
            setStatus('error');
            setErrorMessage(error.message);
        } else {
            setStatus('sent');
        }
    };

    const handleAnonLogin = async () => {
        setStatus('loading');
        const { error } = await authSystem.signInAnonymously();
        if (error) {
            setStatus('error');
            setErrorMessage(error.message);
        } else {
            setStatus('success');
            setTimeout(onClose, 1000);
        }
    };

    const handleLogout = async () => {
        await authSystem.signOut();
        setStatus('idle');
    };

    return (
        <div className="settings-overlay screen-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
            <div className="detail-panel" style={{ width: '400px', maxWidth: '90%', border: '1px solid #4a4a6a', background: '#1a1a2e', padding: '30px' }}>
                <h2 className="screen-title" style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>PILOT PROFILE</h2>

                {user ? (
                    <div style={{ textAlign: 'center', color: '#ccc' }}>
                        <p style={{ marginBottom: '10px' }}>LOGGED IN AS:</p>
                        <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px', marginBottom: '10px', padding: '10px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '6px' }}>
                            {user.email || 'Anonymous Pilot'}
                        </div>
                        <p style={{ fontSize: '12px', opacity: 0.7, fontFamily: 'monospace' }}>ID: {user.id.slice(0, 8)}...</p>

                        <button className="menu-btn" onClick={handleLogout} style={{ marginTop: '30px', width: '100%', borderColor: '#f66', color: '#f66' }}>
                            {ICONS.Menu.Quit} LOGOUT
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', marginBottom: '20px', lineHeight: '1.5' }}>
                            Sign in to save progress to the cloud and compete on leaderboards.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {status === 'sent' ? (
                                <div style={{ background: 'rgba(6, 78, 59, 0.5)', color: '#6ee7b7', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #064e3b' }}>
                                    Magic link sent to <strong>{email}</strong>!<br />Check your inbox.
                                </div>
                            ) : (
                                <form onSubmit={handleMagicLinkLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="email"
                                        placeholder="pilot@hypershards.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="glass-input"
                                        style={{ width: '100%' }}
                                        required
                                    />
                                    <button type="submit" className="main-btn" disabled={status === 'loading'} style={{ width: '100%', fontSize: '16px' }}>
                                        {status === 'loading' ? 'SENDING...' : 'SEND MAGIC LINK'}
                                    </button>
                                </form>
                            )}

                            <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', margin: '10px 0' }}>— OR —</div>

                            <button className="menu-btn" onClick={handleAnonLogin} disabled={status === 'loading'} style={{ width: '100%', opacity: 0.8, justifyContent: 'center' }}>
                                PLAY AS GUEST
                            </button>
                        </div>

                        {status === 'error' && (
                            <div style={{ color: '#f87171', marginTop: '15px', fontSize: '13px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '4px' }}>
                                {errorMessage}
                            </div>
                        )}
                    </>
                )}

                <button
                    onClick={onClose}
                    className="back-btn"
                    style={{
                        width: '100%', marginTop: '20px', justifyContent: 'center', border: 'none', background: 'transparent'
                    }}
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
};
