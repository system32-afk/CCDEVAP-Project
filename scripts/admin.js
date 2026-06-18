function saveFlightModal() {
    closeModal('modal-edit-flight');
    openModal('modal-edit-save');
}

document.querySelectorAll(".status-select").forEach(select => {
    updateStatusClass(select);

    select.addEventListener("change", () => {
        updateStatusClass(select);
    });
});

function updateStatusClass(select) {
    select.classList.remove("confirmed", "pending", "cancelled");
    select.classList.add(select.value);
}
