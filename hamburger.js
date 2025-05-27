function createButton(className, textContent = '') {
    const el = document.createElement('button');
    el.className = className;
    el.textContent = textContent;
    return el;
}
function createSpan(className, textContent = '') {
    const el = document.createElement('span');
    el.className = className;
    el.textContent = textContent;
    return el;
}

// Export a function to create a hamburger button and wire up menu logic
export function createHamburgerButton() {
    const hamburger = createButton('top-bar-button');
    const hamburgerIcon = createSpan('material-symbols-outlined', 'menu');
    hamburger.appendChild(hamburgerIcon);

    const menuPanel = document.getElementById('menu-panel');
    const menuBackdrop = document.getElementById('menu-backdrop');

    function toggleMenu(open = null) {
        const isVisible = menuPanel.classList.contains('visible');
        const shouldOpen = open === null ? !isVisible : open;
        toggleScroll(!shouldOpen);
        menuPanel.classList.toggle('visible', shouldOpen);
        menuBackdrop.classList.toggle('visible', shouldOpen);
    }
    hamburger.addEventListener('click', () => toggleMenu());
    menuBackdrop.addEventListener('click', () => toggleMenu(false));
    function toggleScroll(enable) {
        if (enable) {
            // unlock:
            const scrollYValue = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollYValue || '0') * -1);
        } else {
            // lock
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        }
    }

    return hamburger;
}