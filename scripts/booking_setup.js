const bookingInfo = getBookingInfo();
const selectedDeparture = JSON.parse(sessionStorage.getItem("selected_departure"));
const selectedReturn = JSON.parse(sessionStorage.getItem("selected_return"));
const isRoundTrip = bookingInfo.tripType === "round-trip";

$(document).ready(function() {

    // generate passenger cards
    function generatePassengerCards() {
        const { adults, children, infants } = bookingInfo.passengers;
        let cardsHTML = "";

        for (let i = 1; i <= adults; i++) {
            cardsHTML += createCard("Adult", i, "adult-" + i);
        }

        for (let i = 1; i <= children; i++) {
            cardsHTML += createCard("Child", i, "child-" + i);
        }

        for (let i = 1; i <= infants; i++) {
            cardsHTML += createCard("Infant", i, "infant-" + i);
        }

        $("#passenger-list").html(cardsHTML);
    }

    function createCard(type, num, key) {
        const returnSeatRow = isRoundTrip ? `
            <p class="mb-1"><small>Return Seat: <span id="display-return-seat-${key}">—</span></small></p>
        ` : "";

        return `
        <div class="col">
            <div class="card h-100 p-3">
                <h5 class="card-title">${type} ${num}</h5>
                <button class="btn btn-add-details w-100" data-passenger="${key}">
                    Add this traveler's details
                </button>
                <hr>
                <p class="mb-1"><small>Name: <span id="display-name-${key}">—</span></small></p>
                <p class="mb-1"><small>Departure Seat: <span id="display-seat-${key}">—</span></small></p>
                ${returnSeatRow}
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

    // populate flight details in sidebar
    function populateFlightDetails() {
        if (!selectedDeparture) return;

        const cabinLabels = {
            economy: "Economy",
            premium_economy: "Premium Economy",
            business: "Business Class",
            first_class: "First Class"
        };

        // departure flight
        $("#summary-dep-flight").text(selectedDeparture.airline + " " + selectedDeparture.flightNum);
        $("#summary-dep-route").text(selectedDeparture.origin + " → " + selectedDeparture.destination);
        $("#summary-dep-departure").text(selectedDeparture.departure);
        $("#summary-dep-arrival").text(selectedDeparture.arrival);
        $("#summary-dep-duration").text(selectedDeparture.duration);
        $("#summary-cabin").text(cabinLabels[selectedDeparture.cabinType]);
        $("#summary-passengers").text(getTotalPassengers(bookingInfo));

        if (isRoundTrip) {
            $("#return-seat-row").show();
        }

        // return flight
        if (isRoundTrip && selectedReturn) {
            $("#summary-ret-flight").text(selectedReturn.airline + " " + selectedReturn.flightNum);
            $("#summary-ret-route").text(selectedReturn.origin + " → " + selectedReturn.destination);
            $("#summary-ret-departure").text(selectedReturn.departure);
            $("#summary-ret-arrival").text(selectedReturn.arrival);
            $("#summary-ret-duration").text(selectedReturn.duration);
            $("#summary-return-section").show();
        } else {
            $("#summary-return-section").hide();
        }
    }

    generatePassengerCards();
    populateFlightDetails();
});