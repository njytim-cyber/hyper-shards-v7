export class SpriteCache {
    private cache: Record<string, HTMLCanvasElement> = {};
    private asteroids: Record<string, Record<string, HTMLCanvasElement[]>> = {};
    private bullets: Record<string, HTMLCanvasElement> = {};

    public init() {
        const levelColors = ['#f0f', '#0f0', '#fa0', '#0ff', '#f00'];
        levelColors.forEach(color => {
            this.asteroids[color] = { large: [], medium: [], small: [] };
            ['large', 'medium', 'small'].forEach(size => {
                for (let i = 0; i < 5; i++) {
                    const cvs = document.createElement('canvas');
                    const r = size === 'large' ? 50 : (size === 'medium' ? 25 : 12);
                    cvs.width = r * 2 + 10; cvs.height = r * 2 + 10;
                    const ctx = cvs.getContext('2d')!;
                    ctx.translate(r + 5, r + 5);
                    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.shadowColor = color; ctx.shadowBlur = 10;
                    ctx.beginPath(); const c = 8;
                    for (let j = 0; j < c; j++) {
                        const a = (j / c) * Math.PI * 2;
                        const rad = r * (0.8 + Math.random() * 0.4);
                        if (j === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
                        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
                    }
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                    this.asteroids[color][size].push(cvs);
                }
            });
        });

        // Pre-render bullets
        ['BLASTER', 'SPREAD', 'RAPID', 'HEAVY', 'BOSS'].forEach(type => {
            const cvs = document.createElement('canvas');
            const size = type === 'HEAVY' ? 5 : (type === 'BOSS' ? 4 : 2);
            let color = type === 'BLASTER' ? '#ff0' : (type === 'SPREAD' ? '#0f0' : (type === 'RAPID' ? '#f0f' : '#f00'));
            if (type === 'BOSS') color = '#f30';
            const shadow = type === 'BOSS' ? '#f00' : color;
            const pad = 10;
            cvs.width = size * 2 + pad * 2; cvs.height = size * 2 + pad * 2;
            const ctx = cvs.getContext('2d')!;
            ctx.translate(size + pad, size + pad);
            ctx.shadowBlur = type === 'BOSS' ? 8 : 5; ctx.shadowColor = shadow;
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
            this.bullets[type] = cvs;
        });
    }

    public getShip(color: string, design: string = 'fighter'): HTMLCanvasElement {
        const key = `ship_${color}_${design}`;
        if (!this.cache[key]) {
            const cvs = document.createElement('canvas'); cvs.width = 40; cvs.height = 40; const ctx = cvs.getContext('2d')!;
            ctx.translate(20, 20); ctx.rotate(-Math.PI / 2);
            ctx.strokeStyle = color; ctx.fillStyle = 'rgba(0, 20, 20, 0.8)'; ctx.lineWidth = 3;
            ctx.shadowColor = color; ctx.shadowBlur = 10;

            ctx.beginPath();
            if (design === 'interceptor') {
                ctx.moveTo(20, 0); ctx.lineTo(-10, 15); ctx.lineTo(-5, 5); ctx.lineTo(-15, 5); ctx.lineTo(-15, -5); ctx.lineTo(-5, -5); ctx.lineTo(-10, -15);
            } else if (design === 'tank') {
                ctx.moveTo(15, 0); ctx.lineTo(5, 15); ctx.lineTo(-15, 10); ctx.lineTo(-10, 0); ctx.lineTo(-15, -10); ctx.lineTo(5, -15);
            } else if (design === 'stealth') {
                ctx.moveTo(20, 0); ctx.lineTo(-5, 10); ctx.lineTo(-20, 15); ctx.lineTo(-10, 0); ctx.lineTo(-20, -15); ctx.lineTo(-5, -10);
            } else {
                ctx.moveTo(20, 0); ctx.lineTo(-15, 15); ctx.lineTo(-5, 0); ctx.lineTo(-15, -15);
            }
            ctx.closePath(); ctx.stroke(); ctx.fill();

            ctx.fillStyle = '#fff'; ctx.beginPath();
            if (design === 'tank') { ctx.rect(-5, -3, 10, 6); }
            else if (design === 'stealth') { ctx.moveTo(5, 0); ctx.lineTo(-5, 3); ctx.lineTo(-5, -3); }
            else { ctx.moveTo(5, 0); ctx.lineTo(-8, 6); ctx.lineTo(-4, 0); ctx.lineTo(-8, -6); }
            ctx.closePath(); ctx.fill();

            this.cache[key] = cvs;
        }
        return this.cache[key];
    }

    public getBoss(): HTMLCanvasElement {
        // Legacy method - returns default hexagon boss
        return this.getBossSprite('hexagon', '#f00', 55);
    }

    public getBossSprite(type: string, color: string, size: number): HTMLCanvasElement {
        const key = `boss_${type}_${color}_${size}`;
        if (!this.cache[key]) {
            const padding = 20;
            const cvs = document.createElement('canvas');
            cvs.width = size * 2 + padding * 2;
            cvs.height = size * 2 + padding * 2;
            const ctx = cvs.getContext('2d')!;
            ctx.translate(size + padding, size + padding);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;

            ctx.beginPath();
            switch (type) {
                case 'hexagon':
                    for (let i = 0; i < 6; i++) {
                        const a = i * (Math.PI * 2 / 6);
                        if (i === 0) ctx.moveTo(Math.cos(a) * size, Math.sin(a) * size);
                        else ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                    }
                    break;
                case 'diamond':
                    ctx.moveTo(0, -size);
                    ctx.lineTo(size, 0);
                    ctx.lineTo(0, size);
                    ctx.lineTo(-size, 0);
                    break;
                case 'triangle':
                    ctx.moveTo(0, -size);
                    ctx.lineTo(size * 0.87, size * 0.5);
                    ctx.lineTo(-size * 0.87, size * 0.5);
                    break;
                case 'cross': {
                    const arm = size * 0.3;
                    ctx.moveTo(-arm, -size);
                    ctx.lineTo(arm, -size);
                    ctx.lineTo(arm, -arm);
                    ctx.lineTo(size, -arm);
                    ctx.lineTo(size, arm);
                    ctx.lineTo(arm, arm);
                    ctx.lineTo(arm, size);
                    ctx.lineTo(-arm, size);
                    ctx.lineTo(-arm, arm);
                    ctx.lineTo(-size, arm);
                    ctx.lineTo(-size, -arm);
                    ctx.lineTo(-arm, -arm);
                    break;
                }
                case 'star':
                    for (let i = 0; i < 10; i++) {
                        const a = (i * Math.PI * 2 / 10) - Math.PI / 2;
                        const r = i % 2 === 0 ? size : size * 0.5;
                        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                    }
                    break;
                case 'ring':
                    // Outer ring
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Inner ring
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
                    break;
                case 'mothership':
                    // Large octagon with inner details
                    for (let i = 0; i < 8; i++) {
                        const a = i * (Math.PI * 2 / 8);
                        if (i === 0) ctx.moveTo(Math.cos(a) * size, Math.sin(a) * size);
                        else ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    // Inner core
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
                    ctx.strokeStyle = '#ff0';
                    ctx.stroke();
                    // Spokes
                    ctx.strokeStyle = color;
                    for (let i = 0; i < 8; i++) {
                        const a = i * (Math.PI * 2 / 8);
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(a) * size * 0.4, Math.sin(a) * size * 0.4);
                        ctx.lineTo(Math.cos(a) * size * 0.85, Math.sin(a) * size * 0.85);
                        ctx.stroke();
                    }
                    this.cache[key] = cvs;
                    return this.cache[key];
                default:
                    // Fallback to hexagon
                    for (let i = 0; i < 6; i++) {
                        const a = i * (Math.PI * 2 / 6);
                        if (i === 0) ctx.moveTo(Math.cos(a) * size, Math.sin(a) * size);
                        else ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                    }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            this.cache[key] = cvs;
        }
        return this.cache[key];
    }

    public getDreadnought(): HTMLCanvasElement {
        if (!this.cache['dreadnought']) {
            const cvs = document.createElement('canvas'); cvs.width = 200; cvs.height = 200; const ctx = cvs.getContext('2d')!;
            ctx.translate(100, 100); ctx.strokeStyle = '#f30'; ctx.lineWidth = 6; ctx.fillStyle = '#100'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * (Math.PI * 2 / 8); ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 90); } ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#f80'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke();
            this.cache['dreadnought'] = cvs;
        }
        return this.cache['dreadnought'];
    }

    public getAsteroid(size: string, color: string): HTMLCanvasElement {
        const colGroup = this.asteroids[color];
        if (!colGroup) return this.asteroids['#f0f'][size][0];
        const arr = colGroup[size];
        return arr[Math.floor(Math.random() * arr.length)];
    }

    public getBullet(type: string): HTMLCanvasElement {
        return this.bullets[type] || this.bullets['BLASTER'];
    }
    public getPowerUp(type: string): HTMLCanvasElement {
        if (!this.cache[`pu_${type}`]) {
            const cvs = document.createElement('canvas'); cvs.width = 30; cvs.height = 30; const ctx = cvs.getContext('2d')!;
            ctx.translate(15, 15);
            if (type === 'SHIELD') {
                ctx.fillStyle = '#0ff'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', 0, 1);
            } else if (type === 'NUKE') {
                ctx.fillStyle = '#f00'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', 0, 1);
            } else if (type === 'SPEED') {
                ctx.fillStyle = '#ff0'; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚡', 0, 1);
            }
            this.cache[`pu_${type}`] = cvs;
        }
        return this.cache[`pu_${type}`];
    }

    public getUFO(): HTMLCanvasElement {
        if (!this.cache['ufo']) {
            const cvs = document.createElement('canvas'); cvs.width = 40; cvs.height = 40; const ctx = cvs.getContext('2d')!;
            ctx.translate(20, 20);
            ctx.fillStyle = '#f60'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, -3, 8, Math.PI, 0); ctx.fillStyle = 'rgba(0,255,255,0.5)'; ctx.fill(); ctx.stroke();
            this.cache['ufo'] = cvs;
        }
        return this.cache['ufo'];
    }
}

export const spriteCache = new SpriteCache();
