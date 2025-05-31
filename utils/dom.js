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
export function createCheckbox(topLevelClass, labelText, parent, checked = false) {
    const container = createDiv(topLevelClass);
    const label = createDiv('label', labelText);
    const checkbox = createDiv(' material-symbols-outlined', checked ? 'check_box' : 'check_box_outline_blank');
    container.appendChild(label);
    container.appendChild(checkbox);
    parent.appendChild(container);
    return container;
}

export function createDropdown(parent, options, selectedIndex = 0) {
    // Use a standard <select> element
    const select = document.createElement('div');
    select.className = 'dropdown-options';
    options.forEach((option, index) => {
        const opt = document.createElement('span');
        opt.classList.add('dropdown-option');
        opt.value = option.value;
        opt.textContent = option.label;
        if (index === selectedIndex) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
    parent.appendChild(select);
    return select;
}