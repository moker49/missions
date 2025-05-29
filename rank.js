import { createHamburgerButton } from "./modules/hamburger.js";
import { createDiv } from "./utils/dom.js";
import { heros, getHeroById } from "./data/heros.js";
import { deepMerge } from './utils/deepMerge.js';

// Global variables
let myHeros = null;

// LOAD
const rawLoadedData = localStorage.getItem('myHeros');
if (rawLoadedData) {
    try {
        const parsed = JSON.parse(rawLoadedData);
        const mergedData = deepMerge(heros, parsed);
        myHeros = mergedData;
    } catch (e) {
        console.error('Failed to parse or merge saved staticData, loading default...', e);
        myHeros = JSON.parse(JSON.stringify(heros));
    }
} else {
    myHeros = JSON.parse(JSON.stringify(heros));
}

// HAMBURGER
const topBar = document.getElementById('top-bar-hero-ranking');
const topBarTitle = topBar.childNodes[0];
const hamburger = createHamburgerButton();
topBar.insertBefore(hamburger, topBarTitle);

// MARK: RENDER
const rankGrid = document.getElementById('rankGrid');
const defaultOrderHeros = Object.values(myHeros).flat();
const sortedHeros = defaultOrderHeros.sort((a, b) => {
    const aSort = a.mySort ?? a.defaultSort;
    const bSort = b.mySort ?? b.defaultSort;
    return aSort - bSort;
});

function renderRankGrid() {
    rankGrid.innerHTML = '';
    const section = createDiv('rank-section');
    let rowAlternate = true;

    sortedHeros.forEach((heroObj, idx) => {
        const row = createDiv('rank-entry' + (rowAlternate ? ' alt' : ''), '', 'rank_' + heroObj.id);
        rowAlternate = !rowAlternate;
        row.draggable = false; // We'll handle drag manually
        row.dataset.idx = idx;
        row.classList.toggle('rank-updated', heroObj.updated ?? false);

        const rankIconWrapper = createDiv('rank-icon');
        const rankIcon = createDiv('material-symbols-outlined', 'fiber_manual_record');
        rankIconWrapper.appendChild(rankIcon);
        row.appendChild(rankIconWrapper);

        const label = createDiv('rank-label', heroObj.name);
        row.appendChild(label);

        const rankHandleWrapper = createDiv('rank-handle');
        rankHandleWrapper.addEventListener('mousedown', (e) => {
            e.preventDefault();
            lockScroll();
            startDragRow(row, idx, section, e);
        });
        rankHandleWrapper.addEventListener('touchstart', (e) => {
            lockScroll();
            startDragRow(row, idx, section, e.touches[0]);
        });
        const rankHandleIcon = createDiv('material-symbols-outlined', 'drag_handle');
        rankHandleWrapper.appendChild(rankHandleIcon);
        row.appendChild(rankHandleWrapper);

        section.appendChild(row);
    });
    rankGrid.appendChild(section);
    rankGrid.classList.add('hide-scrollbar');
}

// MARK: DRAG AND DROP
function startDragRow(row, idx, section, e) {
    let draggingIdx = idx;
    let lastTargetIdx = idx;

    row.classList.add('ghost-row');
    lockScroll();

    function moveAt(clientY) {
        // Always get the current rows to reflect DOM changes
        const rows = Array.from(section.children);

        // Snap as soon as we cross a row's top border
        let targetIdx = rows.findIndex(r => {
            const rect = r.getBoundingClientRect();
            return clientY < rect.top;

        });
        if (targetIdx === -1) targetIdx = rows.length;

        let insertIdx = targetIdx;

        if (insertIdx !== lastTargetIdx) {
            if (insertIdx < lastTargetIdx) {
                insertIdx--;
            }
            // Move the row to the new position
            if (insertIdx < section.children.length) {
                section.insertBefore(row, section.children[insertIdx]);
            } else {
                section.appendChild(row);
            }
            lastTargetIdx = insertIdx;
        }
    }

    function onMove(ev) {
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        moveAt(clientY);
    }

    function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);

        row.classList.remove('ghost-row');
        const myHero = getHeroById(row.id.replace('rank_', ''), myHeros);
        myHero.updated = true;
        unlockScroll();

        // Find the new index of the row
        const newIdx = Array.from(section.children).indexOf(row);

        // Update order and re-render
        if (newIdx !== draggingIdx && newIdx !== -1) {
            const moved = sortedHeros.splice(draggingIdx, 1)[0];
            sortedHeros.splice(newIdx, 0, moved);
        }

        // Update mySort for all hero objects in myHeros
        const newOrder = Array.from(section.children).map(r => r.id.replace('rank_', ''));
        let sortValue = 1;
        for (const id of newOrder) {
            const hero = getHeroById(id, myHeros);
            if (hero) hero.mySort = sortValue++;
        }

        renderRankGrid();
        localStorage.setItem('myHeros', JSON.stringify(myHeros));
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp, { passive: false });

    moveAt(e.clientY);
}

function lockScroll() {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.dataset.scrollY = scrollY;
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
}

function unlockScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    window.scrollTo(0, scrollY);
    delete document.body.dataset.scrollY;
    window.removeEventListener('wheel', preventScroll, { passive: false });
    window.removeEventListener('touchmove', preventScroll, { passive: false });
}

function preventScroll(e) {
    e.preventDefault();
}

renderRankGrid();