import { settings } from './data/settings.js';
import { staticData, version as staticDataVersion } from './data/staticData.js';
import { deepMerge } from './utils/deepMerge.js';
import { createDropdown, createSpan } from './utils/dom.js';
import { createHamburgerButton } from './modules/hamburger.js';
import { renderMissionGrid } from './missions.js';
import { renderPerkGrid } from './perks.js';
import { renderStatGrid } from './stats.js';
import { showConfirmation } from './utils/dialogue.js';


// Global Variables
export let myStaticData = null;
let undoStateData = null;
let respecTriggered = false;
const staticDataString = JSON.stringify(staticData);

// MARK: TAB SWITCHING
const menuItems = document.querySelectorAll('.menu-item');
const menuBackdrop = document.getElementById('menu-backdrop');
const tabGroups = {
    'dice-throne-missions': {
        topBar: document.getElementById('top-bar-dice-throne-missions'),
        tabs: document.getElementById('dtm-tabs')
    },
    'hero-ranking': {
        topBar: document.getElementById('top-bar-hero-ranking'),
        tabs: document.getElementById('rank-tabs')
    }
};
let currentMenu = 'dice-throne-missions';
menuItems.forEach(item => {
    item.addEventListener('click', (event) => {
        // Prevent menu switch if a quick-action was clicked
        if (event.target.closest('.quick-action')) {
            event.stopPropagation();
            return;
        }
        const id = item.id;
        if (!tabGroups[id]) return;
        // Hide all
        Object.values(tabGroups).forEach(g => {
            g.topBar.style.display = 'none';
            g.tabs.style.display = 'none';
        });
        // Show selected
        tabGroups[id].topBar.style.display = '';
        tabGroups[id].tabs.style.display = '';
        currentMenu = id;
        menuBackdrop.click();
        updateNavVisibility(tabGroups[id].tabs);
    });
});

// --- Nav visibility logic ---
function updateNavVisibility(tabGroup) {
    const nav = tabGroup.querySelector('.nav');
    if (!nav) return;
    const tabCount = tabGroup.querySelectorAll('.tab-content').length;
    nav.style.display = tabCount > 1 ? '' : 'none';
}
Object.values(tabGroups).forEach(g => updateNavVisibility(g.tabs));

// --- Tab switching logic ---
const showTab = function (tabId, tabGroupId) {
    const groupId = tabGroupId || (currentMenu === 'hero-ranking' ? 'rank-tabs' : 'dtm-tabs');
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    group.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    const navBtn = group.querySelector(`.nav-button[data-tab='${tabId}']`);
    if (navBtn) navBtn.classList.add('active');
};

// Add event listeners for nav buttons to handle tab switching
document.querySelectorAll('.nav-button').forEach(btn => {
    btn.addEventListener('click', function () {
        const tabId = btn.getAttribute('data-tab');
        // Determine which tab group this button belongs to
        const nav = btn.closest('.nav');
        const tabGroup = nav.closest('.tab-group');
        showTab(tabId, tabGroup.id);
    });
});

// MARK: SETTINGS
const tabs = [
    {
        value: 'rankTab',
        label: 'Hero Ranking',
    },
    {
        value: 'statsTab',
        label: 'Stats',
    },
    {
        value: 'missionTab',
        label: 'Missions',
    },
    {
        value: 'perkTab',
        label: 'Perks',
    },
];
const rawLoadedSettings = localStorage.getItem('settings');
if (rawLoadedSettings) {
    try {
        const loadedSettings = JSON.parse(rawLoadedSettings);
        const mergedSettings = deepMerge(settings, loadedSettings);
        Object.assign(settings, mergedSettings);
    } catch (e) {
        console.error('Failed to parse saved settings:', e);
    }
}
const landingPageLabel = document.getElementById('landing-page-label');
if (settings.defaultTabId) {
    // Find which menu group contains the default tab
    for (const [menuId, group] of Object.entries(tabGroups)) {
        if (group.tabs.querySelector(`#${settings.defaultTabId}`)) {
            // Hide all groups
            Object.values(tabGroups).forEach(g => {
                g.topBar.style.display = 'none';
                g.tabs.style.display = 'none';
            });
            // Show the correct group
            group.topBar.style.display = '';
            group.tabs.style.display = '';
            currentMenu = menuId;
            updateNavVisibility(group.tabs);
            // Activate the tab
            showTab(settings.defaultTabId, group.tabs.id);

            break;
        }
    }
    landingPageLabel.textContent = 'Landing: ' + (tabs.find(tab => tab.value === settings.defaultTabId)?.label || 'Stats');
}

const landingPage = document.getElementById('landing-page');
const landingPageIcon = document.getElementById('landing-page-icon');
export const allTabsDropdown = createDropdown('landing-options', landingPage, tabs);
landingPage.addEventListener('click', () => {
    allTabsDropdown.classList.toggle('visible');
    landingPageIcon.textContent = allTabsDropdown.classList.contains('visible') ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
});
allTabsDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const option = e.target;
    if (option.classList.contains('dropdown-option')) {
        landingPageLabel.textContent = 'Landing: ' + option.textContent;
        allTabsDropdown.classList.remove('visible');
        settings.defaultTabId = option.value;
        landingPageIcon.textContent = 'keyboard_arrow_down';
        localStorage.setItem('settings', JSON.stringify(settings));
    }
});

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

export function getPerkPointsAvailableAtDifficultyAndAbove(difficultyIdx = 0, data = myStaticData, callback) {
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

export function updatePerkTabNotification() {
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

export function createUndoState(force = false) {
    if (undoStateData === null || force) {
        undoStateData = JSON.parse(JSON.stringify(myStaticData));
    }
}

export function updateActionButtonsDisplay() {
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

// MARK: SAVE
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

// MARK: RENDER
try {
    renderPerkGrid();
    renderMissionGrid();
    renderStatGrid();
    updatePerkTabNotification();
} catch (e) {
    console.error('Render error:', e);
}

