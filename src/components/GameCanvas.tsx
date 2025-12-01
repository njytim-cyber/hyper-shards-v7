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

    useEffect(() => {
        if (canvasRef.current) {
            gameEngine.init(canvasRef.current, {
                onScoreUpdate: props.onScoreUpdate,
                onWaveUpdate: props.onWaveUpdate,
                onLivesUpdate: props.onLivesUpdate,
                onWeaponUpdate: props.onWeaponUpdate,
                onComboUpdate: props.onComboUpdate,
                onGameOver: props.onGameOver,
                onGameStart: props.onGameStart,
                onPause: props.onPause
            });
        }
    }, []);

    return <canvas ref={canvasRef} id="gameCanvas" style={{ display: 'block' }} />;
};
