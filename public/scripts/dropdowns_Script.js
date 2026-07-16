const cabinOptions = $(".cabin-row");
const cabinField = $("#cabin-select");
const airlineOptions = $(".airline-row");
const airlineField = $("#airline-select");
const airlineDropdown = $("#airline-dropdown");

let airlines = [];

async function loadAirlines() {
    try {

        const response = await fetch("/api/airlines");

        const data = await response.json();

        airlines = data
        
        //fallback
        airlineDropdown.html(`
            <div class="airline-row" data-airline="any">
                Any
            </div>
        `);

        airlines.forEach(airline => {
            let airlineName = airline.airlineName;
            const airlineHtml = `
                <div class="airline-row" data-airline="${airlineName}">
                    ${airlineName}
                </div>
            `;
            airlineDropdown.append(airlineHtml);
        });

    } catch (err) {
        console.error(err);
    }
}

$(async function(){
    cabinField.text(booking_info.cabinType);
    
    // fetch and render the dynamic airline options safely
    await loadAirlines();
});


cabinOptions.on("click", function(e) {
    var selectedCabinType = $(this).data("displayCabinType");
    var text = $(this).text();
    cabinField.text(text);
    booking_info.cabinType   = $(this).data("cabin");
    console.log(booking_info.cabinType)

});

airlineDropdown.on("click", ".airline-row", function() {
    var text = $(this).text().trim();
    var selectedAirline = $(this).data("airline");
    
    filter_options.airline = selectedAirline;
    airlineField.text(text);
    
    console.log("Selected Airline Value:", filter_options.airline);
});


