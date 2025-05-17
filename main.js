import { staticData } from "./staticData.js";

const perkGrid = document.getElementById("perkGrid");
const missionGrid = document.getElementById("missionGrid");

// DOM Creation
function createDiv(className, textContent = "") {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = textContent;
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

function updatePerkPointsDisplay() {
    const earned = getPerkPointsEarned();
    const spent = getPerkPointsSpent();
    document.getElementById(
        "perkPointsDisplay"
    ).textContent = `${spent} / ${earned}`;
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

            row.onclick = () => {
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
            };

            row.appendChild(icon);
            row.appendChild(label);
            row.appendChild(dots);
            section.appendChild(row);
        });

        perkGrid.appendChild(section);
    });
}

// MISSION GRID
function renderMissionGrid() {
    missionGrid.innerHTML = "";

    staticData.forEach(({ difficulty, missions }) => {
        const section = createDiv("mission-section");
        const header = createDiv("mission-header", `Difficulty ${difficulty}`);
        section.appendChild(header);

        missions.forEach((mission, index) => {
            const row = createDiv("mission-entry" + (index % 2 === 1 ? " alt" : ""));

            const toggle = createDiv("mission-toggle");
            toggle.classList.toggle("material-symbols-outlined", mission.perfect ?? false);
            toggle.classList.toggle("active", mission.perfect ?? false);
            toggle.textContent = mission.perfect ? "trophy" : "▢";
            toggle.onclick = () => {
                mission.perfect = !mission.perfect;
                renderMissionGrid();
                updatePerkPointsDisplay();
            };

            const label = createDiv("mission-label", mission.name);

            const countContainer = createDiv("mission-count");

            const stage = createDiv("count-button count-stage", mission.stage ?? 0);
            stage.onclick = () => {
                mission.stage = (mission.stage ?? 0) + 1;
                renderMissionGrid();
                updatePerkPointsDisplay();
            };

            const boss = createDiv("count-button count-boss", mission.boss ?? 0);
            boss.onclick = () => {
                mission.boss = (mission.boss ?? 0) + 1;
                renderMissionGrid();
                updatePerkPointsDisplay();
            };

            countContainer.appendChild(stage);
            countContainer.appendChild(boss);

            row.appendChild(toggle);
            row.appendChild(label);
            row.appendChild(countContainer);

            section.appendChild(row);
        });

        missionGrid.appendChild(section);
    });
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
} catch (e) {
    console.error("Render error:", e);
}

window.showTab = showTab;
