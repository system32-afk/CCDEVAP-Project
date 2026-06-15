const citySearch = $(".city-search");
const departDate = $("#departureDate");
const returnDate = $("#returnDate");

const booking_info = JSON.parse(sessionStorage.getItem("booking_info")) || {
    originCity: "none", 
    destinationCity: "none",
    departureDate: "none",
    returnDate: "none",
    cabinType: "economy", 
    tripType: "one-way",
    passengers:{
        adults: 1,
        children: 0,
        infants: 0
    },
};

function noInvalidDates(){
    var departureStr = $("#departureDate").val();
    var returnStr = $("#returnDate").val();

    if(!departureStr || !returnStr){
        alert("Please choose a date.");
        return false;
    }

    var returnDate = new Date(returnStr);
    var departureDate = new Date(departureStr);
    

        // same dates are invalid
        if(departureDate === returnDate){
            alert("Please choose or enter a valid date.");
            return false;
        }
        //return date is before departure date invalid, departure and return dates are empty invalid,
        if(departureDate.getTime() >= returnDate.getTime()){
            alert("Please choose or enter a valid date.");
            return false;

        }
        return true;
}

function noSameAirports(){
    var departure = $("#origin-city-search").val();
    var destination = $("#destination-city-search").val();

    if(departure === destination){
        alert("Please choose a different airport.");
        return false;
    }

    if(destination === "" || departure === ""){
        alert("Please choose an airport.");
        return false;
    }
    return true;
}

function swapValues(){
    var departure = $("#origin-city-search");
    var destination = $("#destination-city-search");

    //.val()is a property that gets or sets a value inside an html input element
    var temp =  departure.val(); 
    departure.val(destination.val());
    departure.val(destination.val());
    destination.val(temp);
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

$("#swapBtn").on("click", swapValues);

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