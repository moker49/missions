import { staticData } from "./staticData.js";

const perkGrid = document.getElementById("perkGrid");
const missionGrid = document.getElementById("missionGrid");
let staticDataBackup = null;

// DOM Creation
function createDiv(className, textContent = "", id = null) {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = textContent;
    el.id = id;
    return el;
}

// PERK MATH
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

// UNDO BUTTON
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

// // RESET BUTTON
// const resetButton = document.createElement('button');
// resetButton.className = 'reset-button button-negative material-symbols-outlined';
// resetButton.textContent = 'delete';
// resetButton.style.display = 'none';
// document.body.appendChild(resetButton);
// resetButton.addEventListener('click', () => {
//     staticData.forEach((difficultyObj) => {
//         difficultyObj.perks.forEach((perk) => {
//             perk.currentPoints = 0;
//         });
//         difficultyObj.missions.forEach((mission) => {
//             mission.perfect = false;
//             mission.stage = 0;
//             mission.boss = 0;
//         });
//     });
//     renderPerkGrid();
//     renderMissionGrid();
//     updatePerkPointsDisplay();
//     resetButton.style.display = 'none';
// });

// TOGGLE FILTER BUTTON
const filterButton = document.getElementById('filter-toggle');
let allPerksVisible = true;

filterButton.addEventListener('click', () => {
    allPerksVisible = !allPerksVisible;
    filterButton.children[0].textContent = allPerksVisible ? 'filter_list' : 'filter_list_off';

    staticData.forEach((difficultyObj) => {
        // === TOGGLE PERKS ===
        difficultyObj.perks.forEach((perkObj) => {
            const perkEl = document.getElementById(perkObj.id);
            const isUnlocked = perkObj.currentPoints ?? 0 === perkObj.perkPoints;
            perkEl.classList.toggle('hidden', !allPerksVisible && !isUnlocked);
        });
        // === TOGGLE MISSIONS ===
        difficultyObj.missions.forEach((missionObj) => {
            const missionEl = document.getElementById(missionObj.id);
            missionEl.classList.toggle('hidden', !allPerksVisible && (missionObj.perfect ?? false));
        });
    });
});

// EDITING
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
    } else {
        icon.style.display = '';
        icon.textContent = 'save';
        pointsText.style.display = 'none';
        editButton.disabled = false;
    }
    editButton.classList.toggle("button-secondary", spent !== available);
}
function renderEditButton() {
    const app = document.getElementById('app');
    let isEditing = false;

    editButton.addEventListener('click', () => {
        if (!isEditing) {
            isEditing = true;
            app.classList.add('editing');
            updatePerkPointsDisplay();
            staticDataBackup = JSON.parse(JSON.stringify(staticData));
            if (!allPerksVisible) {
                filterButton.click();
            }
        } else if (getPerkPointsSpent() === getPerkPointsEarned()) {
            isEditing = false;
            app.classList.remove('editing');
            icon.style.display = '';
            pointsText.style.display = 'none';
            icon.textContent = 'edit';
            undoButton.style.display = 'none';
        }
        filterButton.classList.toggle('hidden', isEditing);
        // resetButton.style.display = isEditing ? 'block' : 'none';
    });
}

// PERK GRID
function renderPerkGrid() {
    perkGrid.innerHTML = "";
    staticData.forEach((difficultyObj) => {
        const section = createDiv("perk-section");
        const header = createDiv("perk-header", difficultyObj.name);
        section.appendChild(header);

        difficultyObj.perks.forEach((perkObj, perkIndex) => {
            const row = createDiv("perk-entry" + (perkIndex % 2 === 1 ? " alt" : ""), '', perkObj.id);

            const icon = createDiv("perk-icon");
            perkObj.icons.forEach((iconName) => {
                const i = createDiv("material-symbols-outlined", iconName);
                icon.appendChild(i);
            });

            const label = createDiv("perk-label", perkObj.label);
            if ((perkObj.currentPoints ?? 0) === perkObj.perkPoints) {
                icon.classList.add("active");
                label.classList.add("active");
            }

            const dots = createDiv("perk-dots");
            for (let i = 0; i < perkObj.perkPoints; i++) {
                const dot = createDiv("perk-dot");
                if (i < (perkObj.currentPoints ?? 0)) {
                    dot.classList.add("active");
                }
                dots.appendChild(dot);
            }

            row.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                const current = perkObj.currentPoints ?? 0;
                const totalSpent = getPerkPointsSpent();
                const totalEarned = getPerkPointsEarned();

                if (current === perkObj.perkPoints || totalSpent >= totalEarned) {
                    perkObj.currentPoints = 0;
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
    perkGrid.classList.add("hide-scrollbar");
}

// MISSION GRID
function renderMissionGrid() {
    missionGrid.innerHTML = "";

    staticData.forEach((difficultyObj) => {
        const section = createDiv("mission-section");
        const header = createDiv("mission-header", difficultyObj.name);
        section.appendChild(header);

        difficultyObj.missions.forEach((missionObj, missionIndex) => {
            const row = createDiv("mission-entry" + (missionIndex % 2 === 1 ? " alt" : ""), '', missionObj.id);

            const toggle = createDiv("mission-toggle");
            toggle.classList.toggle("material-symbols-outlined", missionObj.perfect ?? false);
            toggle.classList.toggle("active", missionObj.perfect ?? false);
            toggle.textContent = missionObj.perfect ? "trophy" : "▢";
            toggle.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                missionObj.perfect = !missionObj.perfect;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const label = createDiv("mission-label", missionObj.name);

            const countContainer = createDiv("mission-count");

            const stage = createDiv("count-button count-stage", missionObj.stage ?? 0);
            stage.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                missionObj.stage = (missionObj.stage ?? 0) + 1;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const boss = createDiv("count-button count-boss", missionObj.boss ?? 0);
            boss.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                missionObj.boss = (missionObj.boss ?? 0) + 1;
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
    missionGrid.classList.add("hide-scrollbar");
}

function showTab(id) {
    document.querySelectorAll(".nav-button").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelector(`.nav-button[data-tab="${id}"]`)?.classList.add("active");
}

try {
    renderPerkGrid();
    renderMissionGrid();
    renderEditButton();
} catch (e) {
    console.error("Render error:", e);
}

window.showTab = showTab;
