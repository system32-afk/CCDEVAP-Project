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

function applyFilter(){
    const cabinSelect = document.getElementById('cabinSelect').value();

    fetch(`/api/flights?cabin=${cabin}`)
}

let selectedFlightNumber = null;

function openCancelModal(flightNumber){
    selectedFlightNumber = flightNumber;
    openModal("modal-cancel-flight");
}

async function confirmDeactivate(){

    const response = await fetch(
        `/admin-flights/${selectedFlightNumber}/deactivate`,
        {
            method: "PATCH"
        }
    );

    if(response.ok){
        location.reload();
    }else{
        alert("Unable to cancel flight.");
    }
}