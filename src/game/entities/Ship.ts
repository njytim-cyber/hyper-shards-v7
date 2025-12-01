import { spriteCache } from '../systems/SpriteCache';
import { persistence } from '../systems/Persistence';
import { audioSystem } from '../systems/AudioSystem';
import { Bullet } from './Bullet';
import { Pool } from '../core/Pool';

interface ShipCallbacks {
    spawnBullet: (b: Bullet) => void;
    spawnParticle: (x: number, y: number, color: string) => void;
    spawnText: (x: number, y: number, text: string, color: string) => void;
    updateWeaponUI: (type: string) => void;
    updateHUD: () => void;
    gameOver: () => void;
}

export class Ship {
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public angle: number = -Math.PI / 2;
    public radius: number = 15;
    public visible: boolean = true;
    public dead: boolean = false;

    public weapons: string[] = ['BLASTER', 'SPREAD', 'RAPID', 'HEAVY'];
    public currentWeaponIndex: number = 0;
    public fireRate: number = 0.15;
    public dashCooldown: number = 0;
    public maxLives: number = 3;
    public damageMult: number = 1;
    public skin: any;
    public shields: number = 0;
    public speedBoostTime: number = 0;
    public invincibleTime: number = 1.5;
    public isDashing: boolean = false;
    public dashTime: number = 0;
    public lastShot: number = 0;

    private bulletPool: Pool<Bullet>;
    constructor(bulletPool: Pool<Bullet>) {
        this.bulletPool = bulletPool;
        this.reset();
        this.maxLives = 3 + (persistence.profile.upgrades.hull || 0);
        this.damageMult = 1 + ((persistence.profile.upgrades.damage || 0) * 0.1);
        // Skin config is in index.html, we need to port it or access it.
        // For now, I'll assume we can get it from a config file or just hardcode defaults if missing.
        // I'll create a SkinConfig in a separate file later or inline it.
        // For now, minimal skin object.
        this.skin = { colors: { main: '#0ff', eng: '#0ff', trail: '#0ff' }, design: 'fighter' };
    }

