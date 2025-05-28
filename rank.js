import { createHamburgerButton } from "./modules/hamburger.js";
import { createDiv } from "./utils/dom.js";
import { heros } from "./data/heros.js";

// HAMBURGER
const topBar = document.getElementById('top-bar-hero-ranking');
const topBarTitle = topBar.childNodes[0];
const hamburger = createHamburgerButton();
topBar.insertBefore(hamburger, topBarTitle);

// RANK GRID
const rankGrid = document.getElementById('rankGrid');
function renderRankGrid() {
    rankGrid.innerHTML = '';

    const section = createDiv('rank-section');

    let rowAlternate = true;
    Object.values(heros).flat().forEach((heroObj) => {
        const row = createDiv('rank-entry' + (rowAlternate ? ' alt' : ''), '');
        rowAlternate = !rowAlternate;

        const icon = createDiv('rank-icon');
        const i = createDiv('material-symbols-outlined', 'fiber_manual_record');
        icon.appendChild(i);
        row.appendChild(icon);

        const label = createDiv('rank-label', heroObj.name);
        row.appendChild(label);

        section.appendChild(row);
    });
    rankGrid.appendChild(section);
    rankGrid.classList.add('hide-scrollbar');
}
renderRankGrid();