function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function whenUserClicksOutside(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

function saveChangesModal() {
    closeModal('modal-edit');
    openModal('modal-edit-save');
}
