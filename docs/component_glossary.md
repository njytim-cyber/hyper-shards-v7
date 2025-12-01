# Component Glossary

## Screens
- **StartScreen**: Main entry point. Props: `onStart`, `onOpenShop`, `highScore`.
- **GameOverScreen**: Displayed when lives reach 0. Props: `score`, `highScore`, `onRestart`, `onOpenShop`.
- **PauseScreen**: In-game menu. Props: `onResume`, `onOpenShop`.
- **ShopScreen**: Upgrade and skin store. Props: `onClose`.

## UI
- **HUD**: Heads-up display showing lives, score, wave, combo, and controls. Props: `lives`, `shields`, `score`, `wave`, `combo`, `comboVal`, `weapon`, `shards`, `onPause`.

## Core
- **GameCanvas**: The main rendering surface for the game engine. Props: `onScoreUpdate`, `onLivesUpdate`, `onWeaponUpdate`, `onComboUpdate`, `onWaveUpdate`, `onGameOver`, `onGameStart`.
