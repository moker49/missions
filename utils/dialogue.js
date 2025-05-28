// MARK: CONFIRMATION
export function showConfirmation(message, buttons, callback) {
    const backdrop = document.getElementById('confirm-panel-backdrop');
    const clone = backdrop.cloneNode(true);
    backdrop.replaceWith(clone);

    const actions = clone.querySelector('.confirm-actions');
    const messageBox = clone.querySelector('.confirm-message');
    messageBox.textContent = message;

    actions.innerHTML = '';

    buttons.forEach((button) => {
        actions.appendChild(button);
        button.onclick = () => {
            clone.classList.add('hidden');
            callback(button.textContent);
        };
    });

    clone.classList.remove('hidden');
}