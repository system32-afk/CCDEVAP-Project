//ANG HIRAP NAMAN NETO
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

const filter_options = JSON.parse(sessionStorage.getItem("filter_options")) || {
    airline: "any",
    isDirectFlight: false,
    isFlexible: false,
    minPrice: 0,
    maxPrice: 0,
};

function getFilterOptions(){
    return filter_options;
}


//debugging. show booking_info data
console.log(JSON.stringify(booking_info, null, 2));
//debugging
if (!booking_info) {
    console.error("No booking info found in sessionStorage");
}



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



    getFlights(getFilterOptions(),getBookingInfo());
    renderFlightsUI();
})









