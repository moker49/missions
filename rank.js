import { createHamburgerButton } from "./modules/hamburger.js";

// MARK: HAMBURGER
const topBar = document.getElementById('top-bar-hero-ranking');
const topBarTitle = topBar.childNodes[0];
const hamburger = createHamburgerButton();
topBar.insertBefore(hamburger, topBarTitle);