import { perkData } from './perkData.js';
export const version = 2;
export const staticData = [
    {
        difficulty: 1,
        name: 'Difficulty 1',
        perks: [
            { id: 'perk_a1', label: 'Momentum Lvl 1', icons: [perkData.momentumLvl1.icon], perkPoints: 0, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk_a2', label: 'HP +1', icons: [perkData.hp.icon], perkPoints: 1, effects: [{ statType: 'hp', amount: 1 }] },
            { id: 'perk_a3', label: 'Grant Focus Fire', icons: perkData.perk_a3.icons, perkPoints: 3, effects: [{ token: 'focusFire', amount: 1 }] },
            { id: 'perk_a4', label: 'Momentum +1', icons: [perkData.momentum.icon], perkPoints: 2, effects: [{ statType: 'momentum', amount: 1 }] },
            { id: 'perk_a5', label: perkData.perk_a5.label, icons: perkData.perk_a5.icons, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission_a1', name: 'ock knocks knox', bossName: 'doctor octopus' },
            { id: 'mission_a2', name: 'morlock massacre', bossName: 'mister sinister' },
        ]
    },
    {
        difficulty: 2,
        name: 'Difficulty 2',
        perks: [
            { id: 'perk_b1', label: 'Momentum Lvl 2', icons: [perkData.momentumLvl2.icon], perkPoints: 3, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk_b2', label: 'HP +2', icons: [perkData.hp.icon], perkPoints: 2, effects: [{ statType: 'hp', amount: 2 }] },
            { id: 'perk_b3', label: 'DMG +3', icons: perkData.perk_b3.icons, perkPoints: 3, effects: [{ token: 'dmg3', amount: 1 }] },
            { id: 'perk_b4', label: 'CP +1', icons: [perkData.cp.icon], perkPoints: 2, effects: [{ statType: 'cp', amount: 1 }] },
            { id: 'perk_b5', label: perkData.perk_b5.label, icons: perkData.perk_b5.icons, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission_b1', name: 'sauron\'s hunger', bossName: 'sauron' },
            { id: 'mission_b2', name: 'nuclear assault', bossName: 'sebastian shaw' },
            { id: 'mission_b3', name: 'the maggia', bossName: 'kingpin' },
            { id: 'mission_b4', name: 'vibranium wars', bossName: 'klaw' },
            { id: 'mission_b5', name: 'u.n. catastrophe', bossName: 'mistique' },
        ]
    },
    {
        difficulty: 3,
        name: 'Difficulty 3',
        perks: [
            { id: 'perk_c1', label: 'Momentum Lvl 3', icons: [perkData.momentumLvl3.icon], perkPoints: 3, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk_c2', label: 'HP +3', icons: [perkData.hp.icon], perkPoints: 3, effects: [{ statType: 'hp', amount: 3 }] },
            { id: 'perk_c3', label: perkData.perk_c3.label, icons: perkData.perk_c3.icons, perkPoints: 3, effects: [{ proc: 'gameStart' }] },
            { id: 'perk_c4', label: 'Momentum +2', icons: [perkData.momentum.icon], perkPoints: 2, effects: [{ statType: 'momentum', amount: 2 }] },
            { id: 'perk_c5', label: perkData.perk_c5.label, icons: perkData.perk_c5.icons, perkPoints: 4, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission_c1', name: 'executive crisis', bossName: 'mysterio' },
            { id: 'mission_c2', name: 'savage sentinels', bossName: 'master mold' },
            { id: 'mission_c3', name: 'goblin surprise', bossName: 'green goblin' },
            { id: 'mission_c4', name: 'asteroid attack', bossName: 'magneto' },
            { id: 'mission_c5', name: 'shield compromised', bossName: 'super skrull' },
        ]
    },
    {
        difficulty: 4,
        name: 'Difficulty 4',
        perks: [
            { id: 'perk_d1', label: 'Momentum Lvl 4', icons: [perkData.momentumLvl4.icon], perkPoints: 4, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk_d2', label: 'HP +4', icons: [perkData.hp.icon], perkPoints: 3, effects: [{ statType: 'hp', amount: 4 }] },
            { id: 'perk_d3', label: perkData.perk_d3.label, icons: perkData.perk_d3.icons, perkPoints: 3, effects: [{ proc: 'gameStart' }] },
            { id: 'perk_d4', label: 'Draw', icons: [perkData.draw.icon], perkPoints: 2, effects: [{ statType: 'draw', amount: 1 }] },
            { id: 'perk_d5', label: perkData.perk_d5.label, icons: perkData.perk_d5.icons, perkPoints: 3, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission_d1', name: 'revenge on avengers', bossName: 'ultron' },
            { id: 'mission_d2', name: 'cosmic clash', bossName: 'modok' },
            { id: 'mission_d3', name: 'from hel', bossName: 'hela' },
            { id: 'mission_d4', name: 'onslaught\'s citadel', bossName: 'onslaught' },
        ]
    },
    {
        difficulty: 5,
        name: 'Difficulty 5',
        perks: [
            { id: 'perk_e1', label: 'Momentum Lvl 5', icons: [perkData.momentumLvl5.icon], perkPoints: 4, effects: [{ statType: 'momentumLvl', amount: 1 }] },
            { id: 'perk_e2', label: 'Grant 2 Flight', icons: perkData.perk_e2.icons, perkPoints: 3, effects: [{ token: 'flight', amount: 2 }] },
            { id: 'perk_e3', label: 'Grant 2 Shield', icons: perkData.perk_e3.icons, perkPoints: 4, effects: [{ token: 'shield', amount: 2 }] },
            { id: 'perk_e4', label: 'CP +1, Draw', icons: [perkData.cp.icon, perkData.draw.icon], perkPoints: 3, effects: [{ statType: 'cp', amount: 1 }, { statType: 'draw', amount: 1 }] },
            { id: 'perk_e5', label: perkData.perk_e5.label, icons: perkData.perk_e5.icons, perkPoints: 4, effects: [{ proc: 'active' }] }
        ],
        missions: [
            { id: 'mission_e1', name: 'the mind stone', bossName: 'thanos' },
            { id: 'mission_e2', name: 'demon disaster', bossName: 'scarlet witch' },
            { id: 'mission_e3', name: 'darkness falls', bossName: 'mordo' },
            { id: 'mission_e4', name: 'hulk\'s legacy', bossName: 'skaar' },
        ]
    }
];
