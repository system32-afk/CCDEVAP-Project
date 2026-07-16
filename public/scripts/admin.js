const flightNumberField = $("#update-flightNumber-field");
const airlineField = $("#update-airline-field");
const originField = $("#update-origin-field");
const destinationField = $("#update-destination-field");
const logoNameField = $("#update-logoName-field");
const numOfLayoversField = $("#update-numOfLayovers-field");
const isActiveField = $("#update-isActive-field");
const departureDateField = $("#update-departureDate-field");
const departureTimeField = $("#update-departureTime-field");
const arrivalDateField = $("#update-arrivalDate-field");
const arrivalTimeField = $("#update-arrivalTime-field");

// cabins
const economyPriceField = $("#update-economy_price-field");
const economySeatsField = $("#update-economy_seats-field");
const premiumEconomyPriceField = $("#update-premium_economy_price-field");
const premiumEconomySeatsField = $("#update-premium_economy_seats-field");
const businessClassPriceField = $("#update-business_class_price-field");
const businessClassSeatsField = $("#update-business_class_seats-field");
const firstClassPriceField = $("#update-first_class_price-field");
const firstClassSeatsField = $("#update-first_class_seats-field");

let currentFlightId;

const airlineNameField = $("#update-airlineName-field");
const isAirlineActiveField= $("#update-isAirlineActive-field");
let currentAirlineId  = null;

const cityNameField = $("#update-cityName-field");
let currentCityId = null;

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

// gets all data attributes to show each cabin
function applyFilter() {
    const cabin = document.getElementById("cabinSelect").value;

    document.querySelectorAll("tbody tr").forEach(row => {
        row.querySelector(".cabin-label").textContent =
            row.querySelector(".cabin-label").dataset[cabin];

        row.querySelector(".cabin-price").textContent =
            row.querySelector(".cabin-price").dataset[cabin];

        row.querySelector(".cabin-seats").textContent =
            row.querySelector(".cabin-seats").dataset[cabin];
    });
}


function openCancelModal(id){
    currentFlightId = id;
    openModal("modal-cancel-flight");
}
// displays the data of the document with the selected city id

