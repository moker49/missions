import { createHamburgerButton } from './modules/hamburger.js';
import { deepMerge } from './utils/deepMerge.js';
import { staticData, version as staticDataVersion } from './data/staticData.js';
import { settings } from './data/settings.js';
import { perkData } from './data/perkData.js';
import { createSpan, createDiv } from './utils/dom.js';
import { showConfirmation } from './utils/dialogue.js';

// Dom Elements
const perkGrid = document.getElementById('perkGrid');
const missionGrid = document.getElementById('missionGrid');
const statsGrid = document.getElementById('statsGrid');

// Global Variables
let myStaticData = null;
let undoStateData = null;
let respecTriggered = false;
const staticDataString = JSON.stringify(staticData);

// MARK: LOAD
const rawLoadedData = localStorage.getItem('staticData');
let loadedVersion = null;
let loadedData = null;

if (rawLoadedData) {
    try {
        const parsed = JSON.parse(rawLoadedData);
        loadedVersion = parsed.version ?? 0;
        loadedData = parsed.data ?? parsed; // fallback for old format
        if (loadedVersion < staticDataVersion) {
            localStorage.removeItem('staticData');
            myStaticData = JSON.parse(JSON.stringify(staticData));
        } else {
            const mergedData = deepMerge(staticData, loadedData);
            myStaticData = mergedData;
        }
    } catch (e) {
        console.error('Failed to parse or merge saved staticData, loading default...', e);
        myStaticData = JSON.parse(JSON.stringify(staticData));
    }
} else {
    myStaticData = JSON.parse(JSON.stringify(staticData));
}

// Boss Names Toggle
const bossNameToggle = document.getElementById('boss-name-toggle');
const bossNameToggleIcon = document.getElementById('boss-name-toggle-icon');
bossNameToggle.addEventListener('click', () => {
    settings.bossNames = !settings.bossNames
    bossNameToggleIcon.textContent = 'check_box' + (settings.bossNames ? '' : '_outline_blank');
    renderMissionGrid();
    localStorage.setItem('settings', JSON.stringify(settings));
});
if (settings.bossNames) {
    bossNameToggleIcon.textContent = 'check_box';
}

// MARK: PERK MATH
function getPerkPointsSpent(data = myStaticData) {
    return data
        .flatMap(difficulty => difficulty.perks ?? [])
        .reduce((total, perk) => total + (perk.currentPoints ?? 0), 0);
}

function getPerkPointsEarned(data = myStaticData) {
    return data
        .flatMap(difficulty => difficulty.missions ?? [])
        .reduce((total, mission) => {
            const stagePoints = mission.stage ?? 0;
            const bossPoints = mission.boss ?? 0;
            const perfectPoints = mission.perfect ? 1 : 0;
            return total + stagePoints + bossPoints + perfectPoints;
        }, 0);
}

// MARK: HAMBURGER
const hamburger = createHamburgerButton();
const topBar = document.getElementById('top-bar-dice-throne-missions');
const topBarTitle = topBar.childNodes[0];
topBar.insertBefore(hamburger, topBarTitle);

// DICE THRONE DELETE
const diceThroneDelete = document.getElementById('dice-throne-delete');
diceThroneDelete.addEventListener('click', () => {
    const cancelBtn = createSpan('btn btn-conf-accent', 'cancel');
    const respecBtn = createSpan('btn btn-conf-secondary', 'respec');
    const deleteBtn = createSpan('btn btn-conf-secondary', 'delete');
    const buttons = [cancelBtn, respecBtn, deleteBtn]
    showConfirmation('Delete All Missions Data?', buttons, (choice) => {
        switch (choice) {
            case 'respec': {
                if (undoButton.style.display === 'block') {
                    undoButton.click();
                }
                createUndoState(true);
                myStaticData.forEach((difficultyObj) => {
                    difficultyObj.perks.forEach((perk) => {
                        perk.currentPoints = 0;
                        perk.min = 0;
                    });
                });
                respecTriggered = true;
                updateActionButtonsDisplay();
                renderPerkGrid();
                renderMissionGrid();
                toggleMenu(false);
                return;
            }
            case 'delete': {
                createUndoState(true);
                myStaticData = JSON.parse(staticDataString);
                updateActionButtonsDisplay();
                respecTriggered = true;
                renderPerkGrid();
                renderMissionGrid();
                toggleMenu(false);
                return;
            }
            default: return;
        }
    });
});

// MARK: TOP BAR
// UNDO
const undoButton = document.getElementById('undo-button');
undoButton.addEventListener('click', () => {
    if (undoStateData) {
        Object.assign(myStaticData, JSON.parse(JSON.stringify(undoStateData)));
        renderPerkGrid();
        renderMissionGrid();
        undoButton.style.display = 'none';
        saveButton.style.display = 'none';
        undoStateData = null;
        respecTriggered = false;
    }
});

function createUndoState(force = false) {
    if (undoStateData === null || force) {
        undoStateData = JSON.parse(JSON.stringify(myStaticData));
    }
}

