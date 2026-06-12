
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


//state tracking
var currentBookingPhase = "departure" //will be changed to retrun

//flight choices (objects)
var selectedDepartureFlight = null;
var selectedReturnFlight = null;


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

function getFlights(filter_options, booking_info){
console.log("data passed to get flights: " + JSON.stringify(booking_info, null, 2));
    const {
        departureDate, 
        returnDate, 
        originCity,
        destinationCity
    } = booking_info;

    const {
        airline,
        isFlexible,     
        isDirectFlight,
        minPrice,
        maxPrice
    } = filter_options;


    var dayOfWeek =  null;
    console.log(departureDate);
    if(departureDate){
        dayOfWeek = new Date(departureDate).getDay();
        console.log(dayOfWeek);
    }

    

    var filtered = flightsDB.filter (flights =>{

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


        //Minimum price
        //if it's cheaper than the minimum price, skip
        if(flights.ticketPrice < minPrice){
            return false;
        }

        //Max price
        //check first if max price is set to 0 (default value)
        if(maxPrice !== 0){
            //if the ticket price is higher than the maxPrice, skip
            if(flights.ticketPrice > maxPrice){
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
        return{
            ...flight,
            origin: originCity,
            destination: destinationCity,
        }
    })
    
}

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
        <div class="flight-card">
            <div class = "FC-Col1">
                <div class = "FC-Row1">
                    <div class = "top-flight-info">
                        <img class ="airline-logo" src = "/images/${flight.logoName}.png"/>
                        <h4 class="airline-name">${flight.airline} (${flight.flightNum})</h4>
                    </div>
                </div>
                
                
            
                <div class = "FC-Row2">
                <div class="route-node origin-node">
                    <h3>${flight.origin}</h3>
                    <span class = "times">${flight.Departure}</span>
                </div>
                    
                   

                    <div class="flight-path-container">
                        <span class="flight-duration">2h 30m</span>
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
                <p class = "flight-price">PHP ${flight.ticketPrice}</p>
                <p id = "seats-remaining">${flight.remainingSeats} seats remaining</p>

                <button class="btn btn-primary select-flight-btn" data-flight-id="${flight.id}">
                    Select Flight
                </button>
            </div>
            
        </div>
        `;
    });

    flightsContainer.append(cards);

}

flightsContainer.on("click",".select-flight-btn", function(){
    
    var flightID = $(this).data("flight-id");

    lockInFlight(flightID);

})


flightsContainer.on("click",".view-details", function(){
    
    var flightID = $(this).data("flight-id");

    sideBarInfo(flightID);

});

function lockInFlight(flightID){
    var chosenFlight = getFlightData(flightID);

    if (currentBookingPhase === "departure"){
        selectedDepartureFlight = chosenFlight;

        currentBookingPhase = "return";
        console.log("Departure locked:", selectedDepartureFlight);
        renderFlightsUI();
    }else if (currentBookingPhase === "return"){
        selectedReturnFlight = chosenFlight;

        console.log("Return locked:", selectedReturnFlight);
    }
}
function sideBarInfo(flightID){
    
    if(!flightID){
        console.error("Could not find flight matching ID: "+ flightID);
        return;
    }

    var flight = getFlightData(flightID);

    var layover = "";

    if(flight.numOfLayovers > 0){
        layover = "layover(s): "+ flight.numOfLayovers;
    }else{
        layover = "direct flight";
    }


    var detailsHTML = `
        <div class="text-center">
            <img src="/images/${flight.logoName}.png" alt="Logo" id = "sidebar-logo" class="mb-2">
            <h4>${flight.airline}</h4>
            <p>Flight #${flight.flightNum}</p>
        </div>
        <hr>
        <div class="row">
            <div class="col cities-and-time">
                <strong>From:</strong> <span class="booking-info-cities">${booking_info.originCity}</span>
                <span>${flight.Departure}</span>
            </div>
            <div class="col text-end cities-and-time">
                <strong>To:</strong> <span class="booking-info-cities">${booking_info.destinationCity}</span>
                <span>${flight.arrival}</span>
            </div>
        </div>
        
            <strong>Stops:</strong>
            <p>${layover}</p>

        <strong>Fare Rate:</strong>
        <h3 class = "flight-price">PHP ${flight.ticketPrice.toLocaleString()}</h3>
        
    `;

    sidebarBody.html(detailsHTML);

   
    var offCanvas = new bootstrap.Offcanvas(sidebar[0]);

    offCanvas.show();
}

function getFlightData(flightID){
    return flightsDatabase.find(flight => flight.id === flightID)
}

