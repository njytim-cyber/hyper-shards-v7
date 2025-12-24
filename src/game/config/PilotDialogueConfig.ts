// Pilot Dialogue System - Personality profiles and in-game lines for each pilot
// Each pilot has a distinct personality that shows through their dialogue

import type { PilotId } from './PilotConfig';

// Dialogue categories for different game events
export interface PilotDialogue {
    // Game start/wave transitions
    gameStart: string[];
    waveStart: string[];
    bossAlert: string[];

    // Combat feedback
    killStreak: string[];  // When player gets 5+ kill combo
    takingDamage: string[];
    lowHealth: string[];

    // Power-ups and upgrades
    gotPowerUp: string[];
    weaponSwitch: string[];

    // Victory/Defeat
    victory: string[];
    defeat: string[];

    // Assist-specific (when this pilot assists the player)
    assistEntry: string[];
    assistActive: string[];
    assistExit: string[];
}

// ===============================================
// PILOT PERSONALITIES & DIALOGUE
// ===============================================

export const PILOT_DIALOGUES: Record<PilotId, PilotDialogue> = {
    striker: {
        // Commander Rex - Aggressive military professional, confident but not arrogant
        gameStart: [
            "Weapons hot. Let's make 'em regret waking up today.",
            "All systems green. Time to show these rocks who's boss.",
            "Lock and load, pilot. The hunt begins."
        ],
        waveStart: [
            "Fresh targets incoming. Beautiful.",
            "More hostiles? Good. I was getting bored.",
            "Stay aggressive. Don't let them breathe."
        ],
        bossAlert: [
            "Big one on radar. Finally, a real challenge!",
            "Boss-class threat detected. This is what we trained for.",
            "Target acquired. Light it up!"
        ],
        killStreak: [
            "That's the spirit! Keep 'em coming!",
            "Unstoppable! This is textbook domination.",
            "They can't touch us at this rate!"
        ],
        takingDamage: [
            "Just a scratch. Stay focused!",
            "Hull breach! Return fire!",
            "They got lucky. Make 'em pay."
        ],
        lowHealth: [
            "Critical damage! Get it together, pilot!",
            "We're not dying here. Push through!",
            "Warning lights don't scare me. Keep fighting!"
        ],
        gotPowerUp: [
            "Excellent! More firepower.",
            "That'll do nicely.",
            "Locked and loaded!"
        ],
        weaponSwitch: [
            "Switching loadout.",
            "New weapon online.",
            "Time for something heavier."
        ],
        victory: [
            "Mission accomplished. Outstanding work, pilot!",
            "That's how it's done. Flawless execution.",
            "Hostiles neutralized. Command will be pleased."
        ],
        defeat: [
            "We gave 'em hell... Prepare for round two.",
            "Fall back and regroup. We're not done yet.",
            "This isn't over. Not by a long shot."
        ],
        assistEntry: [
            "Rex here! Cavalry's arrived!",
            "Commander Rex on station. Let's break some rocks!",
            "Need backup? Say no more!"
        ],
        assistActive: [
            "Covering your six!",
            "I'll handle the stragglers!",
            "Focus on the big one, I've got these!"
        ],
        assistExit: [
            "That's my cue. You've got this, pilot!",
            "Duty calls elsewhere. Give 'em hell!",
            "Rex out. Make me proud!"
        ]
    },

    phantom: {
        // Agent Nova - Mysterious, playful, speaks in riddles sometimes
        gameStart: [
            "Now you see me... now they don't. 😏",
            "The shadows whisper of incoming targets...",
            "Ready when you are, partner. Let's dance."
        ],
        waveStart: [
            "More flies for the web...",
            "They have no idea what's coming. I love it.",
            "Swift and silent. That's our way."
        ],
        bossAlert: [
            "Ooh, a big one. Didn't bring enough friends.",
            "I sense something... powerful. Interesting.",
            "Large signature detected. Let's see what it's made of."
        ],
        killStreak: [
            "Like ghosts, we strike unseen!",
            "They're panicking. Music to my ears.",
            "Too fast! Too slippery! Too good!"
        ],
        takingDamage: [
            "Ouch! Someone got lucky...",
            "They tagged us? Impressive... and annoying.",
            "A scratch. Nothing more."
        ],
        lowHealth: [
            "Time to get serious, partner...",
            "The shadows are calling... Not yet!",
            "Running on fumes. Make every shot count."
        ],
        gotPowerUp: [
            "Ooh, shiny! Don't mind if I do.",
            "A gift from the void itself.",
            "This will come in handy..."
        ],
        weaponSwitch: [
            "Variety is the spice of destruction.",
            "Let's try something different...",
            "New toy, new tricks."
        ],
        victory: [
            "And like smoke... we vanish. GG!",
            "Never saw us coming, never saw us leave. ✨",
            "Another mystery added to the legend."
        ],
        defeat: [
            "We'll haunt them next time...",
            "Fading into the shadows... for now.",
            "This phantom doesn't stay down for long."
        ],
        assistEntry: [
            "Miss me? 😉 Nova's here to play!",
            "The shadows brought a friend!",
            "Surprise! Didn't expect me, did you?"
        ],
        assistActive: [
            "Watch this! Catch me if you can!",
            "Here, there, everywhere!",
            "Bet you didn't see THAT coming!"
        ],
        assistExit: [
            "Poof! Back to the shadows. You've got this!",
            "My work here is done~ ✨",
            "Disappearing act! Good luck, partner!"
        ]
    },

    sentinel: {
        // Captain Ironwall - Stoic protector, speaks with authority, reassuring
        gameStart: [
            "Shields up. Nothing gets through.",
            "Ready to hold the line, pilot. Together.",
            "All defensive systems nominal. Let them come."
        ],
        waveStart: [
            "Brace for impact. We can take it.",
            "More incoming. We've weathered worse.",
            "Stand firm. They will break against us."
        ],
        bossAlert: [
            "Large contact. Prepare for sustained fire.",
            "Heavy incoming. Shield generators at maximum.",
            "This will test us. We will not falter."
        ],
        killStreak: [
            "Excellent precision. The best offense is... well, offense.",
            "Cleared. Maintain this momentum.",
            "Efficiency rating: Outstanding."
        ],
        takingDamage: [
            "Damage absorbed. Systems holding.",
            "Hull integrity acceptable. Continue.",
            "Nothing we can't handle."
        ],
        lowHealth: [
            "Critical systems. Prioritize survival.",
            "Damage severe. Stay defensive, pilot.",
            "We're not invincible. Careful now."
        ],
        gotPowerUp: [
            "Asset secured. Good.",
            "Every advantage helps.",
            "Reinforcements received."
        ],
        weaponSwitch: [
            "Adjusting armament.",
            "Tactical reconfiguration.",
            "Weapon systems realigned."
        ],
        victory: [
            "The line has held. Outstanding work.",
            "Threat neutralized. All systems stable.",
            "We protected what matters. Well done."
        ],
        defeat: [
            "Falling back. We'll be stronger next time.",
            "A tactical retreat. Not a defeat.",
            "Learn from this. Return stronger."
        ],
        assistEntry: [
            "Ironwall on station. You're covered, pilot!",
            "Shields online. Let me take the heat!",
            "Reinforcements arriving. Nobody dies today!"
        ],
        assistActive: [
            "Drawing their fire! Focus on offense!",
            "I'll tank this. You clean up!",
            "They can't break through me!"
        ],
        assistExit: [
            "Shields are yours now. Stay strong!",
            "Ironwall out. You've proven yourself.",
            "The wall stands with you. Always."
        ]
    },

    technomancer: {
        // Dr. Circuit - Nerdy, excitable about tech, speaks fast, loves gadgets
        gameStart: [
            "Ohmygosh systems are GO! This is so exciting!",
            "Running diagnostics... Perfect! Let's science this!",
            "All my babies are online! The gadgets, I mean. Let's zap!"
        ],
        waveStart: [
            "More test subjects—I mean, targets!",
            "Fascinating! Their formations are so predictable.",
            "Time for some field testing! For science!"
        ],
        bossAlert: [
            "WHOA! Look at the readings on that thing!",
            "Mega-signature detected! I need samples!",
            "Big boss time! Deploying ALL the toys!"
        ],
        killStreak: [
            "The math checks out! We're crushing it!",
            "Efficiency algorithms working PERFECTLY!",
            "This is what peak performance looks like!"
        ],
        takingDamage: [
            "Ow! My beautiful ship! Recalibrating!",
            "That wasn't in my calculations!",
            "Minor setback! Adjusting parameters!"
        ],
        lowHealth: [
            "WARNING! WARNING! This is NOT optimal!",
            "Systems critical! Need more... more everything!",
            "Okay okay OKAY! Emergency protocols!"
        ],
        gotPowerUp: [
            "Ooh! New component! *happy noises*",
            "YES! More power to the grid!",
            "Integration complete! SO cool!"
        ],
        weaponSwitch: [
            "Let's try THIS configuration!",
            "Swapping to experimental mode!",
            "Different weapon, different FUN!"
        ],
        victory: [
            "Hypothesis confirmed: We're AMAZING!",
            "Data collected! Victory achieved! Best day!",
            "The experiment was a MASSIVE success!"
        ],
        defeat: [
            "Error 404: Victory not found... YET!",
            "Recalculating... Back to the drawing board!",
            "Just a failed experiment. I learn from those!"
        ],
        assistEntry: [
            "DR. CIRCUIT IN THE HOUSE! I brought gadgets!",
            "Ooh ooh! Let me help! I've got JUST the thing!",
            "Technical assistance incoming! So excited!"
        ],
        assistActive: [
            "Deploying countermeasures! Watch this!",
            "My drones say hi! PEW PEW!",
            "Running optimization subroutines! We're SO efficient!"
        ],
        assistExit: [
            "Back to the lab! Call me anytime!",
            "Gotta go! More inventions await! Good luck!",
            "Circuit out! *finger guns* Zap zap!"
        ]
    },

    berserker: {
        // Havoc - Thrill-seeker, loves chaos, speaks with wild energy
        gameStart: [
            "LET'S GOOOO! CHAOS TIME!",
            "HAHAHA! They have NO idea what's coming!",
            "Wake up and WRECK everything! Yeah!"
        ],
        waveStart: [
            "MORE?! AWESOME! BRING IT!",
            "Fresh victims! I mean targets! Whatever!",
            "Come on come on COME ON!"
        ],
        bossAlert: [
            "BIG ONE! FINALLY! SOMETHING WORTHY!",
            "YEEEAH! That's what I'm talking about!",
            "Boss fight! BOSS FIGHT! BOSS FIGHT!"
        ],
        killStreak: [
            "CAN'T STOP WON'T STOP! WOOOO!",
            "RAMPAGE MODE ACTIVATED! HAHAHAHA!",
            "THEY'RE GOING DOWN LIKE DOMINOES!"
        ],
        takingDamage: [
            "OUCH! That just makes me ANGRIER!",
            "You hit ME?! BIG MISTAKE!",
            "PAIN IS JUST FUEL! MORE POWER!"
        ],
        lowHealth: [
            "DANGER ZONE! EVEN MORE FUN!",
            "Almost dead? MOST ALIVE I'VE EVER FELT!",
            "Critical damage? CRITICAL DAMAGE TO THEM!"
        ],
        gotPowerUp: [
            "YOINK! MINE NOW!",
            "POWER UP! POWER UP! YEAH!",
            "GIMME THAT! MORE BOOM!"
        ],
        weaponSwitch: [
            "TIME FOR DIFFERENT EXPLOSIONS!",
            "BORED! NEW GUN! LET'S GO!",
            "SWITCH IT UP! CHAOS REQUIRES VARIETY!"
        ],
        victory: [
            "HAHAHAHA! ABSOLUTE DESTRUCTION! BEAUTIFUL!",
            "WE DID IT! EXPLOSIONS! VICTORY!",
            "BEST. BATTLE. EVER! Again! Again!"
        ],
        defeat: [
            "Okay that was fun BUT I WANT A REMATCH!",
            "Down but NOT out! LET'S GO AGAIN!",
            "They got me... THIS TIME! Next time: KABOOM!"
        ],
        assistEntry: [
            "HAVOC IS HERE! LET'S BREAK STUFF!",
            "DID SOMEONE SAY EXPLOSIONS?! I'M IN!",
            "BACKUP ARRIVES! And by backup I mean MAYHEM!"
        ],
        assistActive: [
            "SHOOT EVERYTHING! AHAHAHAHA!",
            "BOOM BOOM BOOM! THAT'S WHAT I DO!",
            "COVER? WHAT'S COVER? JUST SHOOT!"
        ],
        assistExit: [
            "Gotta bounce! MORE CHAOS ELSEWHERE!",
            "PEACE! Actually no, WAR! BYE!",
            "You got this! DESTROY THEM ALL!"
        ]
    }
};

// Get a random dialogue line for a specific pilot and event
export function getDialogue(pilotId: PilotId, event: keyof PilotDialogue): string {
    const dialogues = PILOT_DIALOGUES[pilotId]?.[event];
    if (!dialogues || dialogues.length === 0) {
        return "..."; // Fallback
    }
    return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// Get a random assist pilot (different from the current player's pilot)
export function getRandomAssistPilot(excludePilotId: PilotId): PilotId {
    const pilotIds: PilotId[] = ['striker', 'phantom', 'sentinel', 'technomancer', 'berserker'];
    const availablePilots = pilotIds.filter(id => id !== excludePilotId);
    return availablePilots[Math.floor(Math.random() * availablePilots.length)];
}
