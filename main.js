import { perks } from "./perks.js";

const perkGrid = document.getElementById("perkGrid");
const missionGrid = document.getElementById("missionGrid");

// DOM Creation
function createDiv(className, textContent = "") {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = textContent;
    return el;
}

// PERKS

const perkData = perks.map((perkRow) => perkRow.map(() => 0));
const DIFFICULTY_COUNT = perks.length;

const missionCount = [2, 5, 5, 4, 4];
const missionData = missionCount.flatMap((count, diffIndex) =>
    Array(count)
        .fill()
        .map((_, i) => ({
            name: `D${diffIndex + 1} - Mission ${i + 1}`,
            stage: 0,
            boss: 0,
            perfect: false,
            difficulty: diffIndex + 1,
        }))
);

// PERK MATH
function getPerkPointsEarned() {
    return missionData.reduce((sum, m) => {
        let points = 0;
        if (m.perfect) points += 1;
        if (m.stage > 0) points += m.stage;
        if (m.boss > 0) points += m.boss;
        return sum + points;
    }, 0);
}

function getPerkPointsSpent() {
    return perkData.flat().reduce((a, b) => a + b, 0);
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
    perks.forEach((perkRow, difficultyIndex) => {
        const section = createDiv("perk-section");
        const header = createDiv(
            "perk-header",
            `Difficulty ${difficultyIndex + 1}`
        );
        section.appendChild(header);

        perkRow.forEach((perkObj, perkIndex) => {
            // const row = createDiv("perk-entry");
            const row = createDiv(
                "perk-entry" + (perkIndex % 2 === 1 ? " alt" : "")
            );

            const icon = createDiv("perk-icon");
            perkObj.icons.forEach((iconName) => {
                const i = createDiv("material-symbols-outlined", iconName);
                icon.appendChild(i);
            });
            const label = createDiv("perk-label", perkObj.label);
            if (perkData[difficultyIndex][perkIndex] === perkObj.perkPoints) {
                icon.classList.add("active");
                label.classList.add("active");
            }
            const dots = createDiv("perk-dots", perkObj.dots);
            for (let i = 0; i < perkObj.perkPoints; i++) {
                const dot = createDiv("perk-dot");
                if (i < perkData[difficultyIndex][perkIndex]) {
                    dot.classList.add("active");
                }
                dots.appendChild(dot);
            }

            row.onclick = () => {
                const current = perkData[difficultyIndex][perkIndex];
                const totalSpent = getPerkPointsSpent();
                const totalEarned = getPerkPointsEarned();

                if (current === perkObj.perkPoints || totalSpent >= totalEarned) {
                    perkData[difficultyIndex][perkIndex] = 0;
                } else {
                    perkData[difficultyIndex][perkIndex] = current + 1;
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

    for (
        let difficulty = 1;
        difficulty <= missionCount.length;
        difficulty++
    ) {
        const section = createDiv("mission-section");
        const header = createDiv(
            "mission-header",
            `Difficulty ${difficulty}`
        );
        section.appendChild(header);

        const missions = missionData.filter(
            (m) => m.difficulty === difficulty
        );
        missions.forEach((mission, index) => {
            const row = createDiv(
                "mission-entry" + (index % 2 === 1 ? " alt" : "")
            );

            const toggle = createDiv("mission-toggle");
            toggle.classList.toggle(
                "material-symbols-outlined",
                mission.perfect
            );
            toggle.classList.toggle("active", mission.perfect);
            toggle.textContent = mission.perfect ? "trophy" : "▢";
            toggle.onclick = () => {
                mission.perfect = !mission.perfect;
                renderMissionGrid();
                updatePerkPointsDisplay();
            };

            const label = createDiv("mission-label", mission.name);
            const countContainer = createDiv("mission-count");
            const stage = createDiv("count-button count-stage", mission.stage);
            stage.onclick = () => {
                mission.stage++;
                renderMissionGrid();
                updatePerkPointsDisplay();
            };
            const boss = createDiv("count-button count-boss", mission.boss);
            boss.onclick = () => {
                mission.boss++;
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
    }
}

function showTab(id) {
    document
        .querySelectorAll(".nav-button")
        .forEach((btn) => btn.classList.remove("active"));
    document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));

    // Activate the matching tab content
    document.getElementById(id).classList.add("active");

    // Activate the corresponding nav button
    // Match by data-tab attribute (safer than onclick string)
    document
        .querySelector(`.nav-button[data-tab="${id}"]`)
        ?.classList.add("active");
}

try {
    renderPerkGrid();
    renderMissionGrid();
} catch (e) {
    console.error("Render error:", e);
}

window.showTab = showTab;
