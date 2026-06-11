const citySearch = $(".city-search");
const departDate = $("#departureDate");
const returnDate = $("#returnDate");

const booking_info = JSON.parse(sessionStorage.getItem("booking_info")) || {
    originCity: "none", 
    destinationCity: "none",
    departureDate: "none",
    returnDate: "none",
    cabinType: "Economy", 
    tripType: "one-way",
    passengers:{
        adults: 1,
        children: 0,
        infants: 0
    },
};

function noInvalidDates(){
    var departureDate = document.getElementById("departureDate");
    var returnDate = document.getElementById("returnDate");
    

        // same dates are invalid
        if(departureDate.value === returnDate.value){
            alert("Please choose or enter a valid date.");
            return false;
        }
        //return date is before departure date invalid, departure and return dates are empty invalid,
        if(departureDate.value > returnDate.value ||  departureDate.value === "" || returnDate.value === ""){
            alert("Please choose or enter a valid date.");
            return false;


        }
        return true;
}

function noSameAirports(){
    var departure = document.getElementById("origin-city-search");
    var destination = document.getElementById("destination-city-search");

    if(departure.value === destination.value){
        alert("Please choose a different airport.");
        return false;
    }

    if(destination.value === "" || departure.value === ""){
        alert("Please choose an airport.");
        return false;
    }
    return true;
}



citySearch.on('input', function() {
    var inputField = $(this);
    searchDropdown(inputField,inputField.siblings('.dropdown-list'),inputField.attr('id'))
});


departDate.on("change", function(){
    var value = $(this).val();
    console.log("departDate: "+ value);
    booking_info.departureDate = value;

});

returnDate.on("change", function(){
    var value = $(this).val();
    booking_info.returnDate = value;

});


$("#searchBtn").on("click", function () {

    if(!noInvalidDates()){
        return false;
    }

    if(!noSameAirports()){
        return false;
    }
    sessionStorage.setItem(
        "booking_info",
        JSON.stringify(booking_info)
    );

    window.location.href = "search.html";
});