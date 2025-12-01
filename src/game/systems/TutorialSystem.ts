import { gameEngine } from '../core/GameEngine';
import { audioSystem } from './AudioSystem';
import { persistence } from './Persistence';

export class TutorialSystem {
    public active: boolean = false;
    public step: number = 0; // 0: None, 1: Rotate, 2: Move, 3: Shoot, 4: Swap, 5: Pause
    public isMobile: boolean = false;
    public shotsFired: number = 0;
    public startPos: { x: number, y: number } = { x: 0, y: 0 };
    public startAngle: number = 0;

    public init() {
        // Detect mobile/tablet: check BOTH user agent AND other factors
        // This catches phones (narrow viewport), tablets (user agent), and touch devices
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasNarrowViewport = window.innerWidth <= 768;
        const hasTouchSupport = 'ontouchstart' in window;

        this.isMobile = isMobileUserAgent || hasNarrowViewport || hasTouchSupport;
    }

    public start() {
        // Re-check mobile status - handles viewport changes and tablets
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const hasNarrowViewport = window.innerWidth <= 768;
        const hasTouchSupport = 'ontouchstart' in window;

        this.isMobile = isMobileUserAgent || hasNarrowViewport || hasTouchSupport;

        this.active = true;
        this.step = 1;
        this.shotsFired = 0;
        if (gameEngine.ship) {
            this.startPos = { x: gameEngine.ship.x, y: gameEngine.ship.y };
            this.startAngle = gameEngine.ship.angle;
        }
        this.showStep();
    }

    public end() {
        this.active = false;
        this.step = 0;
        const layer = document.getElementById('tutorial-layer');
        if (layer) layer.style.display = 'none';
        persistence.profile.tutorialComplete = true;
        persistence.save();
        gameEngine.spawnWave();
    }

    public showStep() {
        const layer = document.getElementById('tutorial-layer');
        if (!layer) return;

        layer.style.display = 'flex';
        layer.innerHTML = '';

        const text = document.createElement('div');
        text.className = 'tutorial-text';
        text.id = 'tut-text';

        const sub = document.createElement('div');
        sub.className = 'tutorial-sub';
        sub.id = 'tut-sub';

        const handLeft = document.createElement('div');
        handLeft.className = 'tutorial-hand left';
        handLeft.id = 'tut-hand-left';

        const handRight = document.createElement('div');
        handRight.className = 'tutorial-hand right';
        handRight.id = 'tut-hand-right';

        layer.appendChild(text);
        layer.appendChild(sub);
        layer.appendChild(handLeft);
        layer.appendChild(handRight);

        handLeft.style.opacity = '0';
        handRight.style.opacity = '0';

        switch (this.step) {
            case 1: // Rotate
                text.innerText = "STEER";
                sub.innerText = this.isMobile ? "DRAG RIGHT STICK" : "USE Q and E";
                if (this.isMobile) handRight.style.opacity = '1';
                break;
            case 2: // Move
                text.innerText = "MOVE";
                sub.innerText = this.isMobile ? "DRAG LEFT STICK" : "USE W-A-S-D";
                if (this.isMobile) handLeft.style.opacity = '1';
                break;
            case 3: // Shoot
                text.innerText = "SHOOT";
                sub.innerText = this.isMobile ? "HOLD RIGHT STICK" : "PRESS SPACE";
                if (this.isMobile) handRight.style.opacity = '1';
                if (gameEngine.canvas) {
                    gameEngine.spawnTutorialAsteroid(gameEngine.canvas.width / 2, 100);
                }
                break;
            case 4: // Swap
                text.innerText = "WEAPON";
                sub.innerText = this.isMobile ? "TAP WEAPON ICON" : "PRESS F TO SWAP";
                break;
            case 5: // Pause
                text.innerText = "PAUSE";
                sub.innerText = this.isMobile ? "TAP PAUSE BUTTON" : "PRESS P TO PAUSE";
                break;
        }
    }

    public checkRotate(currentAngle: number) {
        if (!this.active || this.step !== 1) return;
        let diff = Math.abs(currentAngle - this.startAngle);
        if (diff > Math.PI) diff = (Math.PI * 2) - diff;

        if (diff > 0.8) {
            this.step = 2;
            audioSystem.playPowerUp();
            this.showStep();
        }
    }

    public checkMove(x: number, y: number) {
        if (!this.active || this.step !== 2) return;
        const d = Math.sqrt((x - this.startPos.x) ** 2 + (y - this.startPos.y) ** 2);
        if (d > 150) {
            this.step = 3;
            audioSystem.playPowerUp();
            this.showStep();
        }
    }

    public checkShoot() {
        if (!this.active || this.step !== 3) return;
        this.shotsFired++;
    }

    public checkAsteroidDestroyed() {
        if (!this.active || this.step !== 3) return;
        this.step = 4;
        audioSystem.playPowerUp();
        this.showStep();
    }

    public checkSwap() {
        if (!this.active || this.step !== 4) return;
        this.step = 5;
        audioSystem.playPowerUp();
        this.showStep();
    }

    public checkPause() {
        if (!this.active || this.step !== 5) return;
        this.end();
    }
}

export const tutorialSystem = new TutorialSystem();
