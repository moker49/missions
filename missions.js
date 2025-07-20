import { createDiv } from './utils/dom.js';
import { createUndoState, myStaticData, updateActionButtonsDisplay, updatePerkTabNotification } from './main.js';
import { settings } from './data/settings.js';


const missionGrid = document.getElementById('missionGrid');
export function renderMissionGrid(minPrestige) {
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


            // MARK: TOGGLE
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

            // MARK: STAGE
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

            // MARK: BOSS
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