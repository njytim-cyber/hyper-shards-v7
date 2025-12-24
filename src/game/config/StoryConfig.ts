// Story & Lore Configuration
// Intro storyline and boss lore

export interface StoryChapter {
    id: string;
    title: string;
    text: string[];
    image?: string;  // Optional background/scene
}

export const INTRO_STORY: StoryChapter[] = [
    {
        id: 'intro_1',
        title: 'THE YEAR IS 2847',
        text: [
            'The galaxy burns.',
            'The HYPER-SHARD, an energy source of unimaginable power,',
            'has shattered across the Andromeda sector.'
        ]
    },
    {
        id: 'intro_2',
        title: 'THE SWARM AWAKENS',
        text: [
            'Drawn by the shards\' energy signature,',
            'an ancient machine armada has emerged from deep space.',
            'They call themselves... THE COLLECTIVE.'
        ]
    },
    {
        id: 'intro_3',
        title: 'SEVEN COMMANDERS',
        text: [
            'Seven machine lords lead the invasion.',
            'Each guards a fragment of the Hyper-Shard.',
            'To save humanity, all seven must fall.'
        ]
    },
    {
        id: 'intro_4',
        title: 'YOU ARE THE LAST HOPE',
        text: [
            'As Earth\'s final pilot, you must navigate',
            'asteroid fields and destroy the machine fleet.',
            'Collect shards. Upgrade your ship. Save humanity.'
        ]
    }
];

export interface BossLore {
    id: string;
    name: string;
    title: string;
    wave: number;
    description: string;
    origin: string;
    weakness: string;
    quote: string;
}

export const BOSS_LORE: BossLore[] = [
    {
        id: 'sentinel',
        name: 'SENTINEL',
        title: 'The Watcher',
        wave: 3,
        description: 'A reconnaissance unit designed to track and eliminate threats. Fires radial bullet patterns.',
        origin: 'First wave scout of the Collective. Deployed to assess enemy capabilities.',
        weakness: 'Predictable pattern timing allows for dodging between bullet waves.',
        quote: '"THREAT DETECTED. INITIATING ELIMINATION PROTOCOL."'
    },
    {
        id: 'vortex',
        name: 'VORTEX',
        title: 'The Storm',
        wave: 6,
        description: 'A spinning death machine. Creates spiraling bullet hell patterns.',
        origin: 'Atmospheric processor unit repurposed for combat. Generates artificial hurricanes.',
        weakness: 'The spiral has gaps. Stay calm and weave through.',
        quote: '"YOU CANNOT ESCAPE THE STORM."'
    },
    {
        id: 'striker',
        name: 'STRIKER',
        title: 'The Hunter',
        wave: 9,
        description: 'Precision assault unit. Tracks and aims directly at the player.',
        origin: 'Former mining drone. Now hunts organic life with terrifying accuracy.',
        weakness: 'Keep moving. It predicts where you ARE, not where you\'ll BE.',
        quote: '"RUNNING IS FUTILE. I ALWAYS HIT MY TARGET."'
    },
    {
        id: 'barrier',
        name: 'BARRIER',
        title: 'The Wall',
        wave: 12,
        description: 'Defensive fortress unit. Creates wave patterns that block escape routes.',
        origin: 'Originally a shield generator. Now weaponizes its defensive capabilities.',
        weakness: 'The wave patterns oscillate. Time your movements to the rhythm.',
        quote: '"THERE IS NO PATH. THERE IS NO ESCAPE."'
    },
    {
        id: 'nova',
        name: 'NOVA',
        title: 'The Fury',
        wave: 15,
        description: 'Burst damage specialist. Fires rapid consecutive shots then pauses.',
        origin: 'Emergency response unit. Designed to overwhelm threats with rapid fire.',
        weakness: 'The pause after each burst is your attack window.',
        quote: '"FEEL THE WRATH OF A THOUSAND SUNS!"'
    },
    {
        id: 'void',
        name: 'VOID',
        title: 'The Abyss',
        wave: 18,
        description: 'Elite commander unit. Combines multiple attack patterns unpredictably.',
        origin: 'High-ranking officer of the Collective. Commands the final defense.',
        weakness: 'No single pattern. Adapt or die.',
        quote: '"I HAVE ENDED CIVILIZATIONS. YOU ARE NOTHING."'
    },
    {
        id: 'mothership',
        name: 'MOTHERSHIP',
        title: 'The Core',
        wave: 20,
        description: 'The heart of the Collective. Uses ALL attack patterns in rotation.',
        origin: 'The original vessel that carried the machine intelligence across the void.',
        weakness: 'It cycles through patterns. Learn the sequence.',
        quote: '"WE ARE ETERNAL. WE ARE INFINITE. WE ARE... THE END."'
    }
];

export function getBossLore(bossId: string): BossLore | undefined {
    return BOSS_LORE.find(b => b.id === bossId);
}

export function getBossLoreByWave(wave: number): BossLore | undefined {
    return BOSS_LORE.find(b => b.wave === wave);
}
