import { createDropdown } from './utils/dom.js';
const landingPage = document.getElementById('landing-page');

const pages = [
    {
        name: 'Ranks',
        tabs: ['Hero Ranking']
    },
    {
        name: 'DTM',
        tabs: ['Stats', 'Missions', 'Perks']
    },
];

// Generate a flat list of all tabs from all pages
const allTabs = pages.flatMap(page =>
    page.tabs.map(tab => ({
        page: page.name,
        tab: tab,
        label: `${page.name} - ${tab}`,
        value: `${page.name.toLowerCase()}-${tab.toLowerCase()}`
    }))
);

const allTabsDropdown = createDropdown(landingPage, allTabs);
landingPage.addEventListener('click', () => {
    allTabsDropdown.classList.toggle('landing');
});

