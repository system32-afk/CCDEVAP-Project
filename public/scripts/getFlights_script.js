



//utilities
const promptMessage = $("#prompt-message");
const flightsContainer = $(".flight-option-container");
const bookFlightBtn = $(".select-flight-btn");
const sidebar = $("#offcanvasRight")
const sidebarBody = $("#offcanvasRight .offcanvas-body");
const sortBy = $(".sort");



//state tracking 
var currentBookingPhase = "departure" //will be changed to retrun
var hasSearched = false; //global



//flight choices (objects)
var selectedDepartureFlight = null;
var selectedReturnFlight = null;

//this is where the search result is stored for front-end sorting
var searchResults = null;

flightsContainer.on("click",".select-flight-btn", function(){
    
    var flightID = $(this).data("flight-id");

    lockInFlight(flightID);

})

flightsContainer.on("click",".view-details", function(){
    
    var flightID = $(this).data("flight-id");

    sideBarInfo(flightID);

});


var currentSortOption = null;
sortBy.on("click", function(){
    var selected = $(this).val();

    if(!hasSearched){
        this.checked = false;
        alert("Please search for flights before sorting!");
        return;
    }

    //if user selects option already selected
    if(selected === currentSortOption){
            this.checked = false;
            currentSortOption = null;
            renderFlightsUI(); //reset selections

           
    }else if (selected != currentSortOption && hasSearched){
        currentSortOption = selected;

        applyAllFilters()
    }
})


async function sortFlights(sortBy){
    

    var sortedFlights = null;


    if(searchResults.length === 1){
        return;
    }
    //sort by ticket price: lowest First (Ascending)
    if (sortBy === "ticketPrice") {
        sortedFlights = sortArray(sortBy, "ascending", searchResults); 
    }

    //sort by departure time: earliest first (Ascending)
    else if (sortBy === "departure"){
        sortedFlights = sortArray(sortBy, "ascending", searchResults);
    }

    //sort by duration: shortest first (ascending)
    else if (sortBy === "duration"){
        sortedFlights = sortArray(sortBy, "ascending", searchResults);
    }

    //once the sorted flights are rendered, it will be the new search results.
    renderFlights(sortedFlights);
    

    

    

}
//handles flight options logic / UI
async function renderFlightsUI(){
    var flightsToRender = "";

    if (currentBookingPhase === "departure"){
        promptMessage.text(`Select your departure flight: ${getBookingInfo().originCity} -> ${getBookingInfo().destinationCity}`);
        
        
    }else if (currentBookingPhase === "return" && getBookingInfo().tripType === "round-trip"){
        promptMessage.text(`Select your departure flight: ${getBookingInfo().destinationCity} -> ${getBookingInfo().originCity}`);

        var returnInfo = { ...getBookingInfo() };

        returnInfo.departureDate = getBookingInfo().returnDate; 
        returnInfo.originCity = getBookingInfo().destinationCity;
        returnInfo.destinationCity = getBookingInfo().originCity;

        console.log("return info "+returnInfo.origin);

        flightsToRender = await getFlights(filter_options,returnInfo);
        
        renderFlights(flightsToRender);
    }

   
};

