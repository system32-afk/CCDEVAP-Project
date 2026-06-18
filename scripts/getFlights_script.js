
var flightsDB = null;
$(document).ready(function() {
//flight database
 flightsDB = getFlightsDatabase();
});

//utilities
const promptMessage = $("#prompt-message");
const flightsContainer = $(".flight-option-container");
const bookFlightBtn = $(".select-flight-btn");
const sidebar = $("#offcanvasRight")
const sidebarBody = $("#offcanvasRight .offcanvas-body");
const sortBy = $(".sort");


//state tracking
var currentBookingPhase = "departure" //will be changed to retrun
var hasSearched = false;


//flight choices (objects)
var selectedDepartureFlight = null;
var selectedReturnFlight = null;

flightsContainer.on("click",".select-flight-btn", function(){
    
    var flightID = $(this).data("flight-id");

    lockInFlight(flightID);

})

flightsContainer.on("click",".view-details", function(){
    
    var flightID = $(this).data("flight-id");

    sideBarInfo(flightID);

});


let currentSortOption = null;
sortBy.on("click", function(){
    var selected = $(this).val();

    if(!hasSearched){
        this.checked = false;
        alert("Please search for flights before sorting!");
        return;
    }

    if(selected === currentSortOption){
            this.checked = false;
            currentSortOption = null;
            renderFlightsUI(); //reset selections

            console.log("currentSelect: ", currentSortOption, "just selected: ",selected)
    }else if (selected != currentSortOption && hasSearched){
        currentSortOption = selected;
        sortFlights(selected);
    }
})


function sortFlights(sortBy){
    var filteredFlights = getFlights(getFilterOptions(), getBookingInfo());
    var sortedFlights = null;


    if(filteredFlights.length === 1){
        return;
    }
    //sort by ticket price: lowest First (Ascending)
    if (sortBy === "ticketPrice") {
    sortedFlights = sortArray(sortBy, "ascending", filteredFlights);

    //sort by departure time: earliest first (Ascending)
    }else if (sortBy === "departure"){
        sortedFlights = sortArray(sortBy, "ascending", filteredFlights);
    }

    //sort by duration: shortest first (ascending)
    else if (sortBy === "duration"){
        sortedFlights = sortArray(sortBy, "ascending", filteredFlights);
    }

    renderFlights(sortedFlights);
}
//handles flight options logic / UI
function renderFlightsUI(){
    var flightsToRender = "";

    if (currentBookingPhase === "departure"){
        promptMessage.text(`Select your departure flight: ${booking_info.originCity} -> ${booking_info.destinationCity}`);
        flightsToRender = getFlights(filter_options, booking_info);

    }else if (currentBookingPhase === "return" && booking_info.tripType === "round-trip"){
        promptMessage.text(`Select your departure flight: ${booking_info.destinationCity} -> ${booking_info.originCity}`);

        var returnInfo = {
            departDate: booking_info.returnDate,
            originCity: booking_info.destinationCity,
            destinationCity: booking_info.originCity
        };

        console.log("return info "+returnInfo);

        flightsToRender = getFlights(filter_options, returnInfo);
    }

    renderFlights(flightsToRender);
};

//filters the flights based on advance search optiions and booking
function getFlights(filter_options, booking_info){
    const {
        departureDate, 
        returnDate, 
        originCity,
        destinationCity,
        cabinType
    } = booking_info;

    const {
        airline,
        isFlexible,     
        isDirectFlight,
        minPrice,
        maxPrice
    } = filter_options;


    var dayOfWeek =  null;
    console.log(filter_options);
    if(departureDate){
        dayOfWeek = new Date(departureDate).getDay();
        console.log(dayOfWeek);
    }


    
    var filtered = flightsDB.filter (flights =>{

        var selectedCabin = flights.cabins[booking_info.cabinType];
        
        //if flexible dates is NOT checked, then only give flights on specific date
        if (dayOfWeek !== null && !isFlexible){

            //if flight doesn't operate in day of the week we skip
            if(!flights.departDate.includes(dayOfWeek)){
                return false;
            }
        }

        //DIRECT FLIGHTS FLITER
        //if direct flight is checked, skip if the flight has more than 0 layovers.
        if(isDirectFlight && flights.numOfLayovers >0){
            return false;
        }


        

        //PRICE FILTER
        //check first if max price is set to 0 (default value)
        if(maxPrice !== 0){



            //Minimum price
            //if it's cheaper than the minimum price, skip
            if(selectedCabin.price < minPrice){
                return false;
            }


            //if the ticket price is higher than the maxPrice, skip
            if(selectedCabin.price > maxPrice){
                return false;
            }
        }

        //preferred airline

        //if airline preference isn't set to "any"
        if (airline.trim() !== "any"){
            //compare the preferred airlines to the database
            if(flights.airline.trim() !== airline.trim()){
                return false; //skip if it doesn't match preferred airline
            }
        }

        return true;

    })

    console.log("flights matched: "+ filtered);

    
    return filtered.map(flight => {
        var flightDuration = calculateFlightDuration(flight.Departure, flight.arrival);
        var selectedCabin = flight.cabins[booking_info.cabinType];
        return{
            ...flight,
            origin: originCity,
            destination: destinationCity,
            duration: flightDuration.display,
            durationMinutes: flightDuration.durationMinutes,

            //cabin info
            ticketPrice: selectedCabin.price,
            remainingSeats: selectedCabin.seats,
            cabinLabel:selectedCabin.label

        }
    })
    
}


