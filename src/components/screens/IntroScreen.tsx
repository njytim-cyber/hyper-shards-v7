import { useState, useEffect } from 'react';
import { INTRO_STORY, BOSS_LORE } from '../../game/config/StoryConfig';
import { persistence } from '../../game/systems/Persistence';

interface IntroScreenProps {
    onComplete: () => void;
    onSkip: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, onSkip }) => {
    const [chapterIndex, setChapterIndex] = useState(0);
    const [lineIndex, setLineIndex] = useState(0);
    const [showBosses, setShowBosses] = useState(false);
    const [bossIndex, setBossIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    const currentChapter = INTRO_STORY[chapterIndex];
    const currentBoss = BOSS_LORE[bossIndex];

    useEffect(() => {
        // Defer state update to avoid React Compiler warning
        const rafId = requestAnimationFrame(() => setFadeIn(true));
        const timer = setTimeout(() => setFadeIn(false), 300);
        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timer);
        };
    }, [chapterIndex, bossIndex, showBosses]);

    const handleNext = () => {
        if (!showBosses) {
            // Story phase
            if (lineIndex < currentChapter.text.length - 1) {
                setLineIndex(lineIndex + 1);
            } else if (chapterIndex < INTRO_STORY.length - 1) {
                setChapterIndex(chapterIndex + 1);
                setLineIndex(0);
            } else {
                // Story complete, show bosses
                setShowBosses(true);
                setBossIndex(0);
            }
        } else {
            // Boss introduction phase
            if (bossIndex < BOSS_LORE.length - 1) {
                setBossIndex(bossIndex + 1);
            } else {
                // All done
                persistence.setIntroSeen();
                onComplete();
            }
        }
    };

    const handleSkip = () => {
        persistence.setIntroSeen();
        onSkip();
    };

    return (
        <div className="intro-screen" onClick={handleNext}>
            <div className="intro-skip" onClick={(e) => { e.stopPropagation(); handleSkip(); }}>
                SKIP ▶▶
            </div>

            {!showBosses ? (
                // Story Phase
                <div className={`intro-content ${fadeIn ? 'fade-in' : ''}`}>
                    <div className="intro-chapter-title" style={{ color: '#0ff' }}>
                        {currentChapter.title}
                    </div>
                    <div className="intro-text-container">
                        {currentChapter.text.slice(0, lineIndex + 1).map((line, i) => (
                            <div key={i} className="intro-text-line" style={{
                                opacity: i === lineIndex ? 1 : 0.6,
                                animationDelay: `${i * 0.1}s`
                            }}>
                                {line}
                            </div>
                        ))}
                    </div>
                    <div className="intro-progress">
                        {INTRO_STORY.map((_, i) => (
                            <div key={i} className={`intro-dot ${i <= chapterIndex ? 'active' : ''}`} />
                        ))}
                    </div>
                    <div className="intro-hint">TAP TO CONTINUE</div>
                </div>
            ) : (
                // Boss Introduction Phase
                <div className={`intro-content boss-intro ${fadeIn ? 'fade-in' : ''}`}>
                    <div className="boss-intro-header">
                        WAVE {currentBoss.wave}
                    </div>
                    <div className="boss-intro-name" style={{ color: getBossColor(currentBoss.id) }}>
                        {currentBoss.name}
                    </div>
                    <div className="boss-intro-title">
                        "{currentBoss.title}"
                    </div>
                    <div className="boss-intro-icon">
                        {getBossIcon(currentBoss.id)}
                    </div>
                    <div className="boss-intro-desc">
                        {currentBoss.description}
                    </div>
                    <div className="boss-intro-quote">
                        {currentBoss.quote}
                    </div>
                    <div className="intro-progress">
                        {BOSS_LORE.map((_, i) => (
                            <div key={i} className={`intro-dot ${i <= bossIndex ? 'active' : ''}`}
                                style={{ background: i <= bossIndex ? getBossColor(BOSS_LORE[i].id) : '#333' }} />
                        ))}
                    </div>
                    <div className="intro-hint">TAP TO CONTINUE</div>
                </div>
            )}

            <style>{`
                .intro-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #000 0%, #0a0a1a 50%, #000 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    cursor: pointer;
                    overflow: hidden;
                }
                .intro-screen::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(0,255,255,0.05) 0%, transparent 60%);
                    pointer-events: none;
                }
                .intro-skip {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    color: #666;
                    font-size: 14px;
                    padding: 10px 20px;
                    border: 1px solid #333;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .intro-skip:hover {
                    color: #0ff;
                    border-color: #0ff;
                }
                .intro-content {
                    text-align: center;
                    max-width: 600px;
                    padding: 40px;
                    transition: opacity 0.3s;
                }
                .intro-content.fade-in {
                    animation: introFade 0.5s ease-out;
                }
                @keyframes introFade {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .intro-chapter-title {
                    font-size: 36px;
                    font-weight: 900;
                    letter-spacing: 8px;
                    margin-bottom: 40px;
                    text-shadow: 0 0 30px currentColor;
                }
                .intro-text-container {
                    min-height: 150px;
                }
                .intro-text-line {
                    font-size: 22px;
                    color: #fff;
                    margin: 15px 0;
                    letter-spacing: 2px;
                    animation: lineReveal 0.5s ease-out;
                }
                @keyframes lineReveal {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .intro-progress {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 60px;
                }
                .intro-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #333;
                    transition: all 0.3s;
                }
                .intro-dot.active {
                    background: #0ff;
                    box-shadow: 0 0 10px #0ff;
                }
                .intro-hint {
                    color: #555;
                    font-size: 12px;
                    margin-top: 30px;
                    letter-spacing: 3px;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                /* Boss Intro Styles */
                .boss-intro-header {
                    font-size: 18px;
                    color: #666;
                    letter-spacing: 5px;
                    margin-bottom: 10px;
                }
                .boss-intro-name {
                    font-size: 48px;
                    font-weight: 900;
                    letter-spacing: 10px;
                    text-shadow: 0 0 40px currentColor;
                    margin-bottom: 5px;
                }
                .boss-intro-title {
                    font-size: 20px;
                    color: #888;
                    font-style: italic;
                    margin-bottom: 30px;
                }
                .boss-intro-icon {
                    font-size: 80px;
                    margin: 20px 0;
                    filter: drop-shadow(0 0 20px currentColor);
                }
                .boss-intro-desc {
                    font-size: 16px;
                    color: #aaa;
                    max-width: 400px;
                    margin: 0 auto 20px;
                    line-height: 1.6;
                }
                .boss-intro-quote {
                    font-size: 14px;
                    color: #f00;
                    font-style: italic;
                    margin-top: 20px;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

function getBossColor(id: string): string {
    const colors: Record<string, string> = {
        sentinel: '#f0f',
        vortex: '#0ff',
        striker: '#ff0',
        barrier: '#0f0',
        nova: '#f80',
        void: '#b0f',
        mothership: '#f30'
    };
    return colors[id] || '#fff';
}

function getBossIcon(id: string): string {
    const icons: Record<string, string> = {
        sentinel: '⬡',
        vortex: '◆',
        striker: '▲',
        barrier: '✚',
        nova: '★',
        void: '◯',
        mothership: '⬢'
    };
    return icons[id] || '?';
}
