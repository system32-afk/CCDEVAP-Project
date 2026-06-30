const cabinOptions = $(".cabin-row");
const cabinField = $("#cabin-select");
const airlineOptions = $(".airline-row");
const airlineField = $("#airline-select");


$(function(){
    cabinField.text(booking_info.cabinType);
})


cabinOptions.on("click", function(e) {
    var selectedCabinType = $(this).data("cabin");
    var text = $(this).text();
    cabinField.text(text);
    booking_info.cabinType   = selectedCabinType;
    console.log(booking_info.cabinType)

});

airlineOptions.on("click", function() {
    var text = $(this).text();
    var selectedAirline = $(this).data("airline");
    filter_options.airline = selectedAirline;
    airlineField.text(text);
});


