import { deepMerge } from './utils/deepMerge.js';
import { staticData } from './modules/staticData.js';
import { settings } from './modules/settings.js';

const app = document.getElementById('app');
let isEditing = false;
const perkGrid = document.getElementById('perkGrid');
const missionGrid = document.getElementById('missionGrid');
const statsGrid = document.getElementById('statsGrid');
let staticDataBackup = null;

// MARK: SETTINGS
const bossNameToggle = document.getElementById('boss-name-toggle');
const bossNameToggleIcon = document.getElementById('boss-name-toggle-icon');
bossNameToggle.addEventListener('click', () => {
    settings.bossNames = !settings.bossNames
    bossNameToggleIcon.textContent = 'check_box' + (settings.bossNames ? '' : '_outline_blank');
    renderMissionGrid();
    localStorage.setItem('settings', JSON.stringify(settings));
});
const loadEditingToggle = document.getElementById('load-editing');
const loadEditingToggleIcon = document.getElementById('load-editing-icon');
loadEditingToggle.addEventListener('click', () => {
    settings.loadEditing = !settings.loadEditing
    loadEditingToggleIcon.textContent = 'check_box' + (settings.loadEditing ? '' : '_outline_blank');
    localStorage.setItem('settings', JSON.stringify(settings));
});

// MARK: LOAD
const rawLoadedData = localStorage.getItem('staticData');
if (rawLoadedData) {
    try {
        const loadedData = JSON.parse(rawLoadedData);
        const mergedData = deepMerge(staticData, loadedData);
        Object.assign(staticData, mergedData);
    } catch (e) {
        console.error('Failed to parse or merge saved staticData:', e);
    }
}
const rawLoadedSettings = localStorage.getItem('settings');
if (rawLoadedSettings) {
    try {
        const loadedSettings = JSON.parse(rawLoadedSettings);
        Object.assign(settings, loadedSettings);
    } catch (e) {
        console.error('Failed to parse saved settings:', e);
    }
}
if (settings.bossNames) {
    bossNameToggleIcon.textContent = 'check_box';
}
if (settings.loadEditing) {
    isEditing = true;
    app.classList.add('editing');
    loadEditingToggleIcon.textContent = 'check_box';
}

// MARK: PERK MATH
function getPerkPointsSpent() {
    return staticData
        .flatMap(difficulty => difficulty.perks ?? [])
        .reduce((total, perk) => total + (perk.currentPoints ?? 0), 0);
}

function getPerkPointsEarned() {
    return staticData
        .flatMap(difficulty => difficulty.missions ?? [])
        .reduce((total, mission) => {
            const stagePoints = mission.stage ?? 0;
            const bossPoints = mission.boss ?? 0;
            const perfectPoints = mission.perfect ? 1 : 0;
            return total + stagePoints + bossPoints + perfectPoints;
        }, 0);
}

// MARK: DOM Creation
function createDiv(className, textContent = '', id = null) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = textContent;
    if (id !== null) el.id = id;
    return el;
}

function createButton(className, textContent = '') {
    const el = document.createElement('span');
    el.className = className;
    el.textContent = textContent;
    return el;
}


