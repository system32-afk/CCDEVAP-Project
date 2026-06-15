const bookingInfo = getBookingInfo();
const selectedFlight = JSON.parse(sessionStorage.getItem("selected_flight"));

$(document).ready(function() {

    // generate passenger cards
    function generatePassengerCards() {
        const { adults, children, infants } = bookingInfo.passengers;
        let cardsHTML = "";

        // adult cards
        for (let i = 1; i <= adults; i++) {
            cardsHTML += createCard("Adult", i, "adult-" + i);
        }

        // child cards
        for (let i = 1; i <= children; i++) {
            cardsHTML += createCard("Child", i, "child-" + i);
        }

        // infant cards
        for (let i = 1; i <= infants; i++) {
            cardsHTML += createCard("Infant", i, "infant-" + i);
        }

        $("#passenger-list").html(cardsHTML);
    }

    function createCard(type, num, key) {
        return `
        <div class="col">
            <div class="card h-100 p-3">
                <h5 class="card-title">${type} ${num}</h5>
                <button class="btn btn-add-details w-100" data-passenger="${key}">
                    Add this traveler's details
                </button>
                <hr>
                <p class="mb-1"><small>Name: <span id="display-name-${key}">—</span></small></p>
                <p class="mb-1"><small>Seat: <span id="display-seat-${key}">—</span></small></p>
                <p class="mb-1"><small>Meal: <span id="display-meal-${key}">—</span></small></p>
                <hr>
                <p class="mb-1"><small>Additional Baggage: <span id="display-baggage-${key}">—</span></small></p>
                <p class="mb-1"><small>Priority Boarding: <span id="display-priority-${key}">—</span></small></p>
                <p class="mb-1"><small>Travel Insurance: <span id="display-insurance-${key}">—</span></small></p>
                <p class="mb-1"><small>Lounge Access: <span id="display-lounge-${key}">—</span></small></p>
            </div>
        </div>
        `;
    }

    const cabinLabels = {
        economy: "Economy",
        premium_economy: "Premium Economy",
        business: "Business Class",
        first_class: "First Class"
    };

    // populate flight details in sidebar
    function populateFlightDetails() {
        if (!selectedFlight) return;
        $("#summary-flight").text(selectedFlight.airline + " " + selectedFlight.flightNum);
        $("#summary-route").text(selectedFlight.origin + " → " + selectedFlight.destination);
        $("#summary-departure").text(selectedFlight.departure);
        $("#summary-arrival").text(selectedFlight.arrival);
        $("#summary-duration").text(selectedFlight.duration);
        $("#summary-cabin").text(cabinLabels[selectedFlight.cabinType]);
        $("#summary-passengers").text(getTotalPassengers(bookingInfo));
    }

    generatePassengerCards();
    populateFlightDetails();
});