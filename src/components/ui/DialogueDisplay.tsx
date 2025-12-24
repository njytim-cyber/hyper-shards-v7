import { useState, useEffect } from 'react';
import type { PilotId } from '../../game/config/PilotConfig';

// This component is controlled via custom events - no props needed
type DialogueDisplayProps = Record<string, never>;

interface DialogueState {
    visible: boolean;
    text: string;
    pilotName: string;
    pilotIcon: string;
    pilotColor: string;
    pilotId: PilotId | null;
}

export const DialogueDisplay: React.FC<DialogueDisplayProps> = () => {
    const [dialogue, setDialogue] = useState<DialogueState>({
        visible: false,
        text: '',
        pilotName: '',
        pilotIcon: '',
        pilotColor: '#0ff',
        pilotId: null
    });

    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Listen for dialogue events from the game
        const handleDialogue = (e: CustomEvent<{
            pilotId: PilotId;
            text: string;
            pilotName: string;
            icon: string;
            color: string;
        }>) => {
            setFadeOut(false);
            setDialogue({
                visible: true,
                text: e.detail.text,
                pilotName: e.detail.pilotName,
                pilotIcon: e.detail.icon,
                pilotColor: e.detail.color,
                pilotId: e.detail.pilotId
            });

            // Auto-hide after 4 seconds
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setDialogue(prev => ({ ...prev, visible: false }));
                }, 500);
            }, 4000);
        };

        window.addEventListener('pilot-dialogue', handleDialogue as EventListener);
        return () => window.removeEventListener('pilot-dialogue', handleDialogue as EventListener);
    }, []);

    if (!dialogue.visible) return null;

    return (
        <div
            className={`dialogue-display ${fadeOut ? 'fade-out' : ''}`}
            style={{
                position: 'fixed',
                bottom: '120px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 150,
                pointerEvents: 'none',
                animation: fadeOut ? 'fadeOut 0.5s ease-out forwards' : 'slideUp 0.3s ease-out'
            }}
        >
            <div
                className="dialogue-bubble"
                style={{
                    background: 'rgba(0,0,0,0.85)',
                    border: `2px solid ${dialogue.pilotColor}`,
                    borderRadius: '15px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    maxWidth: '500px',
                    boxShadow: `0 0 30px ${dialogue.pilotColor}40`
                }}
            >
                <div
                    className="pilot-avatar"
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${dialogue.pilotColor}20, ${dialogue.pilotColor}40)`,
                        border: `2px solid ${dialogue.pilotColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0
                    }}
                >
                    {dialogue.pilotIcon}
                </div>

                <div className="dialogue-content">
                    <div
                        className="pilot-name"
                        style={{
                            color: dialogue.pilotColor,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '4px'
                        }}
                    >
                        {dialogue.pilotName}
                    </div>
                    <div
                        className="dialogue-text"
                        style={{
                            color: '#fff',
                            fontSize: '16px',
                            lineHeight: 1.3
                        }}
                    >
                        {dialogue.text}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
};

// Helper function to trigger dialogue from anywhere in the codebase
// eslint-disable-next-line react-refresh/only-export-components
export function showPilotDialogue(
    pilotId: PilotId,
    text: string,
    pilotName: string,
    icon: string,
    color: string
) {
    window.dispatchEvent(new CustomEvent('pilot-dialogue', {
        detail: { pilotId, text, pilotName, icon, color }
    }));
}
