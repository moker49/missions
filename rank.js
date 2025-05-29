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
let currentOrder = Object.values(heros).flat(); // Keep track of current order

function renderRankGrid() {
    rankGrid.innerHTML = '';
    const section = createDiv('rank-section');
    let rowAlternate = true;

    currentOrder.forEach((heroObj, idx) => {
        const row = createDiv('rank-entry' + (rowAlternate ? ' alt' : ''), '', 'rank_' + heroObj.id);
        rowAlternate = !rowAlternate;
        row.draggable = false; // We'll handle drag manually
        row.dataset.idx = idx;

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
        unlockScroll();

        // Find the new index of the row
        const newIdx = Array.from(section.children).indexOf(row);

        // Update order and re-render
        if (newIdx !== draggingIdx && newIdx !== -1) {
            const moved = currentOrder.splice(draggingIdx, 1)[0];
            currentOrder.splice(newIdx, 0, moved);
        }
        renderRankGrid();
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