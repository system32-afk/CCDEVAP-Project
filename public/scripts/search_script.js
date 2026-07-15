
const booking_info = getBookingInfo();
const cityInput = $('.city-search');
const results = $('.dropdown-list');
const departDate = $("#departure-date");
const returnDate = $("#return-date");
const searchFlightButton = $("#search-flight-button");
const advanceSearchButton = $("#advance-search-button");

const tripType = $(".trip-type");

tripType.on("click", function(){
    var type = $(this).val();
    booking_info.tripType = type;
})


// //debugging. show booking_info data
// console.log(JSON.stringify(booking_info, null, 2));
// //debugging
// if (!booking_info) {
//     console.error("No booking info found in sessionStorage");
// }



//load data
$(function(){
    $("#destination-city-search").val(booking_info.destinationCity);
    $("#origin-city-search").val(booking_info.originCity);
    departDate.val(booking_info.departureDate);
    returnDate.val(booking_info.returnDate);
})


//date dropdown
departDate.on("change", function(){
    var value = $(this).val();
    console.log("departDate: "+ value);
    booking_info.departureDate = value;

});

returnDate.on("change", function(){
    var value = $(this).val();
    booking_info.returnDate = value;

});





//makes the input field into a searchable dropbox

cityInput.on('input', function() {
    var inputField = $(this);
    searchDropdown(inputField,inputField.siblings('.dropdown-list'),inputField.attr('id'))
});


searchFlightButton.on("click", () =>  {

//saves state of these objects to be passed to search query
 sessionStorage.setItem(
        "booking_info",
        JSON.stringify(booking_info)
    );

    console.log("clicked here lol.");
    SearchFlight();
    hasSearched = true;
})



async function SearchFlight(){

    var origin = booking_info.originCity;
    var destination = booking_info.destinationCity;
    var departDate = booking_info.departureDate;
    var returnDate = booking_info.returnDate;
    var tripType = booking_info.tripType;


    console.log(booking_info);
    console.log(filter_options);


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

    //  inverted travel dates (return before departure)
    if (tripType === "round-trip" && new Date(returnDate) < new Date(departDate)) {
        showAlert("Your return date cannot be earlier than your departure date!","danger");
        return;
    }

    hasSearched = true;
    

    
    renderFlights(
        await getFlights(filter_options, getBookingInfo())
    );


    renderFlightsUI();

    showSidebarBtn()
}





