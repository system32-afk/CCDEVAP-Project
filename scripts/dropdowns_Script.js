const cabinOptions = $(".cabin-row");
const cabinField = $("#cabin-select");
const airlineOptions = $(".airline-row");
const airlineField = $("#airline-select");


$(function(){
    cabinField.text(booking_info.cabinType);
})


cabinOptions.on("click", function(e) {
    var selectedCabinType = $(this).data("cabin");
    cabinField.text(selectedCabinType);
    booking_info.cabinType   = selectedCabinType;
    console.log(booking_info.cabinType)

});

airlineOptions.on("click", function() {
    var selectedAirline = $(this).data("airline");
    filter_options.airline = selectedAirline;
    airlineField.text(selectedAirline);
});


