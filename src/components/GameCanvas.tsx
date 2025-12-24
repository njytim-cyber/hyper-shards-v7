import React, { useEffect, useRef } from 'react';
import { gameEngine } from '../game/core/GameEngine';

interface GameCanvasProps {
    onScoreUpdate: (score: number) => void;
    onWaveUpdate: (wave: number, subText: string, hintText: string, isBoss: boolean) => void;
    onLivesUpdate: (lives: number, shields: number) => void;
    onWeaponUpdate: (weapon: string) => void;
    onComboUpdate: (combo: number, val: number) => void;
    onGameOver: (score: number, highScore: number) => void;
    onGameStart: () => void;
    onPause: (isPaused: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Store callbacks in refs to avoid re-initializing game engine on callback changes
    const callbacksRef = useRef(props);

    // Update ref in useEffect to avoid updating during render
    useEffect(() => {
        callbacksRef.current = props;
    });

    useEffect(() => {
        if (canvasRef.current) {
            gameEngine.init(canvasRef.current, {
                onScoreUpdate: (score) => callbacksRef.current.onScoreUpdate(score),
                onWaveUpdate: (wave, subText, hintText, isBoss) => callbacksRef.current.onWaveUpdate(wave, subText, hintText, isBoss),
                onLivesUpdate: (lives, shields) => callbacksRef.current.onLivesUpdate(lives, shields),
                onWeaponUpdate: (weapon) => callbacksRef.current.onWeaponUpdate(weapon),
                onComboUpdate: (combo, val) => callbacksRef.current.onComboUpdate(combo, val),
                onGameOver: (score, highScore) => callbacksRef.current.onGameOver(score, highScore),
                onGameStart: () => callbacksRef.current.onGameStart(),
                onPause: (isPaused) => callbacksRef.current.onPause(isPaused)
            });
        }
    }, []);

    return <canvas ref={canvasRef} id="gameCanvas" style={{ display: 'block' }} />;
};
