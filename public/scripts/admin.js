const flightNumberField = $("#flightNumber-field");
const airlineField = $("#airline-field");
const originField = $("#origin-field");
const destinationField = $("#destination-field");
const logoNameField = $("#logoName-field");
const numOfLayoversField = $("#numOfLayovers-field");
const isActiveField = $("#isActive-field");
const departureDateField = $("#departureDate-field");
const departureTimeField = $("#departureTime-field");
const arrivalDateField = $("#arrivalDate-field");
const arrivalTimeField = $("#arrivalTime-field");

// cabins
const economyPriceField = $("#economy_price-field");
const economySeatsField = $("#economy_seats-field");
const premiumEconomyPriceField = $("#premium_economy_price-field");
const premiumEconomySeatsField = $("#premium_economy_seats-field");
const businessClassPriceField = $("#business_class_price-field");
const businessClassSeatsField = $("#business_class_seats-field");
const firstClassPriceField = $("#first_class_price-field");
const firstClassSeatsField = $("#first_class_seats-field");


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


async function openUpdateModal(flightNumber){

    try{
        const response = await fetch(`/api/flights/${flightNumber}`);

        if(!response.ok){
            alert("Unable to load Flight");
            return;
        }

        const flight = await response.json();
        // retrieves the data of selected flight number
        flightNumberField.val(flight.flightNumber);
        airlineField.val(flight.airline);
        originField.val(flight.origin);
        destinationField.val(flight.destination);
        logoNameField.val(flight.logoName);
        numOfLayoversField.val(flight.numOfLayovers);
        isActiveField.val(flight.isActive);
        departureDateField.val(new Date(flight.departureDate).toISOString().split("T")[0]);
        departureTimeField.val(flight.departureTime);
        arrivalDateField.val(new Date(flight.arrivalDate).toISOString().split("T")[0]);
        arrivalTimeField.val(flight.arrivalTime);

        economyPriceField.val(flight.cabin.economy.price);
        economySeatsField.val(flight.cabin.economy.seats);

        premiumEconomyPriceField.val(flight.cabin.premium_economy.price);
        premiumEconomySeatsField.val(flight.cabin.premium_economy.seats);

        businessClassPriceField.val(flight.cabin.business_class.price);
        businessClassSeatsField.val(flight.cabin.business_class.seats);

        firstClassPriceField.val(flight.cabin.first_class.price);
        firstClassSeatsField.val(flight.cabin.first_class.seats);

       
    }catch(error){
        console.log(error);
    }
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

async function updateFlightInformation(){
    var updatedFlightInfo = {
        airline: airlineField.val().trim(),
        origin: originField.val().trim(),
        destination: destinationField.val().trim(),
        logoName: logoNameField.val().trim(),
        numOfLayovers: numOfLayoversField.val().trim(),
        isActive: isActiveField.val().trim(),
        departureDate: departureDateField.val().trim(),
        departureTime: departureTimeField.val().trim(),
        arrivalDate: arrivalDateField.val().trim(),
        arrivalTime: arrivalTimeField.val().trim(),

        cabin: {
            economy: {
                price: economyPriceField.val(),
                seats: economySeatsField.val()
            },
            premium_economy:{
                price: premiumEconomyPriceField.val(),
                seats: premiumEconomySeatsField.val()
            },
            business_class:{
                price: businessClassPriceField.val(),
                seats: businessClassSeatsField.val()
            },
            first_class: {
                price: firstClassPriceField.val(),
                seats: firstClassSeatsField.val()
            }
        }
    };

    const flightNumber = flightNumberField.val();
    try{
        const response = await fetch(`/admin-flights/${flightNumber}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFlightInfo)
        });

        if(response.ok){
            alert("Flight updated successfully");

            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-update-flight'));

            if(modal){
                modal.hide();
            }
            location.reload;
        }
    }catch(error){
        console.error("ERROR UPDATING FLIGHT DETAILS");
    }

}