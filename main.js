import { settings } from './data/settings.js';
import { deepMerge } from './utils/deepMerge.js';
import { createDropdown } from './utils/dom.js';

// MARK: TAB SWITCHING
const menuItems = document.querySelectorAll('.menu-item');
const menuBackdrop = document.getElementById('menu-backdrop');
const tabGroups = {
    'dice-throne-missions': {
        topBar: document.getElementById('top-bar-dice-throne-missions'),
        tabs: document.getElementById('dtm-tabs')
    },
    'hero-ranking': {
        topBar: document.getElementById('top-bar-hero-ranking'),
        tabs: document.getElementById('rank-tabs')
    }
};
let currentMenu = 'dice-throne-missions';
menuItems.forEach(item => {
    item.addEventListener('click', (event) => {
        // Prevent menu switch if a quick-action was clicked
        if (event.target.closest('.quick-action')) {
            event.stopPropagation();
            return;
        }
        const id = item.id;
        if (!tabGroups[id]) return;
        // Hide all
        Object.values(tabGroups).forEach(g => {
            g.topBar.style.display = 'none';
            g.tabs.style.display = 'none';
        });
        // Show selected
        tabGroups[id].topBar.style.display = '';
        tabGroups[id].tabs.style.display = '';
        currentMenu = id;
        menuBackdrop.click();
        updateNavVisibility(tabGroups[id].tabs);
    });
});

// --- Nav visibility logic ---
function updateNavVisibility(tabGroup) {
    const nav = tabGroup.querySelector('.nav');
    if (!nav) return;
    const tabCount = tabGroup.querySelectorAll('.tab-content').length;
    nav.style.display = tabCount > 1 ? '' : 'none';
}
Object.values(tabGroups).forEach(g => updateNavVisibility(g.tabs));

// --- Tab switching logic ---
const showTab = function (tabId, tabGroupId) {
    const groupId = tabGroupId || (currentMenu === 'hero-ranking' ? 'rank-tabs' : 'dtm-tabs');
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    group.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    const navBtn = group.querySelector(`.nav-button[data-tab='${tabId}']`);
    if (navBtn) navBtn.classList.add('active');
};

// Add event listeners for nav buttons to handle tab switching
document.querySelectorAll('.nav-button').forEach(btn => {
    btn.addEventListener('click', function () {
        const tabId = btn.getAttribute('data-tab');
        // Determine which tab group this button belongs to
        const nav = btn.closest('.nav');
        const tabGroup = nav.closest('.tab-group');
        showTab(tabId, tabGroup.id);
    });
});

// MARK: SETTINGS
const tabs = [
    {
        value: 'rankTab',
        label: 'Hero Ranking',
    },
    {
        value: 'statsTab',
        label: 'Stats',
    },
    {
        value: 'missionTab',
        label: 'Missions',
    },
    {
        value: 'perkTab',
        label: 'Perks',
    },
];
const rawLoadedSettings = localStorage.getItem('settings');
if (rawLoadedSettings) {
    try {
        const loadedSettings = JSON.parse(rawLoadedSettings);
        const mergedSettings = deepMerge(settings, loadedSettings);
        Object.assign(settings, mergedSettings);
    } catch (e) {
        console.error('Failed to parse saved settings:', e);
    }
}
const landingPageLabel = document.getElementById('landing-page-label');
if (settings.defaultTabId) {
    // Find which menu group contains the default tab
    for (const [menuId, group] of Object.entries(tabGroups)) {
        if (group.tabs.querySelector(`#${settings.defaultTabId}`)) {
            // Hide all groups
            Object.values(tabGroups).forEach(g => {
                g.topBar.style.display = 'none';
                g.tabs.style.display = 'none';
            });
            // Show the correct group
            group.topBar.style.display = '';
            group.tabs.style.display = '';
            currentMenu = menuId;
            updateNavVisibility(group.tabs);
            // Activate the tab
            showTab(settings.defaultTabId, group.tabs.id);

            break;
        }
    }
    landingPageLabel.textContent = 'Landing: ' + (tabs.find(tab => tab.value === settings.defaultTabId)?.label || 'Stats');
}

const landingPage = document.getElementById('landing-page');
const landingPageIcon = document.getElementById('landing-page-icon');
export const allTabsDropdown = createDropdown('landing-options', landingPage, tabs);
landingPage.addEventListener('click', () => {
    allTabsDropdown.classList.toggle('visible');
    landingPageIcon.textContent = allTabsDropdown.classList.contains('visible') ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
});
allTabsDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const option = e.target;
    if (option.classList.contains('dropdown-option')) {
        landingPageLabel.textContent = 'Landing: ' + option.textContent;
        allTabsDropdown.classList.remove('visible');
        settings.defaultTabId = option.value;
        landingPageIcon.textContent = 'keyboard_arrow_down';
        localStorage.setItem('settings', JSON.stringify(settings));
    }
});

