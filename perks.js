import { createUndoState, myStaticData, getPerkPointsAvailableAtDifficultyAndAbove, updateActionButtonsDisplay, updatePerkTabNotification, } from './main.js';
import { createDiv, createSpan } from './utils/dom.js';



const perkGrid = document.getElementById('perkGrid');
export function renderPerkGrid() {
    perkGrid.innerHTML = '';

    myStaticData.forEach((difficultyObj, difficultyIdx) => {
        const section = createDiv('perk-section');
        const headerText = createDiv('header', difficultyObj.name);
        const header = createDiv('header-wrapper');
        header.appendChild(headerText);

        // MARK: NOTIF DOT
        let currentDiffUnspent = 0;
        const diffUnspent = getPerkPointsAvailableAtDifficultyAndAbove(difficultyIdx, myStaticData, (val) => currentDiffUnspent = val);
        let diffDot = createSpan('perk-dot-notification alt');
        if (diffUnspent > 0) {
            diffDot.textContent = diffUnspent;
            diffDot.style.display = 'inline-block';
            if (currentDiffUnspent > 0) {
                diffDot.classList.remove('alt');
            }
        } else {
            diffDot.style.display = 'none';
        }
        header.appendChild(diffDot);

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

            // MARK: LABEL
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

            // MARK: DOTS
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

            // MARK: ROW CLICK
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