function updateActionButtonsDisplay() {
    if (!undoStateData) {
        undoButton.style.display = 'none';
        saveButton.style.display = 'none';
        return;
    }

    if (respecTriggered) {
        undoButton.style.display = 'block';
        saveButton.style.display = 'block';
    } else {
        const availableCurrent = getPerkPointsEarned(myStaticData);
        const availableUndo = getPerkPointsEarned(undoStateData);
        const spentCurrent = getPerkPointsSpent(myStaticData);
        const spentUndo = getPerkPointsSpent(undoStateData);

        if (availableCurrent !== availableUndo || spentCurrent !== spentUndo) {
            undoButton.style.display = 'block';
            saveButton.style.display = 'block';
        } else {
            undoButton.style.display = 'none';
            saveButton.style.display = 'none';
        }
    }
}

// SAVE BUTTON
const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', () => {
    saveDataState();
    localStorage.setItem('staticData', JSON.stringify({
        version: staticDataVersion,
        data: myStaticData
    }));
    undoButton.style.display = 'none';
    saveButton.style.display = 'none';
    undoStateData = null;
    respecTriggered = false;
    renderPerkGrid();
    renderMissionGrid();
    renderStatGrid();
});

function saveDataState() {
    myStaticData.forEach((difficultyObj) => {
        difficultyObj.perks.forEach((perkObj) => {
            perkObj.min = perkObj.currentPoints
        });
        difficultyObj.missions.forEach((missionObj) => {
            missionObj.perfectLock = missionObj.perfect
            missionObj.newStage = false;
            missionObj.newBoss = false;
            missionObj.newStageSolo = false;
            missionObj.newBossSolo = false;
        });
    });
}

// MARK: PERK GRID
function renderPerkGrid() {
    perkGrid.innerHTML = '';
    myStaticData.forEach((difficultyObj) => {
        const section = createDiv('perk-section');
        const header = createDiv('perk-header', difficultyObj.name);
        section.appendChild(header);

        let rowAlternate = false;
        difficultyObj.perks.forEach((perkObj) => {
            const row = createDiv('perk-entry' + (rowAlternate ? ' alt' : ''), '', perkObj.id);
            rowAlternate = !rowAlternate;

            const icon = createDiv('perk-icon');
            perkObj.icons.forEach((iconName) => {
                const i = createDiv('material-symbols-outlined', iconName);
                icon.appendChild(i);
            });

            const label = createDiv('perk-label', perkObj.label);
            if (perkObj.perkPoints === 0 || perkObj.perkPoints === perkObj.min) {
                icon.classList.add('active');
                label.classList.add('active');
            } else if (perkObj.perkPoints === perkObj.currentPoints) {
                icon.classList.add('new');
                label.classList.add('new');
            }

            const dots = createDiv('perk-dots');
            for (let i = 0; i < perkObj.perkPoints; i++) {
                const dot = createDiv('perk-dot');
                if (i < (perkObj.min ?? 0)) {
                    dot.classList.add('active');
                } else if (i < (perkObj.currentPoints ?? 0)) {
                    dot.classList.add('new');
                }
                dots.appendChild(dot);
            }

            row.addEventListener('click', () => {
                createUndoState();
                const current = perkObj.currentPoints ?? 0;
                const totalSpent = getPerkPointsSpent();
                const totalEarned = getPerkPointsEarned();

                if (current === perkObj.perkPoints || totalSpent >= totalEarned) {
                    perkObj.currentPoints = perkObj.min ?? 0;
                } else {
                    perkObj.currentPoints = current + 1;
                }

                renderPerkGrid();
                updateActionButtonsDisplay();
            });

            row.appendChild(icon);
            row.appendChild(label);
            row.appendChild(dots);
            section.appendChild(row);
        });

        perkGrid.appendChild(section);
    });
    perkGrid.classList.add('hide-scrollbar');
    updatePerkTabNotification();
}

