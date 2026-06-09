
//operating dates: 0 - sunday, 1 - monday, 2-tuesday,
//3-wednesday,4-thursday 5 - friday, 6 - saturday
const flightsDatabase = [
    {id: 1, airline:"Philippine Airline",
        flightNum:6767, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:5565, remainingSeats: 8,
        departDate: [0,2,3,5]
    },
    {id: 2, airline:"AirAsia",
        flightNum:1234, Departure:"06:00",
        arrival:"08:30", numOfLayovers: 0,
        ticketPrice:7000, remainingSeats: 1,
        departDate: [0,1,4,6]
    },
    {id: 3, airline:"AirAsia",
        flightNum:1123, Departure:"13:00",
        arrival:"14:35", numOfLayovers: 0,
        ticketPrice:12344, remainingSeats: 6,
        departDate: [0,2,5,6]
    },
    {id: 4, airline:"Cebu Pacific",
        flightNum:1212, Departure:"12:00",
        arrival:"14:30", numOfLayovers: 1,
        ticketPrice:1650, remainingSeats: 2,
        departDate: [1,4,5,6]
    },
    {id: 5, airline:"Cathay Pacific",
        flightNum:5565, Departure:"14:30",
        arrival:"18:00", numOfLayovers: 1,
        ticketPrice:6778, remainingSeats: 7,
        departDate: [2,4,5,6]
    },
    {id: 6, airline:"Cebu Pacific",
        flightNum:1124, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:5678, remainingSeats: 10,
        departDate: [1,2,3,6]
    },
    {id: 7, airline:"Cathay Pacific",
        flightNum:7767, Departure:"03:00",
        arrival:"09:30", numOfLayovers: 2,
        ticketPrice:9567, remainingSeats: 7,
        departDate: [0,2,5,6]
    },
    {id: 8, airline:" Cebu Pacific",
        flightNum:8989, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:3452, remainingSeats: 4,
        departDate: [1,2,3,5]
    },
    {id: 9, airline:"AirAsia",
        flightNum:9524, Departure:"06:00",
        arrival:"12:30", numOfLayovers: 2,
        ticketPrice:15523, remainingSeats: 3,
        departDate: [0,2,3,5]
    },

]
//utilities
const promptMessage = $("#prompt-message");
const flightsContainer = $("#flight-option-container");
const bookFlightBtn = $(".select-flight-btn");


//state tracking
var currentBookingPhase = "departure" //will be changed to retrun

//flight choices (objects)
var selectedDepartureFlight = null;
var selectedReturnFlight = null;


function renderFlightsUI(){
    if (currentBookingPhase === "departure"){
        promptMessage.text("Select your departure flight: ${booking_info.originCity} -> ${booking_info.destinationCity}");
        flightsRendered = getFlights(filter_options, booking_info);
    }else if (currentBookingPhase === "return" && booking_info.tripType === "round-trip"){
        promptMessage.text("Select your departure flight: ${booking_info.destinationCity} -> ${booking_info.originCity}");

        var returnInfo = {
            departDate: booking_info.returnDate,
            originCity: booking_info.destinationCity,
            destinationCity: booking_info.originCity
        };

        flightsToRender = getFlights(filter_options, returnInfo);
    }


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

    

    var filtered = flightsDatabase.filter (flights =>{

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
        //if the ticket price is higher than the maxPrice, skip
        if(flights.ticketPrice > maxPrice){
            return false;
        }

        //preferred airline

        //if airline preference isn't set to "any"
        if (airline.trim() !== "any"){
            //compare the preferred airlines to the database
            if(flights.airline.trim !== airline.trim()){
                return false; //skip if it doesn't match preferred airline
            }
        }

        return true;

    })

    console.log(filtered);

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


    flightsArray.array.forEach(flight => {
        var layover = "";
        if(flight.numOfLayovers > 0){
            layover = "layovers: "+ flight.numOfLayovers;
        }else{
            layover = "direct flight";
        }
        card += `
        <div class = "flight-card">
            <h4>${flight.airline} ${flight.flightNum}</h4>
            <p>Time: ${flight.Departure} - ${flight.arrival}</p>
            <p>Price: ₱${flight.ticketPrice}</p>
            <p>Seats remaining: ₱${layover}</p>
            <p> ${layover} </p>
            <button class="select-flight-btn" data-flight-id="${flight.id}">
                    select flight
                </button>

        
        </div>
        `;
    });

    flightsContainer.append(cards);

}

bookFlightBtn.on("click", function(){
    var flightId = $(this).data("flight-id");

    var chosenFlight = flightsDatabase.find(flight => flight.id === flightId);

    if (currentBookingPhase === "departure"){
        selectedDepartureFlight = chosenFlight;

        currentBookingPhase = "return";
        console.log("Outbound locked:", selectedDepartureFlight);
        renderFlightsUI();
    }else if (currentBookingPhase === "return"){
        selectedReturnFlight = chosenFlight;

        console.log("Outbound locked:", selectedReturnFlight);
    }
})