//renders the flight cards
function renderFlights(flightsArray){

    flightsContainer.empty();
    var cards = "";
    if (flightsArray.length === 0){
        flightsContainer.html('<div class = "no-results">No Flights Found.</div');
        return;
    }


    flightsArray.forEach(flight => {
        var layover = "";
        
        if(flight.numOfLayovers > 0){
            layover = "layovers: "+ flight.numOfLayovers;
        }else{
            layover = "direct flight";
        }
        cards += `
        <div class="card flight-card">

            <div class = "row ">
                <div class = "col">
                    <div class = "FC-Row1">
                        <div class = "top-flight-info">
                            <img class ="airline-logo" src = "/images/${flight.logoName}.png"/>
                            <h4 class="airline-name">${flight.airline} (${flight.flightNum})</h4>
                            <span class="badge bg-secondary ms-2">${flight.cabinLabel}</span>
                        </div>
                    </div>
                    
                    
                
                    <div class = "FC-Row2">
                    <div class="route-node origin-node">
                        <h3>${flight.origin}</h3>
                        <span class = "times">${flight.Departure}</span>
                    </div>
                        
                    

                        <div class="flight-path-container">
                            <span class="flight-duration">${flight.duration}</span>
                            <div class="flight-line">
                                <img class="airplane-icon" src="/images/plane.png">
                            </div>
                        <span class="flight-type">${layover}</span>
                        </div>
                        
                        <div class="route-node destination-node">
                            <h3>${flight.destination}</h3>
                            <span class = "times">${flight.arrival}</span>
                        
                        </div>
                    </div>

                    <div class = "view-details-btn-container">
                    <button class="btn btn-outline-info view-details" data-flight-id="${flight.id}">
                        View Details
                    </button>
                </div>
                </div>

                <div class = "FC-Col2">
                    <p class = "flight-price">PHP ${flight.ticketPrice.toLocaleString()}</p>
                    <p id = "seats-remaining">${flight.remainingSeats} seats remaining</p>

                    <button class="btn btn-primary select-flight-btn" data-flight-id="${flight.id}">
                        Select Flight
                    </button>
                </div>
                
            </div>
        </div>
        `;
    });

    flightsContainer.append(cards);

}

//select flight
function lockInFlight(flightID){
    var chosenFlight = getFlightData(flightID);
    var selectedCabinType = booking_info.cabinType;
    var totalPassengers = getTotalPassengers(booking_info);
    var tripType = booking_info.tripType;

    // var {outboundTrip, returnTrip} = trips

    console.log(totalPassengers)
    

    if(totalPassengers > chosenFlight.cabins[selectedCabinType].seats){
        showAlert("Passenger count cannot exceed available seats remaining.","warning") 
        return;
    }


    if (currentBookingPhase === "departure"){
        selectedDepartureFlight = chosenFlight;

        //if trip is a round trip, set for return flight.
        if(tripType === "round-trip"){
            
            // save departure flight and show return flights
            sessionStorage.setItem("selected_departure", JSON.stringify({
                id: chosenFlight.id,
                flightNum: chosenFlight.flightNum,
                airline: chosenFlight.airline,
                departure: chosenFlight.Departure,
                arrival: chosenFlight.arrival,
                duration: calculateFlightDuration(chosenFlight.Departure, chosenFlight.arrival).display,
                cabinType: booking_info.cabinType,
                ticketPrice: chosenFlight.cabins[booking_info.cabinType].price,
                origin: booking_info.originCity,
                destination: booking_info.destinationCity,
                departureDate: booking_info.departureDate
            }));

            currentBookingPhase = "return";
            renderFlightsUI();
        }else{ 
            // one way flight
            sessionStorage.setItem("selected_flight", JSON.stringify({
                id: chosenFlight.id,
                flightNum: chosenFlight.flightNum,
                airline: chosenFlight.airline,
                departure: chosenFlight.Departure,
                arrival: chosenFlight.arrival,
                duration: calculateFlightDuration(chosenFlight.Departure, chosenFlight.arrival).display,
                cabinType: booking_info.cabinType,
                ticketPrice: chosenFlight.cabins[booking_info.cabinType].price,
                origin: booking_info.originCity,
                destination: booking_info.destinationCity,
                departureDate: booking_info.departureDate
            }));

            window.location.href = "booking.html";
        }
        
        
    }else if (currentBookingPhase === "return"){
        selectedReturnFlight = chosenFlight;

        // save return flight
        sessionStorage.setItem("selected_return", JSON.stringify({
            id: chosenFlight.id,
            flightNum: chosenFlight.flightNum,
            airline: chosenFlight.airline,
            departure: chosenFlight.Departure,
            arrival: chosenFlight.arrival,
            duration: calculateFlightDuration(chosenFlight.Departure, chosenFlight.arrival).display,
            cabinType: booking_info.cabinType,
            ticketPrice: chosenFlight.cabins[booking_info.cabinType].price,
            origin: booking_info.destinationCity,
            destination: booking_info.originCity,
            departureDate: booking_info.returnDate
        }));

        window.location.href = "booking.html";
    }
}

