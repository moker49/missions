// MARK: DIV
export function createDiv(className, textContent = '', id = null) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = textContent;
    if (id !== null) el.id = id;
    return el;
}

// MARK: SPAN
export function createSpan(className, textContent = '') {
    const el = document.createElement('span');
    el.className = className;
    el.textContent = textContent;
    return el;
}

