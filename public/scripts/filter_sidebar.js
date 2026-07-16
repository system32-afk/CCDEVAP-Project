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

//apply all filters
const APPLYFILTER = $("#apply-all-filter");

FILTERRESET.on("click",function(){
    $(".airline-filter, .departure-filter").prop("checked", true);

    $("#stop-any").prop("checked", true);
    priceRange.val(500);
    currentPrice.text("PHP 500");

    SearchFlight()//reset search query
})

APPLYFILTER.on("click",function(){
    applyAllFilters();
})


$(document).ready(function() {
 showSidebarBtn()
 modifyAirlineFilters();
 modifyScheduleFilters()
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
   initSidebarPriceFilter(searchResults);
})


function initSidebarPriceFilter(flights){
    FILTEREDRESULTS = searchResults;



    if (filter_options.airline != "any") {
    $(".airline-filter").attr("disabled", true); 
    } else {
        $(".airline-filter").attr("disabled", false);  
    }
    
    //fail safe
    if (!flights || flights.length === 0) {
        $("#sidebar-price-range").attr("max", 1000).val(1000);
        $("#price-limit-label").text("PHP 1,000");
        return;
    }

    var prices = flights.map(flight => {
        const cabinTypes = flight.cabin;

        const classKey = Object.keys(cabinTypes).find(key => key !== '_id');
        return cabinTypes[classKey]?.price;
    });

    
    var highestPrice = Math.max(...prices);
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


function filterAirilines(flights){
     
    var airlines = airlineFilters;
   
    return flights.filter(flight => {
        if (airlines.length > 0 && !airlines.includes(flight.airline)) {
            return false;
        }
        return true;
    });

}

function filterSchedules(flights){
    var schedules = departureSchedules;

    return flights.filter(flight =>{
        if (schedules.length > 0) {
            const hour = parseInt(flight.departureTime.split(":")[0]); // parses "14:30" -> 14
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

            if (!matchSchedule){
                return false; // Skip if it doesnt match any checked timeframe
            }

        }
     return true;
    })
}

function filterPrice(flights){
    var price = Number(priceRange.val());
    return flights.filter(flight =>{
        if(Number(flight.ticketPrice) > price){
            return false;
        }
     return true;
    })

    
}

function filterStops(flights){

    var stops =  $("input[name='stop-group']:checked").val();
    console.log("STOPS: ", stops);

    //user has no stops preference
    if (stops === "any"){
        return flights;
    }
    
    stops = Number(stops); //make it a number
    return flights.filter(flight =>{


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


function applyAllFilters() {
    // always start fresh from the original search results
    let temporaryList = searchResults;

    
    temporaryList = filterAirilines(temporaryList);

    
    temporaryList = filterSchedules(temporaryList);

    temporaryList = filterPrice(temporaryList);

    temporaryList = filterStops(temporaryList);
   
    //if there is a sorting preference
    if(currentSortOption){
        console.log("sorted and filtered");

        console.log("sorting option: ",currentSortOption);
        const sortedAndFiltered = sortArray(currentSortOption,"ascending",temporaryList);
         renderFlights(sortedAndFiltered);
         return;
    }

   console.log(temporaryList);
    renderFlights(temporaryList);
}

