import { staticData } from "./staticData.js";

const perkGrid = document.getElementById("perkGrid");
const missionGrid = document.getElementById("missionGrid");
let staticDataBackup = null;

// DOM Creation
function createDiv(className, textContent = "") {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = textContent;
    return el;
}


// Chrome Mobile Workaround
function chromeMobileWorkaraound(object) {
    object.addEventListener('click', () => {
        const chromeMobileWorkaround = 49;
        if (chromeMobileWorkaround < 50) {
            chromeMobileWorkaround = 49;
        }
    })
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
const undoButton = document.createElement('button');
undoButton.className = 'undo-button material-symbols-outlined';
undoButton.textContent = 'undo';
undoButton.style.display = 'none';
document.body.appendChild(undoButton);
undoButton.addEventListener('click', () => {
    if (staticDataBackup) {
        Object.assign(staticData, JSON.parse(JSON.stringify(staticDataBackup)));
        renderPerkGrid();
        renderMissionGrid();
        updatePerkPointsDisplay();
    }
    undoButton.style.display = 'none';
});

// EDITING
const editButton = document.getElementById('editToggle');
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
        } else if (getPerkPointsSpent() === getPerkPointsEarned()) {
            isEditing = false;
            app.classList.remove('editing');
            icon.style.display = '';
            pointsText.style.display = 'none';
            icon.textContent = 'edit';
            undoButton.style.display = 'none';
        }
    });
    chromeMobileWorkaraound(pointsText);
}

// PERK GRID
function renderPerkGrid() {
    perkGrid.innerHTML = "";
    staticData.forEach((difficultyObj) => {
        const section = createDiv("perk-section");
        const header = createDiv("perk-header", difficultyObj.name);
        section.appendChild(header);

        difficultyObj.perks.forEach((perkObj, perkIndex) => {
            const row = createDiv("perk-entry" + (perkIndex % 2 === 1 ? " alt" : ""));

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
            chromeMobileWorkaraound(row);

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

        difficultyObj.missions.forEach((mission, index) => {
            const row = createDiv("mission-entry" + (index % 2 === 1 ? " alt" : ""));
            chromeMobileWorkaraound(row);

            const toggle = createDiv("mission-toggle");
            toggle.classList.toggle("material-symbols-outlined", mission.perfect ?? false);
            toggle.classList.toggle("active", mission.perfect ?? false);
            toggle.textContent = mission.perfect ? "trophy" : "▢";
            toggle.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                mission.perfect = !mission.perfect;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const label = createDiv("mission-label", mission.name);

            const countContainer = createDiv("mission-count");

            const stage = createDiv("count-button count-stage", mission.stage ?? 0);
            stage.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                mission.stage = (mission.stage ?? 0) + 1;
                renderMissionGrid();
                updatePerkPointsDisplay();
            });

            const boss = createDiv("count-button count-boss", mission.boss ?? 0);
            boss.addEventListener('click', () => {
                if (!document.getElementById('app').classList.contains('editing')) return;
                mission.boss = (mission.boss ?? 0) + 1;
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
