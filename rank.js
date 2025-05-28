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
        const row = createDiv('rank-entry' + (rowAlternate ? ' alt' : ''), '', 'rank_' + heroObj.id);
        rowAlternate = !rowAlternate;

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
            dragRow(row, e, false); // false = not touch
        });
        rankHandleWrapper.addEventListener('touchstart', (e) => {
            e.preventDefault();
            lockScroll();
            dragRow(row, e.touches[0], true); // true = touch
            insertGhostRow(row, section);
        });
        const rankHandleIcon = createDiv('material-symbols-outlined', 'drag_handle');
        rankHandleWrapper.appendChild(rankHandleIcon);
        row.appendChild(rankHandleWrapper);

        section.appendChild(row);
    });
    rankGrid.appendChild(section);
    rankGrid.classList.add('hide-scrollbar');
}

function insertGhostRow(originalRow, section) {
    const ghostRow = originalRow.cloneNode(true);
    ghostRow.id = originalRow.id + '-ghost';
    section.insertBefore(ghostRow, originalRow);
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

function dragRow(row, e, isTouch) {
    // Get initial rect
    const rect = row.getBoundingClientRect();

    // Set fixed positioning for dragging (relative to viewport)
    row.style.position = 'fixed';
    row.style.width = rect.width + 'px';
    row.style.left = rect.left + 'px';
    row.style.top = rect.top + 'px';
    row.style.zIndex = 1000;

    // Calculate offset between pointer and row top
    const pointerY = e.clientY;
    const offsetWithinRow = pointerY - rect.top;

    function moveHandler(moveEvent) {
        const clientY = isTouch
            ? (moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY)
            : moveEvent.clientY;
        // Move row so the pointer stays at the same offset within the row
        row.style.top = (clientY - offsetWithinRow) + 'px';
    }

    function upHandler() {
        if (isTouch) {
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', upHandler);
        } else {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        }
        // Restore styles
        row.style.position = '';
        row.style.top = '';
        row.style.left = '';
        row.style.width = '';
        row.style.zIndex = '';
        unlockScroll();

        // kill ghost row if it exists
        const ghostRow = document.getElementById(row.id + '-ghost');
        if (ghostRow) {
            ghostRow.remove();
        }
    }

    if (isTouch) {
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', upHandler, { passive: false });
    } else {
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }
}
renderRankGrid();