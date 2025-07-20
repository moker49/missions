import { createHamburgerButton, toggleMenu } from './modules/hamburger.js';
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
            alert("New version. Data was reset.");
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
    return data.reduce((total, difficulty) => {
        return total + (difficulty.perkPointsSpent ?? 0);
    }, 0);
}

function getPerkPointsEarned(data = myStaticData) {
    return data.reduce((total, difficulty) => {
        return total + (difficulty.perkPointsEarned ?? 0);
    }, 0);
}

function getPerkPointsAvailableAtDifficultyAndAbove(difficultyIdx = 0, data = myStaticData, callback) {
    if (difficultyIdx < 0 || difficultyIdx >= data.length) return 0;
    let total = 0;
    let currentDiffUnspent = 0;
    data.slice(difficultyIdx).forEach((difficulty, idx) => {
        const earned = difficulty.perkPointsEarned ?? 0;
        const spent = difficulty.perkPointsSpent ?? 0;
        const unspent = earned - spent;
        total += unspent;
        if (idx === 0) currentDiffUnspent = unspent;
    });
    if (typeof callback === 'function') callback(currentDiffUnspent);
    return total;
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
                    difficultyObj.perkPointsSpent = 0;
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
        const earnedCurrent = getPerkPointsEarned(myStaticData);
        const earnedUndo = getPerkPointsEarned(undoStateData);
        const spentCurrent = getPerkPointsSpent(myStaticData);
        const spentUndo = getPerkPointsSpent(undoStateData);

        if (earnedCurrent !== earnedUndo || spentCurrent !== spentUndo) {
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
    updatePrestige();
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
            missionObj.perfectMin = missionObj.perfect
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

    myStaticData.forEach((difficultyObj, difficultyIdx) => {
        const section = createDiv('perk-section');
        const headerText = createDiv('header', difficultyObj.name);
        const header = createDiv('header-wrapper');
        header.appendChild(headerText);

        // --- Add notification dot for this difficulty ---
        let currentDiffUnspent = 0;
        const diffUnspent = getPerkPointsAvailableAtDifficultyAndAbove(difficultyIdx, myStaticData, (val) => currentDiffUnspent = val);
        let diffDot = createSpan('perk-dot-notification alt');
        if (diffUnspent > 0) {
            diffDot.textContent = diffUnspent;
            diffDot.style.display = 'inline-block';
            // if this point came from the current difficultyObj, remove class 'alt' from diffDot
            if (currentDiffUnspent > 0) {
                diffDot.classList.remove('alt');
            }
        } else {
            diffDot.style.display = 'none';
        }
        header.appendChild(diffDot);
        // --- end notification dot ---

        section.appendChild(header);

        let rowAlternate = false;
        difficultyObj.perks.forEach((perkObj) => {
            const minPoints = perkObj.min ?? 0;
            const minMod = minPoints % perkObj.perkPoints;
            const currentPoints = perkObj.currentPoints ?? 0;
            const currentMod = currentPoints % perkObj.perkPoints;
            const possibleMaxPoints = perkObj.perkPoints * (perkObj.prestigeLock ?? difficultyObj.prestige);
            const abilityMaxed = (minPoints >= possibleMaxPoints);
            const abilityNewlyMaxed = !abilityMaxed && currentPoints >= possibleMaxPoints;
            const minUnlockedAmount = Math.floor((minPoints / perkObj.perkPoints) ?? 1);
            const currentUnlockedAmount = Math.floor((currentPoints / perkObj.perkPoints) ?? 1);

            const row = createDiv('perk-entry' + (rowAlternate ? ' alt' : ''), '', perkObj.id);
            rowAlternate = !rowAlternate;

            const icon = createDiv('perk-icon');
            perkObj.icons.forEach((iconName) => {
                const i = createDiv('material-symbols-outlined', iconName);
                icon.appendChild(i);
            });

            const superScript = (currentUnlockedAmount > 1 ? `(×${currentUnlockedAmount})` : '');
            const label = createDiv('perk-label', perkObj.label);
            const superScriptSpan = createSpan('perk-multiplier', superScript);
            label.appendChild(superScriptSpan);
            if (perkObj.perkPoints === 0 || abilityMaxed) {
                icon.classList.add('active');
                label.classList.add('active');
                superScriptSpan.classList.remove('new');
            } else if ((minUnlockedAmount < 1 && currentUnlockedAmount >= 1) || abilityNewlyMaxed) {
                icon.classList.add('new');
                label.classList.add('new');
            } else if (minPoints >= perkObj.perkPoints) {
                icon.classList.add('partial');
                label.classList.add('partial');
            }

            if (currentUnlockedAmount > minUnlockedAmount) {
                superScriptSpan.classList.add('new');
            }

            const dots = createDiv('perk-dots');
            for (let i = 0; i < perkObj.perkPoints; i++) {
                const dot = createDiv('perk-dot');
                if (minPoints > 0 && i < minMod || abilityMaxed) {
                    dot.classList.add('active');
                } else if (currentPoints > minPoints && i >= minMod && (currentMod === 0 || i < currentMod)) {
                    dot.classList.add('new');
                }
                dots.appendChild(dot);
            }

            row.addEventListener('click', () => {
                // Only allow spending points earned in this difficulty or lower
                const minPoints = perkObj.min ?? 0;
                const currentPoints = perkObj.currentPoints ?? 0;
                const curentUnlocks = Math.floor(minPoints / perkObj.perkPoints);
                const minPrestige = perkObj.prestigeLock ?? Math.min(...myStaticData.map(d => d.prestige));
                const currentMaxPoints = Math.min(minPrestige, (curentUnlocks + 1)) * perkObj.perkPoints;

                // Prevent spending if not enough points available
                if (minPoints >= currentMaxPoints) return;

                createUndoState();

                if (currentPoints >= currentMaxPoints || getPerkPointsAvailableAtDifficultyAndAbove(difficultyIdx) <= 0) {
                    perkObj.currentPoints = minPoints;
                    let pointsToSubtract = currentPoints - minPoints;
                    for (let i = myStaticData.length - 1; i >= 0 && pointsToSubtract > 0; i--) {
                        const diff = myStaticData[i];
                        const spent = diff.perkPointsSpent ?? 0;
                        if (spent > 0) {
                            const toRemove = Math.min(spent, pointsToSubtract);
                            diff.perkPointsSpent -= toRemove;
                            pointsToSubtract -= toRemove;
                        }
                    }
                } else {
                    perkObj.currentPoints = currentPoints + 1;
                    let remaining = 1;
                    for (let i = difficultyIdx; i < myStaticData.length && remaining > 0; i++) {
                        const diff = myStaticData[i];
                        const available = (diff.perkPointsEarned ?? 0) - (diff.perkPointsSpent ?? 0);
                        if (available > 0) {
                            const toSpend = Math.min(available, remaining);
                            diff.perkPointsSpent = (diff.perkPointsSpent ?? 0) + toSpend;
                            remaining -= toSpend;
                        }
                    }
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
function renderMissionGrid(minPrestige) {
    missionGrid.innerHTML = '';

    myStaticData.forEach((difficultyObj) => {
        const section = createDiv('mission-section');
        const header = createDiv('header-wrapper', difficultyObj.name);
        section.appendChild(header);

        difficultyObj.perkPointsEarned = difficultyObj.perkPointsEarned ?? 0;

        let rowAlternate = false;
        difficultyObj.missions.forEach((missionObj) => {
            const row = createDiv('mission-entry' + (rowAlternate ? ' alt' : ''), '', missionObj.id);
            rowAlternate = !rowAlternate;

            missionObj.perfect = (missionObj.perfect ?? 0);
            missionObj.perfectMin = (missionObj.perfectMin ?? 0);
            missionObj.completedPrestiges = missionObj.completedPrestiges ?? [];

            const pefectAtMin = missionObj.perfect === missionObj.perfectMin;
            const perfectAtMax = missionObj.perfect === (minPrestige ?? Math.min(...myStaticData.map(d => d.prestige)));
            const perfectAtMaxCommited = perfectAtMax && pefectAtMin;

            const toggle = createDiv('mission-toggle');
            toggle.classList.toggle('material-symbols-outlined', perfectAtMax);
            toggle.textContent = perfectAtMax ? 'trophy' : '▢';

            const toggleClass = (perfectAtMaxCommited ? 'active' : (pefectAtMin ? 'semi' : 'new'));
            toggle.classList.toggle(toggleClass, missionObj.perfect ?? false);

            toggle.addEventListener('click', () => {
                const minPrestige = Math.min(...myStaticData.map(d => d.prestige));

                if (missionObj.perfectMin === minPrestige) return;
                createUndoState();

                const perfectDiff = missionObj.perfect - missionObj.perfectMin;

                if (missionObj.perfect < minPrestige) {
                    missionObj.perfect = missionObj.perfect + 1
                    missionObj.stage = (missionObj.stage ?? 0) + 1;
                    missionObj.boss = (missionObj.boss ?? 0) + 1;
                    difficultyObj.perkPointsEarned += 3;
                    for (let i = difficultyObj.prestige; i > 0; i--) {
                        if (missionObj.completedPrestiges.includes(i)) continue;
                        missionObj.completedPrestiges.push(i);
                        break;
                    }
                } else {
                    missionObj.perfect = missionObj.perfectMin ?? 0;
                    missionObj.stage = missionObj.stage - perfectDiff;
                    missionObj.boss = missionObj.boss - perfectDiff;
                    difficultyObj.perkPointsEarned -= (3 * perfectDiff);
                    missionObj.completedPrestiges = missionObj.completedPrestiges.filter(p => p !== difficultyObj.prestige);
                }

                missionObj.newStage = missionObj.newStageSolo || missionObj.perfect > missionObj.perfectMin;
                missionObj.newBoss = missionObj.newBossSolo || missionObj.perfect > missionObj.perfectMin;

                renderMissionGrid(minPrestige);
                updateActionButtonsDisplay();
            });

            const label = createDiv('mission-label', settings.bossNames ? missionObj.bossName : missionObj.name);

            const countContainer = createDiv('mission-count-wrapper');

            const stageClasses = 'mission-count' + (missionObj.newStage ? ' new' : '');
            const stage = createDiv(stageClasses, missionObj.stage ?? 0);
            stage.addEventListener('click', () => {
                createUndoState();
                missionObj.stage = (missionObj.stage ?? 0) + 1;
                difficultyObj.perkPointsEarned += 1;
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
                difficultyObj.perkPointsEarned += 1;
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

function updatePrestige() {
    let prestigeLevel = 1;
    while (true) {
        const allHaveMission = myStaticData.every(difficultyObj =>
            difficultyObj.missions.some(m => m.completedPrestiges && m.completedPrestiges.includes(prestigeLevel))
        );
        if (allHaveMission) {
            prestigeLevel++;
        } else {
            break;
        }
    }
    myStaticData.forEach(difficultyObj => {
        difficultyObj.prestige = prestigeLevel;
    });
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

    // stats section
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

    // tokens section
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

    // gameStart section
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

    // actives section
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
    // Show total unspent points for all difficulties

    const unspent = getPerkPointsAvailableAtDifficultyAndAbove();

    if (!dot) {
        dot = createSpan('perk-dot-notification bottom');
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