function saveDataState() {
    staticData.forEach((difficultyObj) => {
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

// MARK: HAMBURGER
const hamburger = document.getElementById('menu-button');
const menuPanel = document.getElementById('menu-panel');
const menuBackdrop = document.getElementById('menu-backdrop');

function toggleMenu(open = null) {
    const isVisible = menuPanel.classList.contains('visible');
    const shouldOpen = open === null ? !isVisible : open;
    toggleScroll(!shouldOpen);
    menuPanel.classList.toggle('visible', shouldOpen);
    menuBackdrop.classList.toggle('visible', shouldOpen);
}
hamburger.addEventListener('click', () => toggleMenu());
menuBackdrop.addEventListener('click', () => toggleMenu(false));
function toggleScroll(enable) {
    if (enable) {
        // unlock:
        const scrollYValue = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollYValue || '0') * -1);
    } else {
        // lock
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    }
}

// DICE THRONE DELETE
const diceThroneDelete = document.getElementById('dice-throne-delete');
diceThroneDelete.addEventListener('click', () => {
    const cancelBtn = createButton('btn btn-conf-accent', 'cancel');
    const respecBtn = createButton('btn btn-conf-secondary', 'respec');
    const deleteBtn = createButton('btn btn-conf-secondary', 'delete');
    const buttons = [cancelBtn, respecBtn, deleteBtn]
    showConfirmation('Delete Everything?', buttons, (choice) => {
        switch (choice) {
            case 'respec': {
                if (undoButton.style.display === 'block') {
                    undoButton.click();
                }
                staticData.forEach((difficultyObj) => {
                    difficultyObj.perks.forEach((perk) => {
                        perk.currentPoints = 0;
                        perk.min = 0;
                    });
                });
                editButton.click();
                isEditing = true;
                app.classList.add('editing');
                updatePerkPointsDisplay();
                undoButton.style.display = 'none';
                renderPerkGrid();
                renderMissionGrid();
                toggleMenu(false);
                return;
            }
            case 'delete': {
                staticData.forEach((difficultyObj) => {
                    difficultyObj.perks.forEach((perk) => {
                        perk.currentPoints = 0;
                        perk.min = 0;
                    });
                    difficultyObj.missions.forEach((mission) => {
                        mission.perfect = false;
                        mission.perfectLock = false;
                        mission.stage = 0;
                        mission.boss = 0;
                        mission.newStage = false;
                        mission.newBoss = false;
                        mission.newStageSolo = false;
                        mission.newBossSolo = false;
                    });
                });
                updatePerkPointsDisplay();
                undoButton.style.display = 'none';
                localStorage.setItem('staticData', JSON.stringify(staticData));
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
    if (staticDataBackup) {
        Object.assign(staticData, JSON.parse(JSON.stringify(staticDataBackup)));
        renderPerkGrid();
        renderMissionGrid();
        updatePerkPointsDisplay();
        undoButton.style.display = 'none';
    }
});

// TOGGLE FILTER
const filterButton = document.getElementById('filter-toggle');
let showAllPerksAndMissions = true;

filterButton.addEventListener('click', () => {
    showAllPerksAndMissions = !showAllPerksAndMissions;
    filterButton.children[0].textContent = showAllPerksAndMissions ? 'filter_list' : 'filter_list_off';
    renderPerkGrid();
    renderMissionGrid();
});

// MARK: EDITING
const editButton = document.getElementById('edit-toggle');
const icon = editButton.querySelector('.material-symbols-outlined');
const pointsText = editButton.querySelector('.points-text');
function updatePerkPointsDisplay() {
    const spent = getPerkPointsSpent();
    const available = getPerkPointsEarned();
    if (spent !== available) {
        icon.style.display = 'none';
        pointsText.style.display = '';
        pointsText.textContent = `${spent} / ${available}`;
        editButton.disabled = true;
        undoButton.style.display = 'block';
    } else if (isEditing) {
        icon.style.display = '';
        icon.textContent = 'save';
        pointsText.style.display = 'none';
        editButton.disabled = false;
    }
    editButton.classList.toggle('button-secondary', spent !== available);
}
function renderEditButton() {
    editButton.addEventListener('click', () => {
        if (!isEditing) {
            // EDIT
            isEditing = true;
            app.classList.add('editing');
            updatePerkPointsDisplay();
            staticDataBackup = JSON.parse(JSON.stringify(staticData));
            if (!showAllPerksAndMissions) {
                filterButton.click();
            }
        } else if (getPerkPointsSpent() === getPerkPointsEarned()) {
            // SAVE
            isEditing = false;
            saveDataState();
            localStorage.setItem('staticData', JSON.stringify(staticData));
            app.classList.remove('editing');
            icon.style.display = '';
            pointsText.style.display = 'none';
            icon.textContent = 'edit';
            undoButton.style.display = 'none';
            renderPerkGrid();
            renderMissionGrid();
        }
        filterButton.classList.toggle('hidden', isEditing);
    });
}

// MARK: PERK GRID
function renderPerkGrid() {
    perkGrid.innerHTML = '';
    staticData.forEach((difficultyObj) => {
        const section = createDiv('perk-section');
        const header = createDiv('perk-header', difficultyObj.name);
        section.appendChild(header);

        let rowAlternate = false;
        difficultyObj.perks.forEach((perkObj) => {
            const isUnlocked = perkObj.currentPoints ?? 0 === perkObj.perkPoints;
            const showPerk = showAllPerksAndMissions || isUnlocked;
            if (!showPerk) return;
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
                if (!document.getElementById('app').classList.contains('editing')) return;
                const current = perkObj.currentPoints ?? 0;
                const totalSpent = getPerkPointsSpent();
                const totalEarned = getPerkPointsEarned();

                if (current === perkObj.perkPoints || totalSpent >= totalEarned) {
                    perkObj.currentPoints = perkObj.min ?? 0;
                } else {
                    perkObj.currentPoints = current + 1;
                }

                renderPerkGrid();
                updatePerkPointsDisplay();
            });

            row.appendChild(icon);
            row.appendChild(label);
            row.appendChild(dots);
            section.appendChild(row);
        });

        perkGrid.appendChild(section);
    });
    perkGrid.classList.add('hide-scrollbar');
}

// MARK: MISSION GRID
function renderMissionGrid() {
    missionGrid.innerHTML = '';

    staticData.forEach((difficultyObj) => {
        const section = createDiv('mission-section');
        const header = createDiv('mission-header', difficultyObj.name);
        section.appendChild(header);

        let rowAlternate = false;
        difficultyObj.missions.forEach((missionObj) => {
            const showMission = showAllPerksAndMissions || (!(missionObj.perfect ?? false));
            if (!showMission) return;
            const row = createDiv('mission-entry' + (rowAlternate ? ' alt' : ''), '', missionObj.id);
            rowAlternate = !rowAlternate;

            const toggle = createDiv('mission-toggle');
            toggle.classList.toggle('material-symbols-outlined', missionObj.perfect ?? false);
            const toggleClass = missionObj.perfectLock ? 'active' : 'new';
            toggle.classList.toggle(toggleClass, missionObj.perfect ?? false);
            toggle.textContent = missionObj.perfect ? 'trophy' : '▢';
            toggle.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                if (missionObj.perfectLock) return;
                missionObj.perfect = !missionObj.perfect;
                missionObj.stage = (missionObj.stage ?? 0) + (missionObj.perfect ? 1 : -1);
                missionObj.boss = (missionObj.boss ?? 0) + (missionObj.perfect ? 1 : -1);
                missionObj.newStage = missionObj.newStageSolo ? missionObj.newStage : !missionObj.newStage;
                missionObj.newBoss = missionObj.newBossSolo ? missionObj.newBoss : !missionObj.newBoss;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const label = createDiv('mission-label', settings.bossNames ? missionObj.bossName : missionObj.name);

            const countContainer = createDiv('mission-count-wrapper');

            const stageClasses = 'mission-count' + (missionObj.newStage ? ' new' : '');
            const stage = createDiv(stageClasses, missionObj.stage ?? 0);
            stage.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                missionObj.stage = (missionObj.stage ?? 0) + 1;
                missionObj.newStage = true;
                missionObj.newStageSolo = true;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const bossClasses = 'mission-count' + (missionObj.newBoss ? ' new' : '');
            const boss = createDiv(bossClasses, missionObj.boss ?? 0);
            boss.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                missionObj.boss = (missionObj.boss ?? 0) + 1;
                missionObj.newBoss = true;
                missionObj.newBossSolo = true;
                renderMissionGrid();
                updatePerkPointsDisplay();
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
}

// MARK: STATS GRID
function renderStatsGrid() {
    statsGrid.innerHTML = '';

}

function showTab(id) {
    document.querySelectorAll('.nav-button').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelector(`.nav-button[data-tab='${id}']`)?.classList.add('active');
}

try {
    renderPerkGrid();
    renderMissionGrid();
    renderEditButton();
} catch (e) {
    console.error('Render error:', e);
}


// MARK: CONFIRMATION
function showConfirmation(message, buttons, callback) {
    const backdrop = document.getElementById('confirm-panel-backdrop');
    const clone = backdrop.cloneNode(true);
    backdrop.replaceWith(clone);

    const actions = clone.querySelector('.confirm-actions');
    const messageBox = clone.querySelector('.confirm-message');
    messageBox.textContent = message;

    actions.innerHTML = '';

    buttons.forEach((button) => {
        actions.appendChild(button);
        button.onclick = () => {
            clone.classList.add('hidden');
            callback(button.textContent);
        };
    });

    clone.classList.remove('hidden');
}


window.showTab = showTab;
