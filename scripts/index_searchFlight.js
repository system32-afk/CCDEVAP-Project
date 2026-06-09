const originAirport = $("#departure-airports");
const destinationAirport = $("#destination-airports");
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



originAirport.on("change", function () {
    var value = $(this).val();
    booking_info.originCity = value;
});

destinationAirport.on("change", function () {
    var value = $(this).val();

    booking_info.destinationCity = value;
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

    sessionStorage.setItem(
        "booking_info",
        JSON.stringify(booking_info)
    );

    window.location.href = "search.html";
});