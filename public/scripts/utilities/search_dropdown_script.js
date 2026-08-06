let cities = [];

async function loadCities() {
    try {

        const response = await fetch("/api/cities");

        const data = await response.json();

        cities = data.map(city => city.cityName);

    } catch (err) {
        console.error(err);
    }
}

$(document).ready(function () {
    loadCities();
});

//hides all dropdown lists when the user clicks outside of the input fields
$(document).on('click', function(event) {

    if (!$(event.target).closest('.input-fields').length) {
        $('.dropdown-list').hide();
    }

});

function searchDropdown (currentSearchField,dropdown,searchFieldID){
    var search = currentSearchField.val().toLowerCase(); //get the value of the input field and convert it to lowercase
    var showResults = function(){
        dropdown.show(); //show the dropdown list when the input field is focused
    };
    var hideResults = function(){
        dropdown.hide(); //hide the dropdown list when the input field is blurred
    };
    var searchFieldID = currentSearchField.attr('id'); //for booking_info data manipulation

    dropdown.empty(); //clear the dropdown list
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

            currentSearchField.val(city);
            dropdown.empty(); //clear the dropdown list
            hideResults(); //hide the dropdown list
        });

        dropdown.append(options); //pasok yung new div sa dropdown list
    })
}