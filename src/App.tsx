import { useState, useEffect } from 'react';
import { HUD } from './components/ui/HUD';
import { StartScreen } from './components/screens/StartScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { PauseScreen } from './components/screens/PauseScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { IntroScreen } from './components/screens/IntroScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';
import { DailyRewardsPopup } from './components/screens/DailyRewardsPopup';
import { PilotSelectScreen } from './components/screens/PilotSelectScreen';
import { CampaignScreen } from './components/screens/CampaignScreen';
import { gameEngine, GameEngine } from './game/core/GameEngine';
import { persistence, Persistence } from './game/systems/Persistence';
import { audioSystem, AudioSystem } from './game/systems/AudioSystem';
import { canClaimDailyReward } from './game/config/DailyRewardsConfig';
import { CanvasView } from './views/CanvasView';
import { ParticleContainer } from './components/containers/ParticleContainer';
import { PlayerContainer } from './components/containers/PlayerContainer';
import { Icons } from './components/ui/Icons';
import { DialogueDisplay } from './components/ui/DialogueDisplay';

import './styles/index.css';

// Extend Window interface for game globals
declare global {
  interface Window {
    gameEngine: GameEngine;
    persistence: Persistence;
    audioSystem: AudioSystem;
  }
}

type GameStateType = 'INTRO' | 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'SHOP' | 'ACHIEVEMENTS' | 'PILOTS' | 'CAMPAIGN';

// Module-level flag for one-time initialization (avoids refs-during-render lint error)
let persistenceLoaded = false;
function ensurePersistenceLoaded(): void {
  if (!persistenceLoaded) {
    persistence.load();
    persistenceLoaded = true;
  }
}

function getInitialHighScore(): number {
  ensurePersistenceLoaded();
  return persistence.profile.highScore;
}

function getInitialGameState(): GameStateType {
  ensurePersistenceLoaded();
  return persistence.profile.hasSeenIntro ? 'START' : 'INTRO';
}

function App() {
  const [gameState, setGameState] = useState<GameStateType>(getInitialGameState);
  const [hudState, setHudState] = useState({
    lives: 3,
    shields: 0,
    wave: 1,
    weapon: 'BLASTER',
    showWave: false
  });
  const [levelText, setLevelText] = useState({ show: false, wave: 1, sub: '', hint: '', isBoss: false });
  const [highScore, setHighScore] = useState(getInitialHighScore);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [previousState, setPreviousState] = useState<GameStateType>('START');
  const [preShopTrack, setPreShopTrack] = useState<string | null>(null);
  const [campaignResult, setCampaignResult] = useState<{
    levelId: number;
    stars: number;
    time: number;
    tookDamage: boolean;
    maxCombo: number;
  } | null>(null);
  const [currentCampaignLevel, setCurrentCampaignLevel] = useState<number>(0);
  // Satisfy linter - these will be used when LevelCompleteScreen is added
  void campaignResult;
  void currentCampaignLevel;

  useEffect(() => {
    // Check for daily rewards
    if (canClaimDailyReward(persistence.profile.dailyRewards)) {
      setTimeout(() => setShowDailyRewards(true), 500);
    }
  }, []);

  const handleIntroComplete = () => {
    setGameState('START');
    audioSystem.playMusic('load');
  };

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

  const handleOpenAchievements = () => {
    setPreviousState(gameState);
    setGameState('ACHIEVEMENTS');
  };

  const handleCloseAchievements = () => {
    setGameState(previousState);
  };

  const handleOpenPilots = () => {
    setPreviousState(gameState);
    setGameState('PILOTS');
  };

  const handleClosePilots = () => {
    setGameState(previousState);
  };

  const handlePilotSelect = () => {
    setGameState(previousState);
  };

  const handleOpenCampaign = () => {
    setGameState('CAMPAIGN');
  };

  const handleCloseCampaign = () => {
    setGameState('START');
    audioSystem.playMusic('load');
  };

  const handleStartCampaignLevel = (levelId: number) => {
    setCurrentCampaignLevel(levelId);
    setGameState('PLAYING');
    gameEngine.startCampaignLevel(levelId);
  };

  const handleDailyRewardClaim = () => {
    // Could show a nice animation here
  };

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    window.gameEngine = gameEngine;
    window.persistence = persistence;
    window.audioSystem = audioSystem;

    gameEngine.init(canvas, {
      onScoreUpdate: () => { /* No-op */ },
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
      onComboUpdate: () => { /* No-op */ },
      onGameOver: (_, hs, newHigh) => {
        setGameState('GAMEOVER');
        setHighScore(hs);
        setIsNewHighScore(newHigh);
        persistence.trackStat('totalGamesPlayed', 1);
      },
      onVictory: (score, hs) => {
        setGameState('VICTORY');
        setHighScore(hs);
        setIsNewHighScore(score > hs);
        persistence.trackStat('totalGamesPlayed', 1);
      },
      onGameStart: () => setGameState('PLAYING'),
      onPause: (isPaused) => setGameState(isPaused ? 'PAUSED' : 'PLAYING'),
      onCampaignComplete: (levelId, stars, time, tookDamage, maxCombo) => {
        setCampaignResult({ levelId, stars, time, tookDamage, maxCombo });
        setGameState('VICTORY');  // Will show level complete screen
        persistence.trackStat('totalGamesPlayed', 1);
      }
    });
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#050505' }}>
      <Icons />
      <PlayerContainer />
      <ParticleContainer />
      <CanvasView onCanvasReady={handleCanvasReady} />

      {gameState === 'INTRO' && (
        <IntroScreen onComplete={handleIntroComplete} onSkip={handleIntroComplete} />
      )}

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

      {gameState === 'START' && (
        <StartScreen
          onStart={handleStart}
          onOpenShop={handleOpenShop}
          onOpenAchievements={handleOpenAchievements}
          onOpenPilots={handleOpenPilots}
          onOpenCampaign={handleOpenCampaign}
          highScore={highScore}
        />
      )}

      {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
        <GameOverScreen
          score={gameEngine.score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          isVictory={gameState === 'VICTORY'}
          onRestart={handleStart}
          onOpenShop={handleOpenShop}
        />
      )}

      {gameState === 'PAUSED' && (
        <PauseScreen onResume={handlePause} onOpenShop={handleOpenShop} />
      )}

      {gameState === 'SHOP' && <ShopScreen onClose={handleCloseShop} />}

      {gameState === 'ACHIEVEMENTS' && (
        <AchievementsScreen onClose={handleCloseAchievements} />
      )}

      {gameState === 'PILOTS' && (
        <PilotSelectScreen onClose={handleClosePilots} onSelect={handlePilotSelect} />
      )}

      {gameState === 'CAMPAIGN' && (
        <CampaignScreen onClose={handleCloseCampaign} onStartLevel={handleStartCampaignLevel} />
      )}

      {showDailyRewards && (
        <DailyRewardsPopup
          onClose={() => setShowDailyRewards(false)}
          onClaim={handleDailyRewardClaim}
        />
      )}

      {/* Pilot Dialogue Display */}
      <DialogueDisplay />

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
