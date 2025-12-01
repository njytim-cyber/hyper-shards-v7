import { spriteCache } from '../systems/SpriteCache';

export const drawIcon = (canvas: HTMLCanvasElement, type: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Center coordinate system
    ctx.translate(w / 2, h / 2);

    // Scale up slightly for better visibility in the 40x40 canvas
    // Legacy was drawing on 40x40 but some paths are small
    ctx.scale(1.2, 1.2);

    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0,255,255,0.2)';

    // Legacy switch statement ported
    switch (type) {
        case 'damage': ctx.strokeStyle = '#f00'; ctx.fillStyle = '#300'; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(4, 0); ctx.lineTo(2, 0); ctx.lineTo(2, 10); ctx.lineTo(-2, 10); ctx.lineTo(-2, 0); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke(); break;
        case 'fireRate': ctx.strokeStyle = '#ff0'; ctx.fillStyle = '#aa0'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.rect(i * 6 - 2, -6, 4, 12); ctx.fill(); ctx.stroke(); } break;
        case 'bulletSpd': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-15, -4); ctx.moveTo(-8, 4); ctx.lineTo(-15, 4); ctx.stroke(); break;
        case 'pierce': ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(5, -5); ctx.moveTo(10, 0); ctx.lineTo(5, 5); ctx.stroke(); break;
        case 'blast': ctx.strokeStyle = '#f60'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * (Math.PI * 2 / 8); ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10); ctx.lineTo(Math.cos(a + 0.4) * 4, Math.sin(a + 0.4) * 4); } ctx.closePath(); ctx.stroke(); break;
        case 'crit': ctx.strokeStyle = '#f0f'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke(); break;
        case 'hull': ctx.strokeStyle = '#0f0'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(6, -2); ctx.lineTo(6, 4); ctx.lineTo(0, 8); ctx.lineTo(-6, 4); ctx.lineTo(-6, -2); ctx.closePath(); ctx.stroke(); break;
        case 'speed': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(0, -8); ctx.lineTo(5, 5); ctx.stroke(); break;
        case 'magnet': ctx.strokeStyle = '#f0f'; ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, 0); ctx.stroke(); break;
        case 'shieldDur': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke(); break;
        case 'knock': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.arc(-2, 0, 6, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(12, 0); ctx.stroke(); break;
        case 'size': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.rect(-6, -6, 12, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -10); ctx.arc(0, -12, 2, 0, Math.PI * 2); ctx.stroke(); break;
        case 'homing': ctx.strokeStyle = '#f0f'; ctx.beginPath(); ctx.arc(0, 5, 8, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -5); ctx.stroke(); break;
        case 'rear': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-5, -5); ctx.lineTo(5, -5); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, 15); ctx.stroke(); break;
        case 'luck': ctx.strokeStyle = '#ff0'; ctx.beginPath(); ctx.rect(-5, -5, 10, 10); ctx.stroke(); ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('?', 0, 1); break;
        case 'score': ctx.strokeStyle = '#ff0'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('$$', 0, 1); break;
        case 'greed': ctx.strokeStyle = '#ff0'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('$', 0, 1); break;
        case 'combo': ctx.strokeStyle = '#f0f'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('x2', 0, 1); break;
        case 'start': ctx.strokeStyle = '#0ff'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('>>', 0, 1); break;
        case 'discount': ctx.strokeStyle = '#0f0'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('%', 0, 1); break;
        case 'interest': ctx.strokeStyle = '#0f0'; ctx.beginPath(); ctx.moveTo(-8, 5); ctx.lineTo(8, -5); ctx.stroke(); break;
        case 'time': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(0, 0); ctx.lineTo(0, -5); ctx.moveTo(0, 0); ctx.lineTo(3, 3); ctx.stroke(); break;
        case 'dashCool': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 1.5); ctx.stroke(); ctx.lineTo(0, 0); break;
        case 'dashDist': ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(4, -4); ctx.moveTo(8, 0); ctx.lineTo(4, 4); ctx.stroke(); break;
        case 'regen': ctx.strokeStyle = '#0f0'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('+', 0, 1); break;
        case 'revive': ctx.strokeStyle = '#ff0'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('1UP', 0, 1); break;
        case 'armor': ctx.strokeStyle = '#888'; ctx.beginPath(); ctx.rect(-6, -8, 12, 16); ctx.stroke(); break;
        case 'evasion': ctx.strokeStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText('MISS', 0, 1); break;
        case 'thorns': ctx.strokeStyle = '#f00'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.closePath(); ctx.stroke(); break;
        case 'nova': ctx.strokeStyle = '#f00'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]); break;
        default: ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
    }
};

export const drawShipPreview = (canvas: HTMLCanvasElement, color: string, design: string, isSecret: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.scale(0.7, 0.7);
    ctx.rotate(-Math.PI / 2);

    if (isSecret) {
        ctx.rotate(Math.PI / 2); // Rotate back for text
        ctx.fillStyle = '#333';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
    } else {
        const img = spriteCache.getShip(color, design);
        ctx.drawImage(img, -20, -20);
    }
};
