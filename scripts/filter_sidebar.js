const sidebarFilterBody = $("#filter-sidebar");

// Price slider components
const selectAllAirline = $("#select-all-airlines-btn");
const priceRange = $("#sidebar-price-range");
const priceLimitDisplay = $("#price-limit-label");
const currentPrice = $("#current-price");
const openSidebarBtn = $("#open-filter-sidebar-btn");

// Airline filters components
const airlineFilters = [];
const palCheckbox = $("#filter-PAL");
const airsiaCheckbox = $("#filter-AirAsia");
const cebPacCheckbox = $("#filter-CebPac");
const cathPacCheckbox = $("#filter-CathPac");
const listofAirlines = $(".airline-filter");

// Departure filter components
const departureSchedules = [];
const morning = $("#filter-dep-morning");
const afternoon = $("#filter-dep-afternoon");
const evening = $("#filter-dep-evening");
const night = $("#filter-dep-night");
const listofDeparture = $(".departure-filter");
const resetSchedules = $("#reset-departure-filter");

// Stop filter components
const stopFilter = $(".stop-filter");

//reset all filters
const FILTERRESET = $("#reset-all-filter")

FILTERRESET.on("click",function(){
    $(".airline-filter, .departure-filter").prop("checked", true);

    $("input[name='stop-group']").prop("checked", true);
    priceRange.val(500);
    currentPrice.text("PHP 500");

    SearchFlight()//reset search query
})

var searchResults = "";





$(document).ready(function() {
 showSidebarBtn()
 modifyAirlineFilters();
 modifyScheduleFilters()
});


sidebarFilterBody.on("change input", function() {
   
    modifyScheduleFilters();   

    
    const filteredResults = filterFlights(searchResults); 
    
   
    renderFlights(filteredResults);
    console.log("Filtered Flights Array:", filteredResults);

});
//listen to any changes in the list of airline checkboxes
listofAirlines.on("change", function(){
    modifyAirlineFilters();
})

listofDeparture.on("change", function(){
    modifyScheduleFilters();

    
})



resetSchedules.on("click", function(){
    morning.prop("checked", true);
    afternoon.prop("checked", true);
    evening.prop("checked", true);
    night.prop("checked", true);
    modifyScheduleFilters();
})
selectAllAirline.on("click", function(){
    palCheckbox.prop("checked", true);
    cebPacCheckbox.prop("checked", true);
    airsiaCheckbox.prop("checked", true);
    cathPacCheckbox.prop("checked", true);

    modifyAirlineFilters();
})



priceRange.on("input",function(){
    var value = Number($(this).val());

    
    currentPrice.text(`PHP ${value.toLocaleString()}`);
})
openSidebarBtn.on("click",function(){
   initSidebarPriceFilter(sortFlights("ticketPrice",false));
})



function initSidebarPriceFilter(flights){

    
    //fail safe
    if (!flights || flights.length === 0) {
        $("#sidebar-price-range").attr("max", 1000).val(1000);
        $("#price-limit-label").text("PHP 1,000");
        return;
    }

    var highestPrice = Number(flights.at(-1).ticketPrice);
    priceRange.attr("max",highestPrice);
    
    priceLimitDisplay.text(`PHP ${highestPrice.toLocaleString()}`);
}

function showSidebarBtn() {

    if (hasSearched === false) {
        openSidebarBtn.addClass("d-none");
    } else if (hasSearched === true && openSidebarBtn.hasClass("d-none")) {
        openSidebarBtn.removeClass("d-none");
    }

}




function modifyAirlineFilters() {
        airlineFilters.length = 0; 

        $(".airline-filter:checked").each(function(){
            airlineFilters.push($(this).val());
        });

       
    }


function modifyScheduleFilters(){

    departureSchedules.length = 0;

    $(".departure-filter:checked").each(function(){
        departureSchedules.push($(this).val());
    })


}




function filterFlights(flights = searchResults){
    console.log("search result in function: ", flights)
   var airlines = airlineFilters;
   var schedules = departureSchedules;
   var price = Number(priceRange.val());
   var stops = Number( $("input[name='stop-group']:checked").val() );

   console.log("airlines: ",airlines);
    return flights.filter(flight =>{


        if (airlines.length > 0 && !airlines.includes(flight.airline)) {
            return false;
        }

        if (schedules.length > 0) {
            const hour = parseInt(flight.Departure.split(":")[0]); // parses "14:30" -> 14
            let matchSchedule = false;

            if (schedules.includes("morning") && hour >= 6 && hour < 12){
                matchSchedule = true;
            }
            if (schedules.includes("afternoon") && hour >= 12 && hour < 18){
                matchSchedule = true;
            }
            if (schedules.includes("evening") && hour >= 18 && hour < 24){
                matchSchedule = true;
            }
            if (schedules.includes("night") && (hour >= 0 && hour < 6)){
                matchSchedule = true;
            }

            if (!matchSchedule) return false; // Skip if it doesnt match any checked timeframe
        }


        if(Number(flight.ticketPrice) > price){
            return false;
        }

        
        if (stops === 2) {
           
            if (flight.numOfLayovers < stops) {
                return false;
            }
        } else {
            // Exact match for 0 (Direct) or 1 Stop
            if (flight.numOfLayovers !== stops) {
                return false;
            }
        }

     return true;
    })

    
}








