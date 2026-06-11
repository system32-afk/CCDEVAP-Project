//ANG HIRAP NAMAN NETO

$(document).ready(function(){
const cityInput = $('.city-search');
const results = $('.dropdown-list');
const cities = 
['NAIA (Manila)', 'BIA (Albay)', 'MCIA (Cebu)', 'CIA (Clark)', 'BSA (Bacolod)','IIA (Iloilo)',
'SA (Siargao)','GPRA (Caticlan)'
];
const departDate = $("#departure-date");
const returnDate = $("#return-date");
const booking_info = getBookingInfo();
const searchFlightButton = $("#search-flight-button");
const advanceSearchButton = $("#advance-search-button");

const tripType = $(".trip-type");


tripType.on("click", function(){
    var type = $(this).val();
    console.log(type);
})

const filter_options = JSON.parse(sessionStorage.getItem("filter_options")) || {
    airline: "any",
    isDirectFlight: false,
    isFlexible: false,
    minPrice: 0,
    maxPrice: 0,
};


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



//hides all dropdown lists when the user clicks outside of the input fields
$(document).on('click', function(event) {

    if (!$(event.target).closest('.input-fields').length) {
        $('.dropdown-list').hide();
    }

});

//makes the input field into a searchable dropbox
//this took me ages to learn.
cityInput.on('input', function() {
    var currentSearchField = $(this);
    var currentResults = currentSearchField.siblings('.dropdown-list');
    var search = currentSearchField.val().toLowerCase(); //get the value of the input field and convert it to lowercase
    var showResults = function(){
        currentResults.show(); //show the dropdown list when the input field is focused
    };
    var hideResults = function(){
        currentResults.hide(); //hide the dropdown list when the input field is blurred
    };
    var searchFieldID = currentSearchField.attr('id'); //for booking_info data manipulation

    currentResults.empty(); //clear the dropdown list
    showResults(); //show the dropdown list
    
    /*
        Okay medyo mahaba to, so basically .filter filters the cities array to only include cities that match what the user is typing
        tapos it returns a new array that the .foreach iterates through and displays yung mga matching cities na yun
    */
    cities.filter(city => city.toLowerCase().includes(search)). //filter the cities array to only include cities that match the search query
        forEach(city =>{

        var options = $('<div></div>'); //create new div
        
        options.text(city); //set the text content of the div to the city name
        options.addClass('city-item');//name the div class to city-item

        options.click(event =>{

            if(searchFieldID === "origin-city-search"){
                booking_info.originCity = city;
            }else if (searchFieldID === "destination-city-search"){
                 booking_info.destinationCity = city;
            }

            console.log("origin:"+ booking_info.originCity);
            console.log("destination:"+booking_info.destinationCity);
            currentSearchField.val(city);
            currentResults.empty(); //clear the dropdown list
            hideResults(); //hide the dropdown list
        });

        currentResults.append(options); //pasok yung new div sa dropdown list
    })
    
});


searchFlightButton.on("click", () =>  {

//saves state of these objects to be passed to search query
sessionStorage.setItem(
        "booking_info",
        JSON.stringify(booking_info)
    );

sessionStorage.setItem(
        "filter_options",
        JSON.stringify(filter_options)
    );

getFlights(getFilterOptions(),getBookingInfo());

})
});