//filters the flights based on advance search optiions and booking
async function getFlights(filterOptions, bookingInfo) {
    
    var searchParams = new URLSearchParams({
        origin: bookingInfo.originCity,
        destination: bookingInfo.destinationCity,
        departureDate: bookingInfo.departureDate,
        cabinType: bookingInfo.cabinType,
        airline: filterOptions.airline,
        isFlexible: filterOptions.isFlexible,
        isDirectFlight: filterOptions.isDirectFlight,
        minPrice: filterOptions.minPrice,
        maxPrice: filterOptions.maxPrice
    })

    console.log("isFlexible before passing: ", bookingInfo.departureDate);

    try{

        let response = await fetch(`/search-flights?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        searchResults = await response.json();
        return searchResults;

    }catch(error){
        console.error("Failed to fetch flights", error);
        return [];
    }
}


//renders the flight cards
function renderFlights(flightsArray){
    flightsContainer.empty();
    var cards = "";
    if (flightsArray.length === 0){
        flightsContainer.html('<div class = "no-results">No Flights Found.</div');
        return;
    }

    var cabinType  =  getBookingInfo().cabinType;
    var layover = "";
    
    //Cabin related Info
    var cabinInfo ="";
    var price="";
    var seats="";
    var label="";
    
    var flightDuration = "";

    flightsArray.forEach(flight => {

        cabinInfo = flight.cabin[cabinType];
        price = cabinInfo.price;
        seats = cabinInfo.seats;
        label = cabinInfo.label;
        layover = "";

         var { display } = calculateFlightDuration(
            flight.departureTime,
            flight.arrivalTime
        );

        
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
                            <h4 class="airline-name">${flight.airline} (${flight.flightNumber})</h4>
                            <span class="badge bg-secondary ms-2">${cabinInfo.label}</span>
                        </div>
                    </div>
                    
                    
                
                    <div class = "FC-Row2">
                    <div class="route-node origin-node">
                        <h3>${flight.origin}</h3>
                        <span class = "times">${flight.departureTime}</span>
                    </div>
                        
                    

                        <div class="flight-path-container">
                            <span class="flight-duration">${display}</span>
                            <div class="flight-line">
                                <img class="airplane-icon" src="/images/plane.png">
                            </div>
                        <span class="flight-type">${layover}</span>
                        </div>
                        
                        <div class="route-node destination-node">
                            <h3>${flight.destination}</h3>
                            <span class = "times">${flight.arrivalTime}</span>
                        
                        </div>
                    </div>

                    <div class = "view-details-btn-container">
                    <button class="btn btn-outline-info view-details" data-flight-id="${flight._id}">
                        View Details
                    </button>
                </div>
                </div>

                <div class = "FC-Col2">
                    <p class = "flight-price">PHP ${price.toLocaleString()}</p>
                    <p id = "seats-remaining">${seats} seats remaining</p>

                    <button class="btn btn-primary select-flight-btn" data-flight-id="${flight._id}">
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
async function lockInFlight(flightID){
    var chosenFlight = await getFlightData(flightID);
    var selectedCabinType = getBookingInfo().cabinType;
    var bookingInfo = getBookingInfo();
    var totalPassengers = parseInt(bookingInfo.passengers.adults) + parseInt(bookingInfo.passengers.children) + parseInt(bookingInfo.passengers.infants);
    var tripType = getBookingInfo().tripType;

    // var {outboundTrip, returnTrip} = trips

    console.log(totalPassengers)
    

    if(totalPassengers > chosenFlight.cabin[selectedCabinType].seats){
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
                flightNum: chosenFlight.flightNumber,
                airline: chosenFlight.airline,
                departure: chosenFlight.departureTime,
                arrival: chosenFlight.arrivalTime,
                duration: calculateFlightDuration(chosenFlight.departureTime, chosenFlight.arrivalTime).display,
                cabinType: getBookingInfo().cabinType,
                ticketPrice: chosenFlight.cabin[getBookingInfo().cabinType].price,
                origin: getBookingInfo().originCity,
                destination: getBookingInfo().destinationCity,
                departureDate: getBookingInfo().departureDate
            }));

            currentBookingPhase = "return";
            renderFlightsUI();
        }else{ 
            // one way flight
            sessionStorage.setItem("selected_flight", JSON.stringify({
                id: chosenFlight.id,
                flightNum: chosenFlight.flightNumber,
                airline: chosenFlight.airline,
                departure: chosenFlight.departureTime,
                arrival: chosenFlight.arrivalTime,
                duration: calculateFlightDuration(chosenFlight.departureTime, chosenFlight.arrivalTime).display,
                cabinType: getBookingInfo().cabinType,
                ticketPrice: chosenFlight.cabin[getBookingInfo().cabinType].price,
                origin: getBookingInfo().originCity,
                destination: getBookingInfo().destinationCity,
                departureDate: getBookingInfo().departureDate
            }));

            window.location.href = "/booking?flightId=" + chosenFlight._id;
        }
        
        
    }else if (currentBookingPhase === "return"){
        selectedReturnFlight = chosenFlight;

        // save return flight
        sessionStorage.setItem("selected_return", JSON.stringify({
            id: chosenFlight.id,
            flightNum: chosenFlight.flightNumber,
            airline: chosenFlight.airline,
            departure: chosenFlight.departureTime,
            arrival: chosenFlight.arrivalTime,
            duration: calculateFlightDuration(chosenFlight.departureTime, chosenFlight.arrivalTime).display,
            cabinType: getBookingInfo().cabinType,
            ticketPrice: chosenFlight.cabin[getBookingInfo().cabinType].price,
            origin: getBookingInfo().destinationCity,
            destination: getBookingInfo().originCity,
            departureDate: getBookingInfo().returnDate
        }));

        window.location.href = "/booking?flightId=" + chosenFlight._id;
    }
}

async function sideBarInfo(flightID) {
    if(!flightID) {
        console.error("Could not find flight matching ID: " + flightID);
        return;
    }

    var flight = await getFlightData(flightID);
    console.log("FLIGHT INFO: ", flight);
    var layover = flight.numOfLayovers > 0 ? `layover(s): ${flight.numOfLayovers}` : "direct flight";

    //Cabin related Info
    var cabinInfo ="";
    var price="";
    var seats="";
    var label="";
    var cabinsHTML = "";
    Object.keys(flight.cabin).forEach(cabinType => {
        if (cabinType === '_id' || cabinType === '__v') return;
        var cabinInfo = flight.cabin[cabinType];
        price = cabinInfo.price.toLocaleString();

        seats = cabinInfo.seats;
        label = cabinInfo.label;
        
        //if seats are low, make them turn red and bold
        var seatWarningClass = seats <= 3 ? "text-danger fw-bold" : "text-muted";
        
        cabinsHTML += `
            <div class=" list-group-item d-flex  justify-content-between align-items-center py-3">
                <div>
                    <h6 class="mb-0 fw-bold">${label}</h6>
                    <small class="${seatWarningClass}">${seats} seats left</small>
                </div>
                <div class="text-end">
                    <span class="fs-5 fw-semibold text-primary">PHP ${price}</span>
                </div>
            </div>
        `;
    });

    var detailsHTML = `
        <div class="text-center">
            <img src="/images/${flight.logoName}.png" alt="Logo" id="sidebar-logo" class="mb-2" style="max-height: 50px;">
            <h4>${flight.airline}</h4>
            <p class="text-muted">Flight #${flight.flightNumber}</p>
        </div>
        <hr>
        <div class="row mb-3">
            <div class="col cities-and-time">
                <strong>From:</strong> <span class="booking-info-cities d-block fw-bold">${getBookingInfo().originCity}</span>
                <span class="text-secondary">${flight.departureTime}</span>
            </div>
            <div class="col text-end cities-and-time">
                <strong>To:</strong> <span class="booking-info-cities d-block fw-bold">${getBookingInfo().destinationCity}</span>
                <span class="text-secondary">${flight.arrivalTime}</span>
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



async function getFlightData(ID){
    try{

        let searchParams = new URLSearchParams({flightID:ID})

        let response = await fetch(`../flight-info?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        return await response.json()
    }catch(error){
        console.error("Failed to fetch flight info: ", error);
        return [];
    }
}


