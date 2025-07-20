import { myStaticData } from './main.js';
import { perkData } from './data/perkData.js';
import { createDiv } from './utils/dom.js';


const statsGrid = document.getElementById('statsGrid');
export function renderStatGrid() {
    statsGrid.innerHTML = '';

    const myStats = {};
    const myTokens = {};
    const myGameStart = {};
    const myActives = {};

    // MARK: VALUES
    myStaticData.forEach((difficultyObj) => {
        difficultyObj.perks.forEach((perkObj) => {
            perkObj.effects.forEach((effect) => {
                const perkObjMin = perkObj.min ?? 0;
                if (perkObjMin < perkObj.perkPoints) return;
                const abilityUnlocks = Math.floor(perkObjMin / perkObj.perkPoints) || 1;
                if (effect.statType) {
                    if (myStats[effect.statType]) myStats[effect.statType].amount += effect.amount * abilityUnlocks;
                    else myStats[effect.statType] = { label: perkData[effect.statType].label, amount: effect.amount * abilityUnlocks };
                }
                else if (effect.token) {
                    if (myTokens[perkObj.id]) myTokens[perkObj.id].amount += effect.amount * abilityUnlocks;
                    else myTokens[perkObj.id] = { label: perkData[perkObj.id].label, amount: effect.amount * abilityUnlocks }
                }
                else if (effect.proc == "gameStart") {
                    myGameStart[perkObj.id] = { label: perkData[perkObj.id].label, amount: abilityUnlocks };
                }
                else if (effect.proc == "active") {
                    myActives[perkObj.id] = { label: perkData[perkObj.id].label, amount: abilityUnlocks };
                }
            });
        });
    });

    // MARK: STATS
    const statSection = createDiv('stat-section');
    const statHeader = createDiv('header-wrapper', 'Stats');
    statSection.appendChild(statHeader);
    let rowAlternate = false;
    Object.keys(myStats).forEach((myStatsKey) => {
        const row = createDiv('stat-entry' + (rowAlternate ? ' alt' : ''), '');
        rowAlternate = !rowAlternate;

        const iconList = createDiv('stat-icon');
        const perkDataKey = myStatsKey + (myStatsKey == "momentumLvl" ? myStats[myStatsKey].amount : '');
        const icon = createDiv('material-symbols-outlined', perkData[perkDataKey].icon);
        iconList.appendChild(icon);
        row.appendChild(iconList);

        const label = createDiv('stat-label', perkData[perkDataKey].label + myStats[myStatsKey].amount);
        row.appendChild(label);

        statSection.appendChild(row);
    });

    // MARK: TOKENS
    const tokenSection = createDiv('stat-section');
    const tokenHeader = createDiv('header-wrapper', 'Tokens');
    tokenSection.appendChild(tokenHeader);
    rowAlternate = false;
    Object.keys(myTokens).forEach((myTokenKey) => {
        const row = createDiv('stat-entry' + (rowAlternate ? ' alt' : ''), '');
        rowAlternate = !rowAlternate;

        const iconList = createDiv('stat-icon');
        const icon = createDiv('material-symbols-outlined', perkData[myTokenKey].icons[0]);
        iconList.appendChild(icon);
        row.appendChild(iconList);

        const multiple = myTokens[myTokenKey].amount > 1;
        const label = createDiv('stat-label', myTokens[myTokenKey].label + (multiple ? ` x${myTokens[myTokenKey].amount}` : ''));
        row.appendChild(label);

        tokenSection.appendChild(row);
    });

    // MARK: GAME START
    const gameStartSection = createDiv('stat-section');
    const gameStartHeader = createDiv('header-wrapper', 'Game Start');
    gameStartSection.appendChild(gameStartHeader);
    rowAlternate = false;
    Object.keys(myGameStart).forEach((myGameStartKey) => {
        const row = createDiv('stat-entry' + (rowAlternate ? ' alt' : ''), '');
        rowAlternate = !rowAlternate;

        const iconList = createDiv('stat-icon');
        perkData[myGameStartKey].icons.forEach((iconName) => {
            const icon = createDiv('material-symbols-outlined', iconName);
            iconList.appendChild(icon);
        });
        row.appendChild(iconList);

        const labelText = myGameStart[myGameStartKey].label + (myGameStart[myGameStartKey].amount > 1 ? ` x${myGameStart[myGameStartKey].amount}` : '');
        const label = createDiv('stat-label', labelText);
        row.appendChild(label);

        gameStartSection.appendChild(row);
    });

    // MARK: ACTIVES
    const activesSection = createDiv('stat-section');
    const activesHeader = createDiv('header-wrapper', 'Actives');
    activesSection.appendChild(activesHeader);
    rowAlternate = false;
    Object.keys(myActives).forEach((myActivesKey) => {
        const row = createDiv('stat-entry' + (rowAlternate ? ' alt' : ''), '');
        rowAlternate = !rowAlternate;

        const iconList = createDiv('stat-icon');
        perkData[myActivesKey].icons.forEach((iconName) => {
            const icon = createDiv('material-symbols-outlined', iconName);
            iconList.appendChild(icon);
        });
        row.appendChild(iconList);

        const labelText = myActives[myActivesKey].label + (myActives[myActivesKey].amount > 1 ? ` x${myActives[myActivesKey].amount}` : '');
        const label = createDiv('stat-label', labelText);
        row.appendChild(label);

        activesSection.appendChild(row);
    });

    statsGrid.appendChild(statSection);
    statsGrid.appendChild(tokenSection);
    statsGrid.appendChild(gameStartSection);
    statsGrid.appendChild(activesSection);
    statsGrid.classList.add('hide-scrollbar');
}