// MARK: MISSION GRID
function renderMissionGrid() {
    missionGrid.innerHTML = '';

    myStaticData.forEach((difficultyObj) => {
        const section = createDiv('mission-section');
        const header = createDiv('mission-header', difficultyObj.name);
        section.appendChild(header);

        let rowAlternate = false;
        difficultyObj.missions.forEach((missionObj) => {
            const row = createDiv('mission-entry' + (rowAlternate ? ' alt' : ''), '', missionObj.id);
            rowAlternate = !rowAlternate;

            const toggle = createDiv('mission-toggle');
            toggle.classList.toggle('material-symbols-outlined', missionObj.perfect ?? false);
            const toggleClass = missionObj.perfectLock ? 'active' : 'new';
            toggle.classList.toggle(toggleClass, missionObj.perfect ?? false);
            toggle.textContent = missionObj.perfect ? 'trophy' : '▢';
            toggle.addEventListener('click', () => {
                if (missionObj.perfectLock) return;
                createUndoState();
                missionObj.perfect = !missionObj.perfect;
                missionObj.stage = (missionObj.stage ?? 0) + (missionObj.perfect ? 1 : -1);
                missionObj.boss = (missionObj.boss ?? 0) + (missionObj.perfect ? 1 : -1);
                missionObj.newStage = missionObj.newStageSolo ? missionObj.newStage : !missionObj.newStage;
                missionObj.newBoss = missionObj.newBossSolo ? missionObj.newBoss : !missionObj.newBoss;
                renderMissionGrid();
                updateActionButtonsDisplay();
            });

            const label = createDiv('mission-label', settings.bossNames ? missionObj.bossName : missionObj.name);

            const countContainer = createDiv('mission-count-wrapper');

            const stageClasses = 'mission-count' + (missionObj.newStage ? ' new' : '');
            const stage = createDiv(stageClasses, missionObj.stage ?? 0);
            stage.addEventListener('click', () => {
                createUndoState();
                missionObj.stage = (missionObj.stage ?? 0) + 1;
                missionObj.newStage = true;
                missionObj.newStageSolo = true;
                renderMissionGrid();
                updateActionButtonsDisplay();
            });

            const bossClasses = 'mission-count' + (missionObj.newBoss ? ' new' : '');
            const boss = createDiv(bossClasses, missionObj.boss ?? 0);
            boss.addEventListener('click', () => {
                createUndoState();
                missionObj.boss = (missionObj.boss ?? 0) + 1;
                missionObj.newBoss = true;
                missionObj.newBossSolo = true;
                renderMissionGrid();
                updateActionButtonsDisplay();
            });

            countContainer.appendChild(stage);
            countContainer.appendChild(boss);

            row.appendChild(toggle);
            row.appendChild(label);
            row.appendChild(countContainer);

            section.appendChild(row);
        });

        missionGrid.appendChild(section);
    });
    missionGrid.classList.add('hide-scrollbar');
    updatePerkTabNotification();
}

// MARK: STATS GRID
function renderStatGrid() {
    statsGrid.innerHTML = '';

    const myStats = {};
    const myTokens = {};
    const myGameStart = {};
    const myActives = {};

    myStaticData.forEach((difficultyObj) => {
        difficultyObj.perks.forEach((perkObj) => {
            perkObj.effects.forEach((effect) => {
                if ((perkObj.currentPoints ?? 0) < perkObj.perkPoints) return;
                if (effect.statType) {
                    if (myStats[effect.statType]) myStats[effect.statType].amount += effect.amount;
                    else myStats[effect.statType] = { label: perkData[effect.statType].label, amount: effect.amount }
                }
                else if (effect.token) {
                    if (myTokens[perkObj.id]) myTokens[perkObj.id].amount += effect.amount;
                    else {
                        myTokens[perkObj.id] = { label: perkData[perkObj.id].label, amount: effect.amount }
                    }
                }
                else if (effect.proc == "gameStart") {
                    myGameStart[perkObj.id] = perkData[perkObj.id].label;
                }
                else if (effect.proc == "active") {
                    myActives[perkObj.id] = perkData[perkObj.id].label;
                }
            });
        });
    });

    // stats section
    const statSection = createDiv('stat-section');
    const statHeader = createDiv('stat-header', 'Stats');
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

    // tokens section
    const tokenSection = createDiv('stat-section');
    const tokenHeader = createDiv('stat-header', 'Tokens');
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

    // gameStart section
    const gameStartSection = createDiv('stat-section');
    const gameStartHeader = createDiv('stat-header', 'Game Start');
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

        const label = createDiv('stat-label', myGameStart[myGameStartKey]);
        row.appendChild(label);

        gameStartSection.appendChild(row);
    });

    // actives section
    const activesSection = createDiv('stat-section');
    const activesHeader = createDiv('stat-header', 'Actives');
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

        const label = createDiv('stat-label', myActives[myActivesKey]);
        row.appendChild(label);

        activesSection.appendChild(row);
    });

    statsGrid.appendChild(statSection);
    statsGrid.appendChild(tokenSection);
    statsGrid.appendChild(gameStartSection);
    statsGrid.appendChild(activesSection);
    statsGrid.classList.add('hide-scrollbar');
}

try {
    renderPerkGrid();
    renderMissionGrid();
    renderStatGrid();
    updatePerkTabNotification();
} catch (e) {
    console.error('Render error:', e);
}

// Utility to update the perk tab notification dot
function updatePerkTabNotification() {
    const perkNavBtn = document.querySelector(".nav-button[data-tab='perkTab']");
    if (!perkNavBtn) return;

    let dot = perkNavBtn.querySelector('.perk-dot-notification');
    const unspent = getPerkPointsEarned(myStaticData) - getPerkPointsSpent(myStaticData);

    if (!dot) {
        dot = document.createElement('span');
        dot.className = 'perk-dot-notification';
        perkNavBtn.style.position = 'relative';
        perkNavBtn.appendChild(dot);
    }

    if (unspent > 0) {
        dot.textContent = unspent;
        dot.style.display = 'inline-block';
    } else {
        dot.style.display = 'none';
    }
}
