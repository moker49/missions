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

// MARK: CHECKBOX
export function createCheckbox(className, parent, checked = false) {
    const checkbox = document.createElement('div');
    checkbox.type = 'checkbox';
    checkbox.className = className;
    checkbox.checked = checked;
    parent.appendChild(checkbox);
    return checkbox;
}

