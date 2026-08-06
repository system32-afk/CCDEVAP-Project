// Opens the selected modal
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// Closes the selected modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Closes the modal if the user clicks outside of it
function whenUserClicksOutside(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// Shows the confirmation modal after saving changes
function saveChangesModal() {
    closeModal('modal-edit');
    openModal('modal-edit-save');
}

let pendingStatusChange = null;

// Handles status changes made from the admin page
function updateReservationStatus(selectElement, passengerId) {
    const previousStatus = selectElement.dataset.currentStatus;
    const newStatus = selectElement.value;

    if (newStatus === previousStatus) return;

    pendingStatusChange = {
        selectElement,
        passengerId,
        previousStatus,
        newStatus,
        endpoint: `/admin/admin-reservations/passenger/${passengerId}/status`
    };

    const message = document.getElementById("modal-cancel-message");
    message.textContent = `Change this passenger's status from "${formatStatus(previousStatus)}" to "${formatStatus(newStatus)}"?`;

    openModal("modal-cancel");
}

function requestCancelReservation(passengerId, currentStatus) {
    if (currentStatus === "Cancelled") return;

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

// Cancels the pending status change
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
            // Update the dropdown without reloading the page
            selectElement.classList.remove(getStatusClass(selectElement.dataset.currentStatus));
            selectElement.classList.add(getStatusClass(newStatus));
            selectElement.dataset.currentStatus = newStatus;

            const row = selectElement.closest("tr");
            const editButton = row?.querySelector(".edit-button");
            if (editButton) {
                editButton.disabled = newStatus === "cancelled";
            }
        } else {
            await loadReservations();
        }
    } catch (err) {
        console.error("Error updating reservation status:", err);

        if (selectElement) {
            selectElement.value = previousStatus;
        }

        alert("Something went wrong updating the status. Please try again.");
    } finally {
        pendingStatusChange = null;
        closeModal("modal-cancel");
    }
}