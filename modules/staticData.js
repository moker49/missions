import { perkData } from './perkData.js';
export const staticData = [
    {
        difficulty: 1,
        name: 'Difficulty 1',
        perks: [
            { id: 'perk-a1', label: 'Momentum Lvl 1', icons: [perkData.momentumLvl1.icon], perkPoints: 0, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk-a2', label: 'HP +1', icons: [perkData.hp.icon], perkPoints: 1, effects: [{ statType: 'hp', amount: 1 }] },
            { id: 'perk-a3', label: 'Grant Focus Fire', icons: perkData.perk_a3, perkPoints: 3, effects: [{ token: 'focusFire', amount: 1 }] },
            { id: 'perk-a4', label: 'Momentum +1', icons: [perkData.momentum].icon, perkPoints: 2, effects: [{ statType: 'momentum', amount: 1 }] },
            { id: 'perk-a5', label: 'Re-roll enemy die', icons: perkData.perk_a5, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission-a1', name: 'ock knocks knox', bossName: 'doctor octopus' },
            { id: 'mission-a2', name: 'morlock massacre', bossName: 'mister sinister' },
        ]
    },
    {
        difficulty: 2,
        name: 'Difficulty 2',
        perks: [
            { id: 'perk-b1', label: 'Momentum Lvl 2', icons: [perkData.momentumLvl2.icon], perkPoints: 3, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk-b2', label: 'HP +2', icons: [perkData.hp.icon], perkPoints: 2, effects: [{ statType: 'hp', amount: 2 }] },
            { id: 'perk-b3', label: 'DMG +3', icons: perkData.perk_b3, perkPoints: 3, effects: [{ token: 'dmg3', amount: 1 }] },
            { id: 'perk-b4', label: 'CP +1', icons: [perkData.cp.icon], perkPoints: 2, effects: [{ statType: 'cp', amount: 1 }] },
            { id: 'perk-b5', label: 'Add (Roll 1) to you attack', icons: perkData.perk_b5, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission-b1', name: 'sauron\'s hunger', bossName: 'sauron' },
            { id: 'mission-b2', name: 'nuclear assault', bossName: 'sebastian shaw' },
            { id: 'mission-b3', name: 'the maggia', bossName: 'kingpin' },
            { id: 'mission-b4', name: 'vibranium wars', bossName: 'klaw' },
            { id: 'mission-b5', name: 'u.n. catastrophe', bossName: 'mistique' },
        ]
    },
    {
        difficulty: 3,
        name: 'Difficulty 3',
        perks: [
            { id: 'perk-c1', label: 'Momentum Lvl 3', icons: [perkData.momentumLvl3.icon], perkPoints: 3, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk-c2', label: 'HP +3', icons: [perkData.hp.icon], perkPoints: 3, effects: [{ statType: 'hp', amount: 3 }] },
            { id: 'perk-c3', label: 'Sell and draw', icons: perkData.perk_c3, perkPoints: 3, effects: [{ proc: 'gameStart' }] },
            { id: 'perk-c4', label: 'Momentum +2', icons: [perkData.momentum].icon, perkPoints: 2, effects: [{ statType: 'momentum', amount: 2 }] },
            { id: 'perk-c5', label: 'Your attack is undefendable', icons: perkData.perk_c5, perkPoints: 4, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission-c1', name: 'executive crisis', bossName: 'mysterio' },
            { id: 'mission-c2', name: 'savage sentinels', bossName: 'master mold' },
            { id: 'mission-c3', name: 'goblin surprise', bossName: 'green goblin' },
            { id: 'mission-c4', name: 'asteroid attack', bossName: 'magneto' },
            { id: 'mission-c5', name: 'shield compromised', bossName: 'super skrull' },
        ]
    },
    {
        difficulty: 4,
        name: 'Difficulty 4',
        perks: [
            { id: 'perk-d1', label: 'Momentum Lvl 4', icons: [perkData.momentumLvl4.icon], perkPoints: 4, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk-d2', label: 'HP +4', icons: [perkData.hp.icon], perkPoints: 3, effects: [{ statType: 'hp', amount: 4 }] },
            { id: 'perk-d3', label: 'Free recruit', icons: perkData.perk_d3, perkPoints: 3, effects: [{ proc: 'gameStart' }] },
            { id: 'perk-d4', label: 'Draw', icons: [perkData.draw.icon], perkPoints: 2, effects: [{ statType: 'draw', amount: 1 }] },
            { id: 'perk-d5', label: 'Reduce crisis clock advancement', icons: perkData.perk_d5, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission-d1', name: 'revenge on avengers', bossName: 'ultron' },
            { id: 'mission-d2', name: 'cosmic clash', bossName: 'modok' },
            { id: 'mission-d3', name: 'from hel', bossName: 'hela' },
            { id: 'mission-d4', name: 'onslaught\'s citadel', bossName: 'onslaught' },
        ]
    },
    {
        difficulty: 5,
        name: 'Difficulty 5',
        perks: [
            { id: 'perk-e1', label: 'Momentum Lvl 5', icons: [perkData.momentumLvl5.icon], perkPoints: 4, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk-e2', label: 'Grant 2 Flight', icons: perkData.perk_e2, perkPoints: 3, effects: [{ token: 'flight', amount: 2 }] },
            { id: 'perk-e3', label: 'Grant 2 Shield', icons: perkData.perk_e3, perkPoints: 4, effects: [{ token: 'shield', amount: 2 }] },
            { id: 'perk-e4', label: 'CP +1, Draw', icons: [perkData.cp.icon, perkData.draw.icon], perkPoints: 3, effects: [{ statType: 'cp', amount: 1 }, { statType: 'draw', amount: 1 }] },
            { id: 'perk-e5', label: 'Exhaust without discarding', icons: perkData.perk_e5, perkPoints: 4, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission-e1', name: 'the mind stone', bossName: 'thanos' },
            { id: 'mission-e2', name: 'demon disaster', bossName: 'scarlet witch' },
            { id: 'mission-e3', name: 'darkness falls', bossName: 'mordo' },
            { id: 'mission-e4', name: 'hulk\'s legacy', bossName: 'skaar' },
        ]
    }
];
