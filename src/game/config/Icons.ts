export const ICONS = {
    Currency: {
        Shard: 'shard',
        Gem: 'gem',
        Credit: 'credit',
    },
    Menu: {
        Shop: 'shop',
        Awards: 'trophy',
        Settings: 'settings',
        Play: 'play',
        Back: 'arrow-left',
        Close: 'close',
        Stats: 'chart', // need chart icon, reuse map or stats
        Inventory: 'inventory', // need inventory
        Pilots: 'pilot',
        Quit: 'door', // need door or quit
        Calendar: 'calendar',
    },
    Game: {
        Life: 'heart',
        Shield: 'shield-hud',
        Damage: 'blaster', // reuse blaster
        Kill: 'skull',
        Time: 'timer',
        Level: 'map',
        Boss: 'skull', // reuse skull
        Warning: 'close', // use close for warning? or exclamation
        Asteroid: 'heavy', // reuse heavy
        Fire: 'rapid', // reuse rapid
        Wave: 'spread', // reuse spread
        Controller: 'joystick-move',
        Sparkle: 'star',
        Lightning: 'dash',
        Powerup: 'star',
        Rocket: 'rocket',
        Crown: 'trophy',
        Star: 'star',
        Sword: 'swords',
        Target: 'joystick-aim',
    },
    Actions: {
        Buy: 'shop',
        Equip: 'check',
        Locked: 'lock',
        Unlocked: 'unlock',
        Restart: 'refresh', // need refresh
        Claim: 'check',
        Copy: 'copy',
    },
    Status: {
        Success: 'check',
        Info: 'star',
        Error: 'close',
        Party: 'gem',
    }
} as const;
