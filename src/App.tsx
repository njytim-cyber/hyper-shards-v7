import { useState, useEffect } from 'react';
import { HUD } from './components/ui/HUD';
import { StartScreen } from './components/screens/StartScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { PauseScreen } from './components/screens/PauseScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { gameEngine } from './game/core/GameEngine';
import { persistence } from './game/systems/Persistence';
import { audioSystem } from './game/systems/AudioSystem';
import { CanvasView } from './views/CanvasView';
import { ParticleContainer } from './components/containers/ParticleContainer';
import { PlayerContainer } from './components/containers/PlayerContainer';
import { Icons } from './components/ui/Icons';

// Import SVG icons
import './styles/index.css';

function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'SHOP'>('START');
  const [hudState, setHudState] = useState({
    lives: 3,
    shields: 0,
    wave: 1,
    weapon: 'BLASTER',
    showWave: false
  });
  const [levelText, setLevelText] = useState({ show: false, wave: 1, sub: '', hint: '', isBoss: false });
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    persistence.load();
    setHighScore(persistence.profile.highScore);
    // Shards are read directly in HUD now, or we can keep passing them if they don't update often.
    // Actually HUD reads shards from props in my previous edit. Let's keep passing shards via prop for now, 
    // but we need to trigger re-render when they change (e.g. shop).
    // Wait, HUD refactor kept 'shards' as prop.
  }, []);

  // ... (SVG injection omitted for brevity, assuming it's unchanged or handled by previous context)

  const [previousState, setPreviousState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'SHOP'>('START');
  const [preShopTrack, setPreShopTrack] = useState<string | null>(null);

  const handleStart = () => {
    setGameState('PLAYING');
    gameEngine.startGame();
    audioSystem.playMusic('wave');
  };

  const handlePause = () => {
    gameEngine.togglePause();
  };

  const handleOpenShop = () => {
    setPreviousState(gameState);
    setPreShopTrack(audioSystem.lastTrackName);
    setGameState('SHOP');
  };

  const handleCloseShop = () => {
    if (previousState === 'PAUSED') {
      setGameState('PAUSED');
      if (preShopTrack) audioSystem.playMusic(preShopTrack);
    } else {
      setGameState('START');
      audioSystem.playMusic('load');
    }
  };

  // Canvas initialization is now handled by CanvasView callback

  // Ref for GameEngine init
  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    (window as any).gameEngine = gameEngine;
    (window as any).persistence = persistence;
    (window as any).audioSystem = audioSystem;
    // Note: GameEngine currently expects to call getContext('2d') itself.
    // If CanvasView locked it to WebGPU, this will fail.
    // For this phase, we ensure CanvasView *can* do WebGPU but we let GameEngine do its thing for now
    // unless we are fully switching.
    gameEngine.init(canvas, {
      onScoreUpdate: (_score) => { /* No-op */ },
      onWaveUpdate: (wave, sub, hint, boss) => {
        const isTutorial = sub === "TUTORIAL";
        setHudState(prev => ({ ...prev, wave, showWave: !isTutorial }));
        if (!isTutorial) {
          setLevelText({ show: true, wave, sub, hint, isBoss: boss });
          setTimeout(() => setLevelText(prev => ({ ...prev, show: false })), 3000);
        }
      },
      onLivesUpdate: (lives, shields) => setHudState(prev => ({ ...prev, lives, shields })),
      onWeaponUpdate: (weapon) => setHudState(prev => ({ ...prev, weapon })),
      onComboUpdate: (_combo, _val) => { /* No-op */ },
      onGameOver: (score, highScore, newHigh) => {
        setGameState('GAMEOVER');
        setHighScore(highScore);
        setIsNewHighScore(newHigh);
      },
      onGameStart: () => setGameState('PLAYING'),
      onPause: (isPaused) => setGameState(isPaused ? 'PAUSED' : 'PLAYING')
    });
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#050505' }}>
      <Icons />
      <PlayerContainer />
      <ParticleContainer />
      <CanvasView onCanvasReady={handleCanvasReady} />

      {gameState === 'PLAYING' && (
        <HUD
          lives={hudState.lives}
          shields={hudState.shields}
          wave={hudState.wave}
          weapon={hudState.weapon}
          shards={persistence.profile.shards}
          onPause={handlePause}
          showWave={hudState.showWave}
        />
      )}

      {gameState === 'START' && <StartScreen onStart={handleStart} onOpenShop={handleOpenShop} highScore={highScore} />}
      {gameState === 'GAMEOVER' && <GameOverScreen score={gameEngine.score} highScore={highScore} isNewHighScore={isNewHighScore} onRestart={handleStart} onOpenShop={handleOpenShop} />}
      {gameState === 'PAUSED' && <PauseScreen onResume={handlePause} onOpenShop={handleOpenShop} />}
      {gameState === 'SHOP' && <ShopScreen onClose={handleCloseShop} />}

      {/* Tutorial Layer */}
      <div id="tutorial-layer"></div>

      {/* Level Overlay */}
      <div id="level-screen" className={`${levelText.show ? 'show-level' : ''} ${levelText.isBoss ? 'boss-alert-bg' : ''}`}>
        <div id="level-title" className="cyan-glow" style={{ color: levelText.isBoss ? '#f00' : '#0ff' }}>
          {levelText.isBoss ? 'WARNING' : `WAVE ${levelText.wave}`}
        </div>
        <div id="level-sub" style={{ fontSize: '20px', color: '#fff', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {levelText.sub}
        </div>
        <div id="level-hint" style={{ fontSize: '14px', color: '#aaa', marginTop: '20px', fontStyle: 'italic' }}>
          {levelText.hint}
        </div>
      </div>
    </div>
  );
}

export default App;
