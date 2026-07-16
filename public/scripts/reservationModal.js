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

// ---- Status change confirmation (shared by admin dropdown + user cancel) ----

let pendingStatusChange = null;

function updateReservationStatus(selectElement, passengerId) {
    const previousStatus = selectElement.dataset.currentStatus;
    const newStatus = selectElement.value;

    if (newStatus === previousStatus) return;

    pendingStatusChange = {
        selectElement,
        passengerId,
        previousStatus,
        newStatus,
        endpoint: `/admin-reservations/passenger/${passengerId}/status`
    };

    const message = document.getElementById("modal-cancel-message");
    message.textContent = `Change this passenger's status from "${formatStatus(previousStatus)}" to "${formatStatus(newStatus)}"?`;

    openModal("modal-cancel");
}

function requestCancelReservation(passengerId, currentStatus) {
    if (currentStatus === "Cancelled") return; // already cancelled, nothing to do

    pendingStatusChange = {
        selectElement: null,
        passengerId,
        previousStatus: currentStatus,
        newStatus: "Cancelled",
        endpoint: `/reservations/passenger/${passengerId}/status`
    };

    const message = document.getElementById("modal-cancel-message");
    message.textContent = "Proceed with cancelling this reservation?";

    openModal("modal-cancel");
}

function cancelStatusChange() {
    if (pendingStatusChange && pendingStatusChange.selectElement) {
        pendingStatusChange.selectElement.value = pendingStatusChange.previousStatus;
    }
    pendingStatusChange = null;
    closeModal("modal-cancel");
}

async function confirmStatusChange() {
    if (!pendingStatusChange) return;

    const { selectElement, endpoint, newStatus, previousStatus } = pendingStatusChange;

    try {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error("Failed to update status");

        if (selectElement) {
            selectElement.classList.remove(getStatusClass(selectElement.dataset.currentStatus));
            selectElement.classList.add(getStatusClass(newStatus));
            selectElement.dataset.currentStatus = newStatus;
        } else {
            // no dropdown to patch on the user-facing card — just refresh from server
            await loadReservations();
        }
    } catch (err) {
        console.error("Error updating reservation status:", err);
        if (selectElement) selectElement.value = previousStatus;
        alert("Something went wrong updating the status. Please try again.");
    } finally {
        pendingStatusChange = null;
        closeModal("modal-cancel");
    }
}