    public reset(canvasWidth: number = window.innerWidth, canvasHeight: number = window.innerHeight, initialInvincibility: number = 1.5) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.vx = 0;
        this.vy = 0;
        this.angle = -Math.PI / 2;
        this.radius = 15;
        this.invincibleTime = initialInvincibility;
        this.visible = true;
        this.isDashing = false;
        this.dashTime = 0;
        this.shields = 0;
        this.speedBoostTime = 0;
        this.dead = false;
    }

    public dash() {
        if (this.dashCooldown <= 0) {
            this.isDashing = true;
            this.dashTime = 0.2;
            let coolReduc = (persistence.profile.upgrades.dashCool || 0) * 0.1;
            this.dashCooldown = 2.0 * (1 - coolReduc);
            let distMult = 1 + ((persistence.profile.upgrades.dashDist || 0) * 0.4);
            this.vx = Math.cos(this.angle) * 600 * distMult;
            this.vy = Math.sin(this.angle) * 600 * distMult;
            audioSystem.playDash();
        }
    }

    public update(dt: number, keys: any, touchSticks: any, canvasWidth: number, canvasHeight: number, callbacks: ShipCallbacks, combo: number) {
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        if (this.speedBoostTime > 0) this.speedBoostTime -= dt;

        // Update Dash UI (handled by React component via state/ref ideally, but for now we might need a callback or direct DOM manipulation if we keep legacy style)
        // We'll skip direct DOM manipulation here and rely on React state updates or refs passed in.
        // Actually, for performance, direct DOM manipulation for the dash bar might be better or use a ref.
        // I'll assume the HUD component handles this via a subscription or polling.

        if (this.isDashing) {
            this.dashTime -= dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            if (this.dashTime <= 0) {
                this.isDashing = false;
                this.vx *= 0.5;
                this.vy *= 0.5;
            }
            this.screenWrap(canvasWidth, canvasHeight);
            return;
        }

        if (this.invincibleTime > 0) {
            this.invincibleTime -= dt;
            this.visible = Math.floor(Date.now() / 200) % 2 === 0;
        } else {
            this.visible = true;
        }

        // Rotation
        if (touchSticks.right.active) {
            if (Math.abs(touchSticks.right.vecX) > 0.1 || Math.abs(touchSticks.right.vecY) > 0.1) {
                this.angle = Math.atan2(touchSticks.right.vecY, touchSticks.right.vecX);
            }
        } else {
            const rotSpeed = 4.0;
            if (keys.q) this.angle -= rotSpeed * dt;
            if (keys.e) this.angle += rotSpeed * dt;
        }

        // Movement
        let fx = 0, fy = 0;
        let inputFwd = 0, inputStrafe = 0;
        if (keys.w || keys.ArrowUp) inputFwd += 1;
        if (keys.s || keys.ArrowDown) inputFwd -= 1;
        if (keys.a || keys.ArrowLeft) inputStrafe -= 1;
        if (keys.d || keys.ArrowRight) inputStrafe += 1;

        if (inputFwd !== 0 || inputStrafe !== 0) {
            const c = Math.cos(this.angle);
            const s = Math.sin(this.angle);
            fx += (c * inputFwd) + (-s * inputStrafe);
            fy += (s * inputFwd) + (c * inputStrafe);
        }

        if (touchSticks.left.active) {
            fx += touchSticks.left.vecX;
            fy += touchSticks.left.vecY;
        }

        if (fx !== 0 || fy !== 0) {
            const len = Math.sqrt(fx * fx + fy * fy);
            if (len > 1) { fx /= len; fy /= len; }

            let thrust = 1200;
            thrust *= (1 + ((persistence.profile.upgrades.speed || 0) * 0.05));
            if (this.speedBoostTime > 0) thrust *= 1.5;
            this.vx += fx * thrust * dt;
            this.vy += fy * thrust * dt;
            if (Math.random() < 0.5) callbacks.spawnParticle(this.x - Math.cos(this.angle) * 15, this.y - Math.sin(this.angle) * 15, this.skin.colors.trail);
        }

        const friction = Math.pow(0.95, dt * 60);
        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.screenWrap(canvasWidth, canvasHeight);

        // Shooting
        let weaponDelay = this.fireRate;
        const currentWeapon = this.weapons[this.currentWeaponIndex];
        if (currentWeapon === 'HEAVY') weaponDelay = 0.4;
        else if (currentWeapon === 'RAPID') weaponDelay = 0.08;
        else if (currentWeapon === 'SPREAD') weaponDelay = 0.2;

        const rateUpgrade = (persistence.profile.upgrades.fireRate || 0) * 0.05;
        weaponDelay = weaponDelay * (1 - rateUpgrade);
        if (this.speedBoostTime > 0) weaponDelay *= 0.7;

        if ((keys.Space || touchSticks.right.active) && Date.now() - (this.lastShot || 0) > weaponDelay * 1000) {
            this.shoot(callbacks, combo);
        }
    }

    private screenWrap(canvasWidth: number, canvasHeight: number) {
        const buffer = 40;
        if (this.x < -buffer) this.x = canvasWidth + buffer;
        if (this.x > canvasWidth + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = canvasHeight + buffer;
        if (this.y > canvasHeight + buffer) this.y = -buffer;
    }

    private shoot(callbacks: ShipCallbacks, combo: number) {
        const type = this.weapons[this.currentWeaponIndex];
        let dmg = 1 * this.damageMult;
        let isCrit = false;
        if (Math.random() < (persistence.profile.upgrades.crit || 0) * 0.1) { dmg *= 3; isCrit = true; }
        let pierce = 1 + (persistence.profile.upgrades.pierce || 0);
        if (type === 'HEAVY') pierce += 4;
        let size = 2 + (type === 'HEAVY' ? 3 : 0) + ((persistence.profile.upgrades.size || 0) * 1);
        let spdMult = 1 + ((persistence.profile.upgrades.bulletSpd || 0) * 0.2);
        let homing = (persistence.profile.upgrades.homing || 0) > 0;

        const nx = this.x + Math.cos(this.angle) * 25;
        const ny = this.y + Math.sin(this.angle) * 25;
        const pitch = 1 + (combo * 0.05);

        const fireBullet = (a: number) => {
            let b = this.bulletPool.get(nx, ny, a, type, dmg, pierce, size, homing);
            if (isCrit) b.color = '#fff';
            b.speed *= spdMult;
            callbacks.spawnBullet(b);
        };

        if (type === 'SPREAD') { [-0.2, 0, 0.2].forEach(offset => fireBullet(this.angle + offset)); }
        else if (type === 'RAPID') { fireBullet(this.angle + (Math.random() - 0.5) * 0.1); }
        else { fireBullet(this.angle); }

        if ((persistence.profile.upgrades.rear || 0) > 0) {
            let b = this.bulletPool.get(nx, ny, this.angle + Math.PI, type, dmg, pierce, size, homing);
            b.speed *= spdMult;
            callbacks.spawnBullet(b);
        }
        this.lastShot = Date.now();
        if (type === 'HEAVY') audioSystem.playHeavy(pitch); else audioSystem.playShoot(pitch);
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (!this.visible) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Use spriteCache to draw ship
        const img = spriteCache.getShip(this.skin.colors.main, this.skin.design);
        ctx.save();
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -20, -20);
        ctx.restore();

        if (this.shields > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    public switchWeapon(callbacks: ShipCallbacks) {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        callbacks.updateWeaponUI(this.weapons[this.currentWeaponIndex]);
    }

    public hit(callbacks: ShipCallbacks): boolean {
        if (Math.random() < (persistence.profile.upgrades.evasion || 0) * 0.1) {
            callbacks.spawnText(this.x, this.y - 20, "MISS", "#fff");
            return false;
        }
        if (Math.random() < (persistence.profile.upgrades.armor || 0) * 0.1) {
            callbacks.spawnText(this.x, this.y - 20, "BLOCKED", "#aaa");
            return false;
        }
        // Nova logic needs access to asteroids, so we'll handle it in GameEngine or pass a callback
        // For now, assume GameEngine handles the Nova effect if hit returns true and nova upgrade is present?
        // Or better, pass a triggerNova callback.

        if (this.shields > 0) {
            this.shields--;
            audioSystem.playPowerUp();
            callbacks.updateHUD();
            return false;
        }
        return true;
    }
}
