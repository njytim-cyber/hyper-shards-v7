
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
import { SettingsScreen } from './components/screens/SettingsScreen';
import { MatchmakingScreen } from './components/screens/MatchmakingScreen';
import { ChallengeScreen } from './components/screens/ChallengeScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { gameEngine, GameEngine } from './game/core/GameEngine';
import { persistence, Persistence } from './game/systems/Persistence';
import { audioSystem, AudioSystem } from './game/systems/AudioSystem';
import { canClaimDailyReward } from './game/config/DailyRewardsConfig';
import { CanvasView } from './views/CanvasView';
import { ParticleContainer } from './components/containers/ParticleContainer';
import { PlayerContainer } from './components/containers/PlayerContainer';
import { Icons } from './components/ui/Icons';
import { DialogueDisplay } from './components/ui/DialogueDisplay';
import type { ChallengeModifier } from './game/config/ChallengeModifiers';
import './styles/index.css';

// Extend Window interface for game globals
declare global {
  interface Window {
    gameEngine: GameEngine;
    persistence: Persistence;
    audioSystem: AudioSystem;
  }
}

type GameStateType = 'INTRO' | 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY' | 'SHOP' | 'ACHIEVEMENTS' | 'PILOTS' | 'CAMPAIGN' | 'SETTINGS' | 'MATCHMAKING' | 'CHALLENGE';

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
    showWave: false,
    opponentLives: undefined as number | undefined,
    opponentShields: undefined as number | undefined
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
  const [showAuth, setShowAuth] = useState(false);

  // Satisfy linter
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

  const handleOpenSettings = () => {
    setPreviousState(gameState);
    setGameState('SETTINGS');
  };

  const handleCloseSettings = () => {
    setGameState(previousState);
  };

  const handleOpenProfile = () => {
    setShowAuth(true);
  };

  const handleCloseProfile = () => {
    setShowAuth(false);
  };

  const handleOpenMatchmaking = () => {
    setGameState('MATCHMAKING');
  };

  const handleCloseMatchmaking = () => {
    setGameState('START');
    audioSystem.playMusic('load');
  };

  const handleStartMatchGame = () => {
    setGameState('PLAYING');
    // gameEngine.startGame() is NOT called primarily because startGame() resets everything.
    // However, we DO need some initialization (lives, ship, etc).
    // Let's modify gameEngine.startGame to accept a "skipParamsReset" or similar, 
    // OR just manually call necessary init methods.
    // Actually, it's safer to call startGame() and pass a flag to NOT reset the mode/bridge.

    // gameEngine.gameMode is already set by MatchmakingScreen (VERSUS, COOP, or VS_PC)
    // Only call startGame (which resets everything) if we are NOT in VS_PC mode
    // (because startVsPC has already been called and done its own setup)
    if (gameEngine.gameMode !== 'VS_PC') {
      gameEngine.startGame();
    }
    audioSystem.playMusic('wave');
  };

  const handleOpenChallenge = () => {
    setGameState('CHALLENGE');
  };

  const handleCloseChallenge = () => {
    setGameState('START');
    audioSystem.playMusic('load');
  };

  const handleStartChallenge = (modifiers: ChallengeModifier[]) => {
    setGameState('PLAYING');
    gameEngine.startGame(modifiers);
    audioSystem.playMusic('wave');
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
        persistence.submitScore(gameEngine.score, gameEngine.wave);
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
        setCampaignResult({ levelId, stars, time, tookDamage, maxCombo });
        setGameState('VICTORY');  // Will show level complete screen
        persistence.trackStat('totalGamesPlayed', 1);
      },
      onOpponentUpdate: (lives, shields) => {
        setHudState(prev => ({ ...prev, opponentLives: lives, opponentShields: shields }));
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
          opponentLives={hudState.opponentLives}
          opponentShields={hudState.opponentShields}
        />
      )}

      {gameState === 'START' && (
        <StartScreen
          onStart={handleStart}
          onOpenShop={handleOpenShop}
          onOpenAchievements={handleOpenAchievements}
          onOpenPilots={handleOpenPilots}
          onOpenCampaign={handleOpenCampaign}
          onOpenChallenge={handleOpenChallenge}
          onOpenSettings={handleOpenSettings}
          onOpenProfile={handleOpenProfile}
          onOpenMatchmaking={handleOpenMatchmaking}
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
        <PauseScreen
          onResume={handlePause}
          onOpenShop={handleOpenShop}
          onQuitToMenu={() => {
            gameEngine.gameState = 'START';
            setGameState('START');
            audioSystem.playMusic('load');
          }}
        />
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

      {gameState === 'SETTINGS' && (
        <SettingsScreen onClose={handleCloseSettings} />
      )}

      {gameState === 'MATCHMAKING' && (
        <MatchmakingScreen onClose={handleCloseMatchmaking} onStartGame={handleStartMatchGame} />
      )}

      {gameState === 'CHALLENGE' && (
        <ChallengeScreen onClose={handleCloseChallenge} onStart={handleStartChallenge} />
      )}

      {showAuth && (
        <AuthScreen onClose={handleCloseProfile} />
      )}

      {showDailyRewards && (
        <DailyRewardsPopup
          onClose={() => setShowDailyRewards(false)}
          onClaim={handleDailyRewardClaim}
        />
      )}

      <DialogueDisplay />
      <div id="tutorial-layer"></div>
      <div id="level-screen" className={`${levelText.show ? 'show-level' : ''} ${levelText.isBoss ? 'boss-alert-bg' : ''}`}>
        <div id="level-title" className="cyan-glow" style={{ color: levelText.isBoss ? '#f00' : '#0ff', fontSize: (levelText.sub === 'GET READY' || levelText.sub === 'GO!') ? '120px' : '60px' }}>
          {(levelText.sub === 'GET READY' || levelText.sub === 'GO!') ? levelText.hint || levelText.sub : (levelText.isBoss ? 'WARNING' : `WAVE ${levelText.wave}`)}
        </div>
        <div id="level-sub" style={{ fontSize: '20px', color: '#fff', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {(levelText.sub === 'GET READY' || levelText.sub === 'GO!') && levelText.sub !== levelText.hint ? levelText.sub : levelText.sub}
        </div>
        <div id="level-hint" style={{ fontSize: '14px', color: '#aaa', marginTop: '20px', fontStyle: 'italic' }}>
          {levelText.hint}
        </div>
      </div>
    </div>
  );
}

export default App;