function sideBarInfo(flightID) {
    if(!flightID) {
        console.error("Could not find flight matching ID: " + flightID);
        return;
    }

    var flight = getFlightData(flightID);
    var layover = flight.numOfLayovers > 0 ? `layover(s): ${flight.numOfLayovers}` : "direct flight";

    
    var cabinsHTML = "";
    Object.keys(flight.cabins).forEach(cabinType => {
        var cabin = flight.cabins[cabinType];
        
        //if seats are low, make them turn red and bold
        var seatWarningClass = cabin.seats <= 3 ? "text-danger fw-bold" : "text-muted";
        
        cabinsHTML += `
            <div class=" list-group-item d-flex  justify-content-between align-items-center py-3">
                <div>
                    <h6 class="mb-0 fw-bold">${cabin.label}</h6>
                    <small class="${seatWarningClass}">${cabin.seats} seats left</small>
                </div>
                <div class="text-end">
                    <span class="fs-5 fw-semibold text-primary">PHP ${cabin.price.toLocaleString()}</span>
                </div>
            </div>
        `;
    });

    var detailsHTML = `
        <div class="text-center">
            <img src="/images/${flight.logoName}.png" alt="Logo" id="sidebar-logo" class="mb-2" style="max-height: 50px;">
            <h4>${flight.airline}</h4>
            <p class="text-muted">Flight #${flight.flightNum}</p>
        </div>
        <hr>
        <div class="row mb-3">
            <div class="col cities-and-time">
                <strong>From:</strong> <span class="booking-info-cities d-block fw-bold">${booking_info.originCity}</span>
                <span class="text-secondary">${flight.Departure}</span>
            </div>
            <div class="col text-end cities-and-time">
                <strong>To:</strong> <span class="booking-info-cities d-block fw-bold">${booking_info.destinationCity}</span>
                <span class="text-secondary">${flight.arrival}</span>
            </div>
        </div>
        <div class="mb-3">
            <strong>Stops:</strong> <span class="badge bg-light text-dark ms-1">${layover}</span>
        </div>
        <hr>
        
        <h5 class="mb-3">Available Cabin Options</h5>
        <div class="list-group shadow-sm">
            ${cabinsHTML}
        </div>
    `;

    sidebarBody.html(detailsHTML);

    var offCanvas = new bootstrap.Offcanvas(sidebar[0]);
    offCanvas.show();
}


//get data of a certain flight from the database
function getFlightData(flightID){
    return flightsDatabase.find(flight => flight.id === flightID)
}



function SearchFlight(){

    var origin = booking_info.originCity;
    var destination = booking_info.destinationCity;
    var departDate = booking_info.departureDate;
    var returnDate = booking_info.returnDate;
    var tripType = booking_info.tripType;


    console.log(booking_info);

    // check for  empty locations
    if (!origin || !destination) {
        showAlert("Please select both your origin and destination cities before searching!","danger");
        return;
    }

    //check for same city conflict
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        showAlert("Origin and Destination cannot be the same city! Please select a different arrival location.","danger");
        return;
    }

    //check for missing department dates
    if (!departDate) {
        showAlert("Please choose a valid departure date!","danger");
        return;
    }

   //check for missing trip type (highly doubt since theres a default value)
    if (tripType === "round-trip" && !returnDate) {
        showAlert("You have selected a Round-Trip flight. Please select a return date!","danger");
        return;
    }

    // Check E: Inverted Travel Dates (Return before Departure)
    if (tripType === "round-trip" && new Date(returnDate) < new Date(departDate)) {
        showAlert("Your return date cannot be earlier than your departure date!","danger");
        return;
    }

    getFlights(getFilterOptions(),getBookingInfo());
    renderFlightsUI();
}