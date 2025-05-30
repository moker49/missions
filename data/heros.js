export const heros = {
    season_one: [
        { id: 'barbarian', name: 'Barbarian', defaultSort: 1 },
        { id: 'monk', name: 'Monk', defaultSort: 2 },
        { id: 'moon_elf', name: 'Moon Elf', defaultSort: 3 },
        { id: 'ninja', name: 'Ninja', defaultSort: 4 },
        { id: 'paladin', name: 'Paladin', defaultSort: 5 },
        { id: 'pyromancer', name: 'Pyromancer', defaultSort: 6 },
        { id: 'shadow_thief', name: 'Shadow Thief', defaultSort: 7 },
        { id: 'treant', name: 'Treant', defaultSort: 8 },
    ],
    season_two: [
        { id: 'artificer', name: 'Artificer', defaultSort: 9 },
        { id: 'cursed_pirate', name: 'Cursed Pirate', defaultSort: 10 },
        { id: 'gunslinger', name: 'Gunslinger', defaultSort: 11 },
        { id: 'huntress', name: 'Huntress', defaultSort: 12 },
        { id: 'samurai', name: 'Samurai', defaultSort: 13 },
        { id: 'seraph', name: 'Seraph', defaultSort: 14 },
        { id: 'tactician', name: 'Tactician', defaultSort: 15 },
        { id: 'vampire_lord', name: 'Vampire Lord', defaultSort: 16 },
    ],
    marvel: [
        { id: 'black_panther', name: 'Black Panther', defaultSort: 17 },
        { id: 'black_widow', name: 'Black Widow', defaultSort: 18 },
        { id: 'captain_marvel', name: 'Captain Marvel', defaultSort: 19 },
        { id: 'doctor_strange', name: 'Doctor Strange', defaultSort: 20 },
        { id: 'loki', name: 'Loki', defaultSort: 21 },
        { id: 'miles_morales', name: 'Miles Morales', defaultSort: 22 },
        { id: 'scarlet_witch', name: 'Scarlet Witch', defaultSort: 23 },
        { id: 'thor', name: 'Thor', defaultSort: 24 },
    ],
    x_men: [
        { id: 'cyclops', name: 'Cyclops', defaultSort: 25 },
        { id: 'dark_phoenix', name: 'Dark Phoenix', defaultSort: 26 },
        { id: 'deadpool', name: 'Deadpool', defaultSort: 27 },
        { id: 'gambit', name: 'Gambit', defaultSort: 28 },
        { id: 'iceman', name: 'Iceman', defaultSort: 29 },
        { id: 'rogue', name: 'Rogue', defaultSort: 30 },
        { id: 'psylocke', name: 'Psylocke', defaultSort: 31 },
        { id: 'storm', name: 'Storm', defaultSort: 32 },
        { id: 'wolverine', name: 'Wolverine', defaultSort: 33 },
    ],
}

export function getHeroById(id, myHeros) {
    for (const group of Object.values(myHeros)) {
        const hero = group.find(h => h.id === id);
        if (hero) return hero;
    }
    return undefined;
}