async function openUpdateCityModal(id){
    try{
        currentCityId = id;

        const response = await fetch(`/api/cities/${id}`);

        if(!response.ok){
            alert("Unable to load City");
            return;
        }
        const city = await response.json();

        cityNameField.val(city.cityName);        
    }catch(err){
        console.log(error);
    }
}
// PUTS the updated information in the document of the selected city
async function updateCityInformation(){
    var updatedCityInfo ={
        cityName: cityNameField.val().trim()
    };
    const newCityName = cityNameField.val().trim();
    try{
        const response = await fetch(`/admin-cities/${currentCityId}`,{
            method: "PUT",
            headers: {
                'Content-Type' : 'application/json'
            }, 
            body: JSON.stringify(updatedCityInfo)
        });

        if(response.ok){
            alert("City updated sucessfully");

            const row = document.getElementById(`city-row${currentCityId}`);

            row.querySelector(".city-name").textContent= updatedCityInfo.cityName;
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('edit-city-modal'));
            if(modal){
                modal.hide();
            }
        }

    }catch(error){
        console.error("ERROR UPDATING CITY NAME");
    }
    

}
// displays the data of the document with the selected airline id
async function openUpdateAirlineModal(id){

    try{
        currentAirlineId = id;

        const response = await fetch(`/api/airlines/${id}`);

        if(!response.ok){
            alert("Unable to load Airline");
            return;
        }
        const airline = await response.json();

        airlineNameField.val(airline.airlineName);
        isAirlineActiveField.val(airline.isAirlineActive);
        
    }catch(err){
        console.log(error);
    }
}
// PUTS the updated information in the document of the selected airline
async function updateAirlineInformation(){
    var updatedAirlineInfo ={
        airlineName: airlineNameField.val().trim(),
        isAirlineActive: isAirlineActiveField.val().trim()
    };

    const newAirlineName = airlineNameField.val().trim();
    try{
        const response  = await fetch(`/admin-airlines/${currentAirlineId}`,{
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedAirlineInfo)
        });

        if(response.ok){
            alert("Airline updated sucessfully");
            const row = document.getElementById(`airline-row${currentAirlineId}`);

                row.querySelector(".airline-name").textContent = updatedAirlineInfo.airlineName;

                row.querySelector(".airline-status").textContent = updatedAirlineInfo.isAirlineActive;

            const modal = bootstrap.Modal.getInstance(document.getElementById('edit-airline-modal'));
            if(modal){
                modal.hide();
            }
        }

    }catch(error){
        console.error("ERROR UPDATING AIRLINE NAME");
    }
}
// displays the data of the document with the selected flight id
async function openUpdateModal(id){

    try{
        currentFlightId = id;
        const response = await fetch(`/api/flights/${id}`);

        if(!response.ok){
            alert("Unable to load Flight");
            return;
        }

        const flight = await response.json();
        console.log("Flight airline:", flight.airline);
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
// soft deletes flights
async function confirmDeactivate(){

    const response = await fetch(
        `/admin-flights/${currentFlightId}/deactivate`,
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
// soft deletes airline
async function confirmDeactivateAirline() {

    const response = await fetch(
        `/admin-airlines/${currentAirlineId}/deactivate`,
        {
            method: "PATCH"
        }
    );

    if (response.ok) {
        location.reload();
    } else {
        alert("Unable to deactivate airline.");
    }
}
// PUTS the updated information to the selected flight
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

    try{
        console.log(currentFlightId);
        const response = await fetch(`/admin-flights/${currentFlightId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFlightInfo)
        });

        if(response.ok){
            alert("Flight updated successfully");

            const row = document.getElementById(`flight-rows${currentFlightId}`);
console.log(row);
            row.querySelector(".airline").textContent = updatedFlightInfo.airline;
            row.querySelector(".origin").textContent = updatedFlightInfo.origin;
            row.querySelector(".destination").textContent = updatedFlightInfo.destination;
            row.querySelector(".departureDate").textContent = updatedFlightInfo.departureDate;
            row.querySelector(".departureTime").textContent = updatedFlightInfo.departureTime;

            const cabinPrice = row.querySelector(".cabin-price");
            const cabinSeats = row.querySelector(".cabin-seats");

            // Update the stored data
            cabinPrice.dataset.economy = updatedFlightInfo.cabin.economy.price;
            cabinSeats.dataset.economy = updatedFlightInfo.cabin.economy.seats;

            cabinPrice.dataset.premium_economy = updatedFlightInfo.cabin.premium_economy.price;
            cabinSeats.dataset.premium_economy = updatedFlightInfo.cabin.premium_economy.seats;

            cabinPrice.dataset.business_class = updatedFlightInfo.cabin.business_class.price;
            cabinSeats.dataset.business_class = updatedFlightInfo.cabin.business_class.seats;

            cabinPrice.dataset.first_class = updatedFlightInfo.cabin.first_class.price;
            cabinSeats.dataset.first_class = updatedFlightInfo.cabin.first_class.seats;

            applyFilter();

            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-update-flight'));
            if (modal) {
                modal.hide();
            }
        }
    }catch(error){
        console.error("ERROR UPDATING FLIGHT DETAILS", error);
    }

}

function validateFlight(){
    const origin = $('#origin-field').val();
    const destination = $('#destination-field').val();
    const departure = new Date(
        `${$('#departureDate-field').val()}T${$('#departureTime-field').val()}`
    ); 
    const arrival = new Date(
        `${$('#arrivalDate-field').val()}T${$('#arrivalTime-field').val()}`
    );

    if(origin === destination){
        alert("Origin and Destination cannot be the same.");
        return false;
    }

    if(arrival <= departure){
        alert("Arrival must be after Departure");
        return false;
    }


    return true;
}

