
export interface UpgradeItem {
    cat: string;
    name: string;
    desc: string;
    max: number;
    costBase: number;
    costMult: number;
}

export interface SkinItem {
    name: string;
    realName?: string;
    cost: number;
    colors: { main: string; eng: string; trail: string };
    design: string;
    unlockReq?: { type: 'score' | 'wave', val: number, hint: string };
}

export const UPGRADE_CONFIG: Record<string, UpgradeItem> = {
    damage: { cat: 'OFFENSE', name: 'Overcharge', desc: '+10% Damage', max: 5, costBase: 80, costMult: 1.5 },
    fireRate: { cat: 'OFFENSE', name: 'Trigger Happy', desc: '+5% Fire Rate', max: 5, costBase: 60, costMult: 1.5 },
    bulletSpd: { cat: 'OFFENSE', name: 'Accelerator', desc: '+Bullet Speed', max: 3, costBase: 40, costMult: 1.4 },
    pierce: { cat: 'OFFENSE', name: 'Drill Rounds', desc: 'Pierce +1 Target', max: 2, costBase: 150, costMult: 2.5 },
    blast: { cat: 'OFFENSE', name: 'Warheads', desc: 'Explosive Rounds', max: 3, costBase: 100, costMult: 1.5 },
    crit: { cat: 'OFFENSE', name: 'Targeting', desc: '+Crit Chance', max: 3, costBase: 120, costMult: 1.6 },
    knock: { cat: 'OFFENSE', name: 'Impact', desc: '+Knockback', max: 3, costBase: 50, costMult: 1.4 },
    size: { cat: 'OFFENSE', name: 'Heavy Caliber', desc: '+Bullet Size', max: 3, costBase: 80, costMult: 1.4 },
    homing: { cat: 'OFFENSE', name: 'Seeker Chip', desc: 'Homing Shots', max: 1, costBase: 500, costMult: 1 },
    rear: { cat: 'OFFENSE', name: 'Rear Gun', desc: 'Shoot Behind', max: 1, costBase: 400, costMult: 1 },
    hull: { cat: 'DEFENSE', name: 'Hull Plating', desc: '+1 Max Life', max: 3, costBase: 50, costMult: 2.0 },
    shieldDur: { cat: 'DEFENSE', name: 'Field Gen', desc: '+Invincibility', max: 3, costBase: 60, costMult: 1.5 },
    dashCool: { cat: 'DEFENSE', name: 'Coolant', desc: '-10% Dash Cooldown', max: 3, costBase: 70, costMult: 1.6 },
    dashDist: { cat: 'DEFENSE', name: 'Afterburner', desc: '+Dash Distance', max: 3, costBase: 60, costMult: 1.4 },
    regen: { cat: 'DEFENSE', name: 'Nanobots', desc: 'Heal over Time', max: 1, costBase: 500, costMult: 1 },
    revive: { cat: 'DEFENSE', name: 'Backup OS', desc: 'Extra Life (1/game)', max: 1, costBase: 1000, costMult: 1 },
    armor: { cat: 'DEFENSE', name: 'Plating', desc: 'Chance to Block', max: 3, costBase: 150, costMult: 1.5 },
    evasion: { cat: 'DEFENSE', name: 'Phase Shift', desc: 'Dodge Chance', max: 3, costBase: 200, costMult: 1.5 },
    thorns: { cat: 'DEFENSE', name: 'Spiked Hull', desc: 'Ramming Damage', max: 3, costBase: 100, costMult: 1.4 },
    nova: { cat: 'DEFENSE', name: 'Panic Nova', desc: 'Blast when Hit', max: 1, costBase: 300, costMult: 1 },
    speed: { cat: 'UTILITY', name: 'Thrusters', desc: '+5% Move Speed', max: 5, costBase: 40, costMult: 1.4 },
    magnet: { cat: 'UTILITY', name: 'Attractor', desc: 'Magnet Range', max: 3, costBase: 30, costMult: 1.5 },
    luck: { cat: 'UTILITY', name: 'Scavenger', desc: '+Drop Rate', max: 3, costBase: 90, costMult: 1.8 },
    score: { cat: 'UTILITY', name: 'Data Mining', desc: '+10% Score', max: 5, costBase: 20, costMult: 1.3 },
    greed: { cat: 'UTILITY', name: 'Midas', desc: '+Shard Value', max: 3, costBase: 200, costMult: 1.5 },
    combo: { cat: 'UTILITY', name: 'Flow State', desc: '+Max Combo', max: 5, costBase: 100, costMult: 1.2 },
    start: { cat: 'UTILITY', name: 'Warp Drive', desc: 'Start at Wave 4', max: 1, costBase: 250, costMult: 1 },
    discount: { cat: 'UTILITY', name: 'Haggler', desc: 'Shop Discount', max: 3, costBase: 300, costMult: 2.0 },
    interest: { cat: 'UTILITY', name: 'Investment', desc: 'Passive Shards', max: 3, costBase: 400, costMult: 1.5 },
    time: { cat: 'UTILITY', name: 'Chronos', desc: 'Slower Enemies', max: 3, costBase: 250, costMult: 1.5 }
};

export const SKIN_CONFIG: Record<string, SkinItem> = {
    default: { name: 'Prototype', design: 'fighter', colors: { main: '#0ff', eng: '#0ff', trail: '#0ff' }, cost: 0 },
    ruby: { name: 'Ruby Ace', design: 'fighter', colors: { main: '#f05', eng: '#f00', trail: '#f05' }, cost: 150 },
    gold: { name: 'Gold Hawk', design: 'fighter', colors: { main: '#fd0', eng: '#fa0', trail: '#ff0' }, cost: 300 },
    shadow: { name: 'Stealth', design: 'stealth', colors: { main: '#888', eng: '#fff', trail: '#aaa' }, cost: 500 },
    toxic: { name: 'Viper', design: 'interceptor', colors: { main: '#0f0', eng: '#bf0', trail: '#0f0' }, cost: 200 },
    plasma: { name: 'Plasma', design: 'interceptor', colors: { main: '#b0f', eng: '#f0f', trail: '#b0f' }, cost: 400 },
    sentinel: { name: 'Sentinel', design: 'tank', colors: { main: '#f60', eng: '#f00', trail: '#f80' }, cost: 600 },
    intercep: { name: 'Interceptor', design: 'interceptor', colors: { main: '#fff', eng: '#0ff', trail: '#fff' }, cost: 800 },
    void: { name: '???', realName: 'Void Walker', design: 'stealth', colors: { main: '#222', eng: '#505', trail: '#000' }, cost: 0, unlockReq: { type: 'score', val: 25000, hint: 'SCORE 25K' } },
    glitch: { name: '???', realName: 'Glitch', design: 'stealth', colors: { main: '#f0f', eng: '#0f0', trail: '#f0f' }, cost: 0, unlockReq: { type: 'wave', val: 10, hint: 'REACH WAVE 10' } }
};
