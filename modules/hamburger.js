import { allTabsDropdown } from '../main.js';
import { createSpan } from '../utils/dom.js';

const landingPageIcon = document.getElementById('landing-page-icon');
function toggleScroll(enable) {
    if (enable) {
        // unlock:
        const scrollYValue = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollYValue || '0') * -1);
        allTabsDropdown.classList.remove('visible');
        landingPageIcon.textContent = 'keyboard_arrow_up';
    } else {
        // lock
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    }
}
export function toggleMenu(open = null) {
    const menuPanel = document.getElementById('menu-panel');
    const isVisible = menuPanel.classList.contains('visible');
    const shouldOpen = open === null ? !isVisible : open;
    toggleScroll(!shouldOpen);
    menuPanel.classList.toggle('visible', shouldOpen);
    const menuBackdrop = document.getElementById('menu-backdrop');
    menuBackdrop.classList.toggle('visible', shouldOpen);
}
export function createHamburgerButton(objectsToClick = []) {
    const hamburger = createSpan('top-bar-button');
    const hamburgerIcon = createSpan('material-symbols-outlined', 'menu');
    hamburger.appendChild(hamburgerIcon);
    const menuBackdrop = document.getElementById('menu-backdrop');
    hamburger.addEventListener('click', () => {
        toggleMenu();
        objectsToClick.forEach(obj => {
            obj.click();
        });
    });
    menuBackdrop.addEventListener('click', () => toggleMenu(false));
    return hamburger;
}