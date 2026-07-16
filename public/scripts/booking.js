$(document).ready(function () {

    function beforeUnloadHandler(e) {
        e.preventDefault();
    }
    window.addEventListener("beforeunload", beforeUnloadHandler);

    // stores which passenger is currently being edited
    var currentPassenger = null;

    // detects if the flight is a roundtrip
    var returnFlightId = $("#return-flight-id").val();
    var isRoundTrip = returnFlightId !== "";

    // increase booking steps for roundtrip flights
    var totalSteps = 4
    if (isRoundTrip) {
        totalSteps = 7;
    }

    // totals for departure flight selections
    var totals = {
        seats: [],
        meals: [],
        baggage: 0,
        priority: 0,
        insurance: 0,
        lounge: 0,
        mealCost: 0,
        seatCost: 0,
        extrasCost: 0
    };

    // totals for return flight selections (roundtrip)
    var returnTotals = {
        seats: [],
        meals: [],
        baggage: 0,
        priority: 0,
        insurance: 0,
        lounge: 0,
        mealCost: 0,
        seatCost: 0,
        extrasCost: 0
    };

    // get how many passenger cards to display
    var bookingInfo = JSON.parse(sessionStorage.getItem("booking_info")) || {
        passengers: { adults: 1, children: 0, infants: 0 }
    };
    var passengerCounts = bookingInfo.passengers;

    // saved departure passenger data
    var saved = {};
    for (var i = 1; i <= passengerCounts.adults; i++) {
        saved["adult-" + i] = null;
    }
    for (var i = 1; i <= passengerCounts.children; i++) {
        saved["child-" + i] = null;
    }
    for (var i = 1; i <= passengerCounts.infants; i++) {
        saved["infant-" + i] = null; 
    }

    // saved return passenger data (roundtrip)
    var returnSaved = {};
    if (isRoundTrip) {
        for (var i = 1; i <= passengerCounts.adults; i++) {
            returnSaved["adult-" + i] = null;
        }
        for (var i = 1; i <= passengerCounts.children; i++) {
            returnSaved["child-" + i] = null;
        }
        for (var i = 1; i <= passengerCounts.infants; i++) {
            returnSaved["infant-" + i] = null;
        }
    }

    // flight id from hidden input
    var flightId = $("#flight-id").val();

    // price breakdown
    var selectedFlight = JSON.parse(sessionStorage.getItem("selected_flight")) || 
                         JSON.parse(sessionStorage.getItem("selected_departure"));
    var selectedReturn = JSON.parse(sessionStorage.getItem("selected_return"));
    var basePrice = 0;
    var returnBasePrice = 0;

    if (selectedFlight) {
        var adultPrice = selectedFlight.ticketPrice;
        var childPrice = Math.round(selectedFlight.ticketPrice * 0.75);
        var infantPrice = Math.round(selectedFlight.ticketPrice * 0.25);
        basePrice = (passengerCounts.adults * adultPrice) +
                    (passengerCounts.children * childPrice) +
                    (passengerCounts.infants * infantPrice);
    }

    if (isRoundTrip && selectedReturn) {
        var rtAdultPrice = selectedReturn.ticketPrice;
        var rtChildPrice = Math.round(selectedReturn.ticketPrice * 0.75);
        var rtInfantPrice = Math.round(selectedReturn.ticketPrice * 0.25);
        returnBasePrice = (passengerCounts.adults * rtAdultPrice) +
                          (passengerCounts.children * rtChildPrice) +
                          (passengerCounts.infants * rtInfantPrice);
    }

    var MEAL_PRICES = {standard: 0, vegetarian: 150, vegan: 200, halal: 100, kosher: 350, "gluten-free": 300};
    var SEAT_UPGRADE = 500;
    var BAGGAGE_PRICE = 300;
    var PRIORITY_PRICE = 250;
    var INSURANCE_PRICE = 400;
    var LOUNGE_PRICE = 600;
    var TAX_RATE = 0.12;

    // loads passenger cards based on passenger counts
    function loadPassengerCards() {
        var list = $("#passenger-list");
        list.empty();

        for (var i = 1; i <= passengerCounts.adults; i++) {
            list.append(buildCard("adult", i));
        }
        for (var i = 1; i <= passengerCounts.children; i++) {
            list.append(buildCard("child", i));
        }
        for (var i = 1; i <= passengerCounts.infants; i++) {
            list.append(buildCard("infant", i));
        }
    }

    // builds the passenger cards
    function buildCard(type, num) {
        var id = type + "-" + num;
        var label = type.charAt(0).toUpperCase() + type.slice(1) + " " + num;
        var extras = "";

        if (type !== "infant") { // infants have a different card
            if (isRoundTrip) {
                // round trip cards show departure and return seats separately
                extras = "<p class='passenger-detail'>Departure Seat: <span id='display-seat-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Return Seat: <span id='display-rt-seat-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Meal: <span id='display-meal-" + id + "'>-</span></p>" +
                         "<hr>" +
                         "<p class='passenger-detail'>Additional Baggage: <span id='display-baggage-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Priority Boarding: <span id='display-priority-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Travel Insurance: <span id='display-insurance-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Lounge Access: <span id='display-lounge-" + id + "'>-</span></p>";
            } else {
                // one-way cards show only departure seat
                extras = "<p class='passenger-detail'>Seat: <span id='display-seat-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Meal: <span id='display-meal-" + id + "'>-</span></p>" +
                         "<hr>" +
                         "<p class='passenger-detail'>Additional Baggage: <span id='display-baggage-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Priority Boarding: <span id='display-priority-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Travel Insurance: <span id='display-insurance-" + id + "'>-</span></p>" +
                         "<p class='passenger-detail'>Lounge Access: <span id='display-lounge-" + id + "'>-</span></p>";
            }
        }

        return "<div class='col'>" +
            "<div class='card h-100 p-3'>" +
                "<h5 class='card-title'>" + label + "</h5>" +
                "<button class='btn btn-add-details w-100' data-passenger='" + id + "'>Add this traveler's details</button>" +
                "<hr>" +
                "<p class='passenger-detail'>Name: <span id='display-name-" + id + "'>-</span></p>" +
                extras +
                "<hr>" +
                "<div>" +
                    "<span class='summary-total-label'>Total: </span>" +
                    "<span class='summary-total-value' id='display-price-" + id + "'>-</span>" +
                "</div>" +
            "</div>" +
        "</div>";
    }

    loadPassengerCards();

    // loads the sidebar flight details from sessionStorage
    function loadFlightDetails() {
        var flight = selectedFlight;

        if (!flight) {
            return;
        }

        $("#summary-flight").text(flight.airline + " " + flight.flightNum);
        $("#summary-route").text(flight.origin + " → " + flight.destination);
        $("#summary-departure").text(flight.departure);
        $("#summary-arrival").text(flight.arrival);
        $("#summary-duration").text(flight.duration);

        var cabinWords = flight.cabinType.split("_");
        var cabinDisplay = "";
        for (var i = 0; i < cabinWords.length; i++) {
            var word = cabinWords[i];
            var firstLetter = word.charAt(0).toUpperCase();
            var restOfWord = word.slice(1);
            cabinDisplay += firstLetter + restOfWord + " ";
        }
        cabinDisplay = cabinDisplay.trim();

        $("#summary-cabin").text(cabinDisplay);
        $("#summary-passengers").text(passengerCounts.adults + passengerCounts.children + passengerCounts.infants);
        $("#summary-base").text("₱" + (basePrice + returnBasePrice).toLocaleString());

        // show return flight details only for roundtrips
        if (isRoundTrip && selectedReturn) {
            $("#summary-return-flight").text(selectedReturn.airline + " " + selectedReturn.flightNum);
            $("#summary-return-route").text(selectedReturn.origin + " → " + selectedReturn.destination);
            $("#summary-return-departure").text(selectedReturn.departure);
            $("#summary-return-arrival").text(selectedReturn.arrival);
            $("#summary-return-duration").text(selectedReturn.duration);
            $("#return-flight-details").show();
        }

        updateSummary();
    }

    loadFlightDetails();

    var ROWS = 10;
    var PREMIUM_ROWS = [1, 2];
    var COLS = ["A", "B", "C", "D", "E", "F"];

    function buildSeatRows(occupied, seatClass) {
        var html = "";
        for (var r = 1; r <= ROWS; r++) {
            html += '<div class="d-flex align-items-center gap-1 mb-1">';
            html += '<div class="seat-row-label text-muted small fw-bold">' + r + '</div>';
            for (var i = 0; i < COLS.length; i++) {
                var label = r + COLS[i];
                var isPremium = PREMIUM_ROWS.indexOf(r) !== -1;
                var isOccupied = occupied.indexOf(label) !== -1;

                var status = "Available";
                if (isOccupied) {
                    status = "Occupied";
                } else if (isPremium) {
                    status = "Premium";
                }

                var cls = seatClass;
                if (isPremium) {
                    cls += " premium";
                } else {
                    cls += " available";
                }

                if (isOccupied) {
                    cls += " occupied";
                }
                
                html += '<div class="seat-cell"><div class="' + cls + '" data-seat="' + label + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Seat ' + label + ' - ' + status + '"></div></div>';
                if (i === 2) html += '<div class="seat-aisle"></div>';
            }
            html += '</div>';
        }
        return html;
    }

    function loadSeatMap(flightIdToUse, cabinType, containerId, seatClass) {
        $.getJSON("/occupied-seats", { flightId: flightIdToUse, cabinType: cabinType })
            .done(function(data) {
                $("#" + containerId).append(buildSeatRows(data.occupiedSeats || [], seatClass));
                $('[data-bs-toggle="tooltip"]').tooltip();
            });
    }

    if (selectedFlight) {
        loadSeatMap(flightId, selectedFlight.cabinType, "departure-seat-map", "seat");
    }
    if (isRoundTrip && selectedReturn) {
        loadSeatMap(returnFlightId, selectedReturn.cabinType, "return-seat-map", "rt-seat");
    }

    // hides all steps except the current step number
    function goToStep(n) {
        $(".passenger-step").hide();
        $("#passenger-step-" + n).show();
        $(".progress-bar").css("width", (n / totalSteps * 100) + "%");
    }

    // clears all form inputs and selections
    function resetForm() {
        $("#passenger-form input, #passenger-form select").val("");
        $(".meal-option, .rt-meal-option").removeClass("selected");
        $(".seat, .rt-seat").removeClass("selected");
        $("#selected-seat-display").text("None");
        $("#rt-selected-seat-display").text("None");
        $("#baggage-count, #rt-baggage-count").text(0);
        $("#priority-toggle, #insurance-toggle, #lounge-toggle").prop("checked", false);
        $("#rt-priority-toggle, #rt-insurance-toggle, #rt-lounge-toggle").prop("checked", false);
        $(".inline-validation").hide();
    }

    function syncLocalSeatLocks() {
        $(".seat.local-lock").removeClass("occupied local-lock");
        $(".rt-seat.local-lock").removeClass("occupied local-lock");

        for (var key in saved) {
            if (saved[key] && saved[key].seat && saved[key].seat !== "None") {
                $(".seat[data-seat='" + saved[key].seat + "']").addClass("occupied local-lock");
            }
        }
        for (var rkey in returnSaved) {
            if (returnSaved[rkey] && returnSaved[rkey].seat && returnSaved[rkey].seat !== "None") {
                $(".rt-seat[data-seat='" + returnSaved[rkey].seat + "']").addClass("occupied local-lock");
            }
        }
    }

    // hides the passenger form and shows the passenger list again
    function backToList() {
        currentPassenger = null;
        resetForm();
        syncLocalSeatLocks();   // <-- add this line
        updateSummary();
        $("#passenger-form").hide();
        $("#passenger-list, #outside-buttons").show();
    }

    // formats meal counts like "2x Standard, 1x Halal"
    function formatMeals(mealsArray) {
        if (!mealsArray.length) {
            return "-";
        }

        var counts = {};

        for (var i = 0; i < mealsArray.length; i++) {
            counts[mealsArray[i]] = (counts[mealsArray[i]] || 0) + 1;
        }

        var display = "";
        var keys = Object.keys(counts);

        for (var i = 0; i < keys.length; i++) {
            if (display) {
                display += ", ";
            }
            display += counts[keys[i]] + "x " + keys[i];
        }

        return display;
    }

    // live updates while filling form
    function updateSummaryLive() {
        var depMeal = $(".meal-option.selected").data("meal");
        var depSeat = $(".seat.selected").data("seat");
        var depBaggage = parseInt($("#baggage-count").text());
        var depPriority = $("#priority-toggle").is(":checked");
        var depInsurance = $("#insurance-toggle").is(":checked");
        var depLounge = $("#lounge-toggle").is(":checked");

        var rtMeal = $(".rt-meal-option.selected").data("meal");
        var rtSeat = $(".rt-seat.selected").data("seat");
        var rtBaggage = parseInt($("#rt-baggage-count").text()) || 0;
        var rtPriority = $("#rt-priority-toggle").is(":checked");
        var rtInsurance = $("#rt-insurance-toggle").is(":checked");
        var rtLounge = $("#rt-lounge-toggle").is(":checked");

        var depMealCost = 0;
        if (depMeal) {
            depMealCost = MEAL_PRICES[depMeal];
        }
        var depSeatCost = 0;
        if (depSeat && $(".seat.selected").hasClass("premium")) {
            depSeatCost = SEAT_UPGRADE;
        }
        var depExtras = depBaggage * BAGGAGE_PRICE;
        if (depPriority) {
            depExtras += PRIORITY_PRICE;
        }
        if (depInsurance) {
            depExtras += INSURANCE_PRICE;
        }
        if (depLounge) {
            depExtras += LOUNGE_PRICE;
        }

        var rtMealCost = 0;
        if (rtMeal) {
            rtMealCost = MEAL_PRICES[rtMeal];
        }
        var rtSeatCost = 0;
        if (rtSeat && $(".rt-seat.selected").hasClass("premium")) {
            rtSeatCost = SEAT_UPGRADE;
        }
        var rtExtras = rtBaggage * BAGGAGE_PRICE;
        if (rtPriority) {
            rtExtras += PRIORITY_PRICE;
        }
        if (rtInsurance) {
            rtExtras += INSURANCE_PRICE;
        }
        if (rtLounge) {
            rtExtras += LOUNGE_PRICE;
        }

        var depSubtotal = basePrice + totals.mealCost + totals.seatCost + totals.extrasCost + depMealCost + depSeatCost + depExtras;
        var depTaxes = Math.round(depSubtotal * TAX_RATE);

        var rtSubtotal = returnBasePrice + returnTotals.mealCost + returnTotals.seatCost + returnTotals.extrasCost + rtMealCost + rtSeatCost + rtExtras;
        var rtTaxes = Math.round(rtSubtotal * TAX_RATE);

        var subtotal = depSubtotal + rtSubtotal;
        var taxes = depTaxes + rtTaxes;

        var allSeats = totals.seats.concat(returnTotals.seats);
        if (depSeat) {
            allSeats.push(depSeat);
        }
        if (rtSeat) {
            allSeats.push(rtSeat);
        }

        var allMeals = totals.meals.concat(returnTotals.meals);
        if (depMeal) {
            allMeals.push(depMeal.charAt(0).toUpperCase() + depMeal.slice(1));
        }
        if (rtMeal) {
            allMeals.push(rtMeal.charAt(0).toUpperCase() + rtMeal.slice(1));
        }

        if (allSeats.length) {
            $("#summary-seat").text(allSeats.join(", "));
        } else {
            $("#summary-seat").text("-");
        }

        $("#summary-meal").text(formatMeals(allMeals));
        $("#summary-baggage").text(totals.baggage + returnTotals.baggage + depBaggage + rtBaggage);

        var priorityCount = totals.priority + returnTotals.priority;
        if (depPriority) {
            priorityCount++;
        }
        if (rtPriority) {
            priorityCount++;
        }
        $("#summary-priority").text(priorityCount);

        var insuranceCount = totals.insurance + returnTotals.insurance;
        if (depInsurance) {
            insuranceCount++;
        }
        if (rtInsurance) {
            insuranceCount++;
        }
        $("#summary-insurance").text(insuranceCount);

        var loungeCount = totals.lounge + returnTotals.lounge;
        if (depLounge) {
            loungeCount++;
        }
        if (rtLounge) {
            loungeCount++;
        }

        $("#summary-lounge").text(loungeCount);
        $("#summary-meal-cost").text("₱" + (totals.mealCost + returnTotals.mealCost + depMealCost + rtMealCost).toLocaleString());
        $("#summary-seat-cost").text("₱" + (totals.seatCost + returnTotals.seatCost + depSeatCost + rtSeatCost).toLocaleString());
        $("#summary-extras").text("₱" + (totals.extrasCost + returnTotals.extrasCost + depExtras + rtExtras).toLocaleString());
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // update after done is clicked
    function updateSummary() {
        var subtotal = basePrice + returnBasePrice +
                       totals.mealCost + totals.seatCost + totals.extrasCost +
                       returnTotals.mealCost + returnTotals.seatCost + returnTotals.extrasCost;
        var taxes = Math.round(subtotal * TAX_RATE);

        var allSeats = totals.seats.concat(returnTotals.seats);
        var allMeals = totals.meals.concat(returnTotals.meals);

        if (allSeats.length) {
            $("#summary-seat").text(allSeats.join(", "));
        } else {
            $("#summary-seat").text("-");
        }
        $("#summary-meal").text(formatMeals(allMeals));
        $("#summary-baggage").text(totals.baggage + returnTotals.baggage);
        $("#summary-priority").text(totals.priority + returnTotals.priority);
        $("#summary-insurance").text(totals.insurance + returnTotals.insurance);
        $("#summary-lounge").text(totals.lounge + returnTotals.lounge);
        $("#summary-meal-cost").text("₱" + (totals.mealCost + returnTotals.mealCost).toLocaleString());
        $("#summary-seat-cost").text("₱" + (totals.seatCost + returnTotals.seatCost).toLocaleString());
        $("#summary-extras").text("₱" + (totals.extrasCost + returnTotals.extrasCost).toLocaleString());
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-base").text("₱" + (basePrice + returnBasePrice).toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // open passenger form
    $(".btn-add-details").click(function() {
        currentPassenger = $(this).data("passenger");
        resetForm();

        // load saved data back into form if passenger was already filled
        if (saved[currentPassenger]) {
            var s = saved[currentPassenger];
            $("#full-name").val(s.fullName);
            $("#email").val(s.email);
            $("#contact").val(s.contact);
            $("#passport").val(s.passport);
            $("#nationality").val(s.nationality);
            $("#birthdate").val(s.birthdate);
            $("#gender").val(s.gender);
            $("#emergency-contact").val(s.emergencyContact);

            if (s.meal) {
                $(".meal-option[data-meal='" + s.meal + "']").addClass("selected");
            }
            
            if (s.seat) {
                $(".seat[data-seat='" + s.seat + "']").addClass("selected"); $("#selected-seat-display").text(s.seat);
            }
            $(".seat[data-seat='" + s.seat + "']").removeClass("occupied local-lock");
            
            $("#baggage-count").text(s.baggage);
            $("#priority-toggle").prop("checked", s.priority);
            $("#insurance-toggle").prop("checked", s.insurance);
            $("#lounge-toggle").prop("checked", s.lounge);

            // subtract departure totals while editing so the count doesn't double
            if (s.seat && s.seat !== "None") {
                var si = totals.seats.indexOf(s.seat);
                if (si !== -1) {
                    totals.seats.splice(si, 1);
                }
            }

            if (s.meal) {
                var sd = s.meal.charAt(0).toUpperCase() + s.meal.slice(1);
                var smi = totals.meals.indexOf(sd);
                if (smi !== -1) {
                    totals.meals.splice(smi, 1);
                }
                totals.mealCost -= MEAL_PRICES[s.meal] || 0;
            }

            totals.baggage -= s.baggage;

            if (s.priority) {
                totals.priority--;
            }
            if (s.insurance) {
                totals.insurance--;
            }
            if (s.lounge) {
                totals.lounge--;
            }

            var sExtras = s.baggage * BAGGAGE_PRICE;
            if (s.priority) {
                sExtras += PRIORITY_PRICE;
            }
            if (s.insurance) {
                sExtras += INSURANCE_PRICE;
            }
            if (s.lounge) {
                sExtras += LOUNGE_PRICE;
            }

            totals.extrasCost -= sExtras;
            if ($(".seat[data-seat='" + s.seat + "']").hasClass("premium")) {
                totals.seatCost -= SEAT_UPGRADE;
            }
        }

        // load return data back if roundtrip and already saved
        if (isRoundTrip && returnSaved[currentPassenger]) {
            var rs = returnSaved[currentPassenger];

            if (rs.meal) {
                $(".rt-meal-option[data-meal='" + rs.meal + "']").addClass("selected");
            }
            if (rs.seat) {
                $(".rt-seat[data-seat='" + rs.seat + "']").addClass("selected"); $("#rt-selected-seat-display").text(rs.seat);
            }
            $(".rt-seat[data-seat='" + rs.seat + "']").removeClass("occupied local-lock");
            

            $("#rt-baggage-count").text(rs.baggage);
            $("#rt-priority-toggle").prop("checked", rs.priority);
            $("#rt-insurance-toggle").prop("checked", rs.insurance);
            $("#rt-lounge-toggle").prop("checked", rs.lounge);

            // subtract return totals while editing
            if (rs.seat && rs.seat !== "None") {
                var rsi = returnTotals.seats.indexOf(rs.seat);
                if (rsi !== -1) {
                    returnTotals.seats.splice(rsi, 1);
                }
            }
            if (rs.meal) {
                var rsd = rs.meal.charAt(0).toUpperCase() + rs.meal.slice(1);
                var rsmi = returnTotals.meals.indexOf(rsd);
                if (rsmi !== -1) {
                    returnTotals.meals.splice(rsmi, 1);
                }
                returnTotals.mealCost -= MEAL_PRICES[rs.meal] || 0;
            }

            returnTotals.baggage -= rs.baggage;

            if (rs.priority) {
                returnTotals.priority--;
            }
            if (rs.insurance) {
                returnTotals.insurance--;
            }
            if (rs.lounge) {
                returnTotals.lounge--;
            }

            var rsExtras = rs.baggage * BAGGAGE_PRICE;
            if (rs.priority) {
                rsExtras += PRIORITY_PRICE;
            }
            if (rs.insurance) {
                rsExtras += INSURANCE_PRICE;
            }
            if (rs.lounge) {
                rsExtras += LOUNGE_PRICE;
            }

            returnTotals.extrasCost -= rsExtras;
            if ($(".rt-seat[data-seat='" + rs.seat + "']").hasClass("premium")) {
                returnTotals.seatCost -= SEAT_UPGRADE;
            }
        }

        $("#passenger-list, #outside-buttons").hide();
        $("#passenger-form").show();

        goToStep(1);

        // infants only need step 1
        if (currentPassenger.indexOf("infant") !== -1) {
            $(".progress-bar").css("width", "100%");
            $("#btn-next-1").text("Done");
            $("#contact").closest(".col-md-6").hide();
            $("#passport").closest(".col-md-6").hide();
        } else {
            $("#btn-next-1").text("Next");
            $("#contact").closest(".col-md-6").show();
            $("#passport").closest(".col-md-6").show();
        }

        // change button text for non roundtrips (step 4 is done)
        if (isRoundTrip) {
            $("#btn-next-4").text("Next");
        } else {
            $("#btn-next-4").text("Done");
        }
    });

    // passenger details validation
    $("#btn-next-1").click(function() {
        var valid = true;

        if (!document.getElementById("full-name").checkValidity()) {
            $("#err-full-name").show(); valid = false;
        } else {
            $("#err-full-name").hide();
        }

        if (!document.getElementById("email").checkValidity()) {
            $("#err-email").show(); valid = false;
        } else {
            $("#err-email").hide();
        }

        // infants dont need contact or passport
        if (currentPassenger.indexOf("infant") === -1) {
            if (!$("#contact").val().trim()) {
                $("#err-contact").show(); valid = false;
            } else {
                $("#err-contact").hide();
            }

            if (!$("#passport").val().trim()) {
                $("#err-passport").show(); valid = false;
            } else {
                $("#err-passport").hide();
            }
        } else {
            $("#err-contact").hide();
            $("#err-passport").hide();
        }

        if (!$("#nationality").val()) {
            $("#err-nationality").show(); valid = false;
        } else {
            $("#err-nationality").hide();
        }

        var birthdate = new Date($("#birthdate").val());
        if (!$("#birthdate").val() || birthdate > new Date()) {
            $("#err-birthdate").show(); valid = false;
        } else {
            $("#err-birthdate").hide();
        }

        if (!$("#gender").val()) {
            $("#err-gender").show(); valid = false;
        } else {
            $("#err-gender").hide();
        }

        if (!$("#emergency-contact").val().trim()) {
            $("#err-emergency").show(); valid = false;
        } else {
            $("#err-emergency").hide();
        }

        if (valid) {
            // infants skip all steps
            if (currentPassenger.indexOf("infant") !== -1) {
                var depInfantPrice = 0;
                if (selectedFlight) {
                    depInfantPrice = Math.round(selectedFlight.ticketPrice * 0.25);
                }
                var rtInfantPrice = 0;
                if (isRoundTrip && selectedReturn) {
                    rtInfantPrice = Math.round(selectedReturn.ticketPrice * 0.25);
                }
                var depInfantTax = Math.round(depInfantPrice * TAX_RATE);
                var depInfantTotal = depInfantPrice + depInfantTax;

                var rtInfantTax = Math.round(rtInfantPrice * TAX_RATE);
                var rtInfantTotal = rtInfantPrice + rtInfantTax;

                saved[currentPassenger] = {
                    passengerType: "infant",
                    fullName: $("#full-name").val().trim(),
                    email: $("#email").val().trim(),
                    contact: null,
                    passport: null,
                    nationality: $("#nationality").val(),
                    birthdate: $("#birthdate").val(),
                    gender: $("#gender").val(),
                    emergencyContact: $("#emergency-contact").val().trim(),
                    meal: null, seat: null, baggage: 0,
                    priority: false, insurance: false, lounge: false,
                    price: depInfantTotal
                };

                // infant round trip
                if (isRoundTrip) {
                    returnSaved[currentPassenger] = {
                        passengerType: "infant",
                        fullName: saved[currentPassenger].fullName,
                        email: saved[currentPassenger].email,
                        contact: null, passport: null,
                        nationality: saved[currentPassenger].nationality,
                        birthdate: saved[currentPassenger].birthdate,
                        gender: saved[currentPassenger].gender,
                        emergencyContact: saved[currentPassenger].emergencyContact,
                        meal: null, seat: null, baggage: 0,
                        priority: false, insurance: false, lounge: false,
                        price: rtInfantTotal
                    };
                }

                $("#display-name-" + currentPassenger).text(saved[currentPassenger].fullName);
                $("#display-price-" + currentPassenger).text("₱" + (depInfantTotal + rtInfantTotal).toLocaleString());
                backToList();
            } else {
                goToStep(2);
            }
        }
    });

    // departure meal selection
    $(".meal-option").click(function() {
        $(".meal-option").removeClass("selected"); // one card only
        $(this).addClass("selected");
        updateSummaryLive();
    });

    $("#btn-next-2").click(function() {
        if (!$(".meal-option.selected").length) {
            $("#err-meal").show();
        } else {
            $("#err-meal").hide();
            updateSummaryLive();
            goToStep(3);
        }
    });

    // departure seat selection
    $("#departure-seat-map").on("click", ".seat", function() {
        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");
            $("#selected-seat-display").text($(this).data("seat"));
            updateSummaryLive();
        }
    });

    $("#btn-next-3").click(function() {
        if (!$(".seat.selected").length) {
            $("#err-seat").show();
        } else {
            $("#err-seat").hide();
            updateSummaryLive();
            goToStep(4);
        }
    });

    // departure baggage counter
    $("#baggage-plus").click(function() {
        var n = parseInt($("#baggage-count").text());
        if (n < 3) {
            $("#baggage-count").text(n + 1); updateSummaryLive();
        } // max 3 bags
    });

    $("#baggage-minus").click(function() {
        var n = parseInt($("#baggage-count").text());
        if (n > 0) {
            $("#baggage-count").text(n - 1); updateSummaryLive();
        } // min 0 bags
    });

    // departure extra service toggles
    $("#priority-toggle, #insurance-toggle, #lounge-toggle").change(function() {
        updateSummaryLive();
    });

    // for one-way acts as done, for roundtrip goes to return steps
    $("#btn-next-4").click(function() {
        if (isRoundTrip) {
            updateSummaryLive();
            goToStep(5);
        } else {
            saveDepartureAndFinish();
        }
    });

    // return meal selection (roundtrip only)
    $(".rt-meal-option").click(function() {
        $(".rt-meal-option").removeClass("selected"); // one card only
        $(this).addClass("selected");
        updateSummaryLive();
    });

    $("#btn-next-5").click(function() {
        if (!$(".rt-meal-option.selected").length) {
            $("#err-rt-meal").show();
        } else {
            $("#err-rt-meal").hide();
            updateSummaryLive();
            goToStep(6);
        }
    });

    // return seat selection (roundtrip only)
    $("#return-seat-map").on("click", ".rt-seat", function() {
        if (!$(this).hasClass("occupied")) {
            $(".rt-seat").removeClass("selected");
            $(this).addClass("selected");
            $("#rt-selected-seat-display").text($(this).data("seat"));
            updateSummaryLive();
        }
    });

    $("#btn-next-6").click(function() {
        if (!$(".rt-seat.selected").length) {
            $("#err-rt-seat").show();
        } else {
            $("#err-rt-seat").hide();
            updateSummaryLive();
            goToStep(7);
        }
    });

    // return baggage counter (roundtrip only)
    $("#rt-baggage-plus").click(function() {
        var n = parseInt($("#rt-baggage-count").text());
        if (n < 3) {
            $("#rt-baggage-count").text(n + 1); updateSummaryLive();
        } // max 3 bags
    });

    $("#rt-baggage-minus").click(function() {
        var n = parseInt($("#rt-baggage-count").text());
        if (n > 0) {
            $("#rt-baggage-count").text(n - 1); updateSummaryLive();
        } // min 0 bags
    });

    // return extra service toggles (round trip only)
    $("#rt-priority-toggle, #rt-insurance-toggle, #rt-lounge-toggle").change(function() {
        updateSummaryLive();
    });

    // back buttons
    $("#btn-back-1").click(function() {
        // restore totals if passenger was already saved before subtracted
        if (saved[currentPassenger]) {
            var old = saved[currentPassenger];

            if (old.seat && old.seat !== "None") {
                totals.seats.push(old.seat);
            }
            if (old.meal) {
                totals.meals.push(old.meal.charAt(0).toUpperCase() + old.meal.slice(1));
                totals.mealCost += MEAL_PRICES[old.meal] || 0;
            }
            totals.baggage += old.baggage;
            if (old.priority) {
                totals.priority++;
            }
            if (old.insurance) {
                totals.insurance++;
            }
            if (old.lounge) {
                totals.lounge++;
            }

            var oldExtras = old.baggage * BAGGAGE_PRICE;
            if (old.priority) {
                oldExtras += PRIORITY_PRICE;
            }
            if (old.insurance) {
                oldExtras += INSURANCE_PRICE;
            }
            if (old.lounge) {
                oldExtras += LOUNGE_PRICE;
            }

            totals.extrasCost += oldExtras;
            if ($(".seat[data-seat='" + old.seat + "']").hasClass("premium")) {
                totals.seatCost += SEAT_UPGRADE;
            }
        }

        // also restore return totals if round trip
        if (isRoundTrip && returnSaved[currentPassenger]) {
            var rold = returnSaved[currentPassenger];

            if (rold.seat && rold.seat !== "None") {
                returnTotals.seats.push(rold.seat);
            }
            if (rold.meal) {
                returnTotals.meals.push(rold.meal.charAt(0).toUpperCase() + rold.meal.slice(1));
                returnTotals.mealCost += MEAL_PRICES[rold.meal] || 0;
            }

            returnTotals.baggage += rold.baggage;

            if (rold.priority) {
                returnTotals.priority++;
            }
            if (rold.insurance) {
                returnTotals.insurance++;
            }
            if (rold.lounge) {
                returnTotals.lounge++;
            }

            var roldExtras = rold.baggage * BAGGAGE_PRICE;
            
            if (rold.priority) {
                roldExtras += PRIORITY_PRICE;
            }
            if (rold.insurance) {
                roldExtras += INSURANCE_PRICE;
            }
            if (rold.lounge) {
                roldExtras += LOUNGE_PRICE;
            }

            returnTotals.extrasCost += roldExtras;
            if ($(".rt-seat[data-seat='" + rold.seat + "']").hasClass("premium")) {
                returnTotals.seatCost += SEAT_UPGRADE;
            }
        }

        backToList();
    });

    $("#btn-back-2").click(function() {
        goToStep(1);
    });
    $("#btn-back-3").click(function() {
        updateSummaryLive(); goToStep(2);
    });
    $("#btn-back-4").click(function() {
        updateSummaryLive(); goToStep(3);
    });
    $("#btn-back-5").click(function() {
        updateSummaryLive(); goToStep(4);
    });
    $("#btn-back-6").click(function() {
        updateSummaryLive(); goToStep(5);
    });
    $("#btn-back-7").click(function() {
        updateSummaryLive(); goToStep(6);
    });

    // saves departure data and finishes for one-way trips
    function saveDepartureAndFinish() {
        var meal = $(".meal-option.selected").data("meal");
        var seat = $("#selected-seat-display").text();
        var baggage = parseInt($("#baggage-count").text());
        var priority = $("#priority-toggle").is(":checked");
        var insurance = $("#insurance-toggle").is(":checked");
        var lounge = $("#lounge-toggle").is(":checked");
        var mealDisplay = "-";
        if (meal) {
            mealDisplay = meal.charAt(0).toUpperCase() + meal.slice(1);
        }

        // update departure totals
        if (seat && seat !== "None") {
            totals.seats.push(seat);
        }
        if (meal) {
            totals.meals.push(meal.charAt(0).toUpperCase() + meal.slice(1));
            totals.mealCost += MEAL_PRICES[meal] || 0;
        }

        totals.baggage += baggage;

        if ($(".seat.selected").hasClass("premium")) {
            totals.seatCost += SEAT_UPGRADE;
        }
        if (priority) {
            totals.priority++;
        }
        if (insurance) {
            totals.insurance++;
        }
        if (lounge) {
            totals.lounge++;
        }

        var extrasThisPassenger = baggage * BAGGAGE_PRICE;

        if (priority) {
            extrasThisPassenger += PRIORITY_PRICE;
        }
        if (insurance) {
            extrasThisPassenger += INSURANCE_PRICE;
        }
        if (lounge) {
            extrasThisPassenger += LOUNGE_PRICE;
        }

        totals.extrasCost += extrasThisPassenger;

        // calculate per passenger price
        var passengerBasePrice = 0;
        if (selectedFlight) {
            if (currentPassenger.indexOf("adult") !== -1) {
                passengerBasePrice = selectedFlight.ticketPrice;
            } else if (currentPassenger.indexOf("child") !== -1) {
                passengerBasePrice = Math.round(selectedFlight.ticketPrice * 0.75);
            } else {
                passengerBasePrice = Math.round(selectedFlight.ticketPrice * 0.25);
            }
        }

        var passengerMealCost = MEAL_PRICES[meal] || 0;
        var passengerSeatCost = 0;
        if ($(".seat.selected").hasClass("premium")) {
            passengerSeatCost = SEAT_UPGRADE;
        }
        var passengerExtras = baggage * BAGGAGE_PRICE;
        if (priority) {
            passengerExtras += PRIORITY_PRICE;
        }
        if (insurance) {
            passengerExtras += INSURANCE_PRICE;
        }
        if (lounge) {
            passengerExtras += LOUNGE_PRICE;
        }
        var passengerSubtotal = passengerBasePrice + passengerMealCost + passengerSeatCost + passengerExtras;
        var passengerTax = Math.round(passengerSubtotal * TAX_RATE);
        var passengerTotal = passengerSubtotal + passengerTax;

        saved[currentPassenger] = {
            passengerType: currentPassenger.split("-")[0],
            fullName: $("#full-name").val().trim(),
            email: $("#email").val().trim(),
            contact: $("#contact").val().trim(),
            passport: $("#passport").val().trim(),
            nationality: $("#nationality").val(),
            birthdate: $("#birthdate").val(),
            gender: $("#gender").val(),
            emergencyContact: $("#emergency-contact").val().trim(),
            meal: meal, seat: seat, baggage: baggage,
            priority: priority, insurance: insurance, lounge: lounge,
            price: passengerTotal
        };

        // update passenger card display
        $("#display-name-" + currentPassenger).text(saved[currentPassenger].fullName);
        
        if (seat !== "None") {
            $("#display-seat-" + currentPassenger).text(seat);
        } else {
            $("#display-seat-" + currentPassenger).text("-");
        }

        $("#display-meal-" + currentPassenger).text(mealDisplay);
        $("#display-baggage-" + currentPassenger).text(baggage);

        if (priority) {
            $("#display-priority-" + currentPassenger).text("Yes");
        } else {
            $("#display-priority-" + currentPassenger).text("No");
        }
        if (insurance) {
            $("#display-insurance-" + currentPassenger).text("Yes");
        } else {
            $("#display-insurance-" + currentPassenger).text("No");
        }
        if (lounge) {
            $("#display-lounge-" + currentPassenger).text("Yes");
        } else {
            $("#display-lounge-" + currentPassenger).text("No");
        }

        $("#display-price-" + currentPassenger).text("₱" + passengerTotal.toLocaleString());

        backToList();
    }

    // done button
    $("#btn-done").click(function() {
        // departure selections
        var meal = $(".meal-option.selected").data("meal");
        var seat = $("#selected-seat-display").text();
        var baggage = parseInt($("#baggage-count").text());
        var priority = $("#priority-toggle").is(":checked");
        var insurance = $("#insurance-toggle").is(":checked");
        var lounge = $("#lounge-toggle").is(":checked");
        var mealDisplay = "-";
        if (meal) {
            mealDisplay = meal.charAt(0).toUpperCase() + meal.slice(1);
        }

        // return selections
        var rtMeal = $(".rt-meal-option.selected").data("meal");
        var rtSeat = $("#rt-selected-seat-display").text();
        var rtBaggage = parseInt($("#rt-baggage-count").text());
        var rtPriority = $("#rt-priority-toggle").is(":checked");
        var rtInsurance = $("#rt-insurance-toggle").is(":checked");
        var rtLounge = $("#rt-lounge-toggle").is(":checked");
        var rtMealDisplay = "-";
        if (rtMeal) {
            rtMealDisplay = rtMeal.charAt(0).toUpperCase() + rtMeal.slice(1);
        }

        // update departure totals
        if (seat && seat !== "None") {
            totals.seats.push(seat);
        }
        if (meal) {
            totals.meals.push(meal.charAt(0).toUpperCase() + meal.slice(1));
            totals.mealCost += MEAL_PRICES[meal] || 0;
        }

        totals.baggage += baggage;

        if ($(".seat.selected").hasClass("premium")) {
            totals.seatCost += SEAT_UPGRADE;
        }
        if (priority) {
            totals.priority++;
        }
        if (insurance) {
            totals.insurance++;
        }
        if (lounge) {
            totals.lounge++;
        }

        var depExtrasThisPassenger = baggage * BAGGAGE_PRICE;
        if (priority) {
            depExtrasThisPassenger += PRIORITY_PRICE;
        }
        if (insurance) {
            depExtrasThisPassenger += INSURANCE_PRICE;
        }
        if (lounge) {
            depExtrasThisPassenger += LOUNGE_PRICE;
        }

        totals.extrasCost += depExtrasThisPassenger;

        // update return totals
        if (rtSeat && rtSeat !== "None") {
            returnTotals.seats.push(rtSeat);
        }
        if (rtMeal) {
            returnTotals.meals.push(rtMeal.charAt(0).toUpperCase() + rtMeal.slice(1));
            returnTotals.mealCost += MEAL_PRICES[rtMeal] || 0;
        }

        returnTotals.baggage += rtBaggage;

        if ($(".rt-seat.selected").hasClass("premium")) {
            returnTotals.seatCost += SEAT_UPGRADE;
        }
        if (rtPriority) {
            returnTotals.priority++;
        }
        if (rtInsurance) {
            returnTotals.insurance++;
        }
        if (rtLounge) {
            returnTotals.lounge++;
        }

        var rtExtrasThisPassenger = rtBaggage * BAGGAGE_PRICE;
        if (rtPriority) {
            rtExtrasThisPassenger += PRIORITY_PRICE;
        }
        if (rtInsurance) {
            rtExtrasThisPassenger += INSURANCE_PRICE;
        }
        if (rtLounge) {
            rtExtrasThisPassenger += LOUNGE_PRICE;
        }

        returnTotals.extrasCost += rtExtrasThisPassenger;

        // calculate departure passenger price
        var depBasePrice = 0;

        if (selectedFlight) {
            if (currentPassenger.indexOf("adult") !== -1) {
                depBasePrice = selectedFlight.ticketPrice;
            } else if (currentPassenger.indexOf("child") !== -1) {
                depBasePrice = Math.round(selectedFlight.ticketPrice * 0.75);
            } else {
                depBasePrice = Math.round(selectedFlight.ticketPrice * 0.25);
            }
        }

        var depMealCost = MEAL_PRICES[meal] || 0;

        var depSeatCost = 0;
        if ($(".seat.selected").hasClass("premium")) {
            depSeatCost = SEAT_UPGRADE;
        }

        var depExtras = baggage * BAGGAGE_PRICE;
        if (priority) {
            depExtras += PRIORITY_PRICE;
        }
        if (insurance) {
            depExtras += INSURANCE_PRICE;
        }
        if (lounge) {
            depExtras += LOUNGE_PRICE;
        }

        var depSubtotal = depBasePrice + depMealCost + depSeatCost + depExtras;
        var depTax = Math.round(depSubtotal * TAX_RATE);
        var depTotal = depSubtotal + depTax;

        // calculate return passenger price
        var retBasePrice = 0;
        if (isRoundTrip && selectedReturn) {
            if (currentPassenger.indexOf("adult") !== -1) {
                retBasePrice = selectedReturn.ticketPrice;
            } else if (currentPassenger.indexOf("child") !== -1) {
                retBasePrice = Math.round(selectedReturn.ticketPrice * 0.75);
            } else {
                retBasePrice = Math.round(selectedReturn.ticketPrice * 0.25);
            }
        }

        var retMealCost = MEAL_PRICES[rtMeal] || 0;

        var retSeatCost = 0;
        if ($(".rt-seat.selected").hasClass("premium")) {
            retSeatCost = SEAT_UPGRADE;
        }

        var retExtras = rtBaggage * BAGGAGE_PRICE;
        if (rtPriority) {
            retExtras += PRIORITY_PRICE;
        }
        if (rtInsurance) {
            retExtras += INSURANCE_PRICE;
        }
        if (rtLounge) {
            retExtras += LOUNGE_PRICE;
        }

        var retSubtotal = retBasePrice + retMealCost + retSeatCost + retExtras;
        var retTax = Math.round(retSubtotal * TAX_RATE);
        var retTotal = retSubtotal + retTax;

        // save departure passenger
        saved[currentPassenger] = {
            passengerType: currentPassenger.split("-")[0],
            fullName: $("#full-name").val().trim(),
            email: $("#email").val().trim(),
            contact: $("#contact").val().trim(),
            passport: $("#passport").val().trim(),
            nationality: $("#nationality").val(),
            birthdate: $("#birthdate").val(),
            gender: $("#gender").val(),
            emergencyContact: $("#emergency-contact").val().trim(),
            meal: meal, seat: seat, baggage: baggage,
            priority: priority, insurance: insurance, lounge: lounge,
            price: depTotal
        };

        // save return passenger
        returnSaved[currentPassenger] = {
            passengerType: currentPassenger.split("-")[0],
            fullName: saved[currentPassenger].fullName,
            email: saved[currentPassenger].email,
            contact: saved[currentPassenger].contact,
            passport: saved[currentPassenger].passport,
            nationality: saved[currentPassenger].nationality,
            birthdate: saved[currentPassenger].birthdate,
            gender: saved[currentPassenger].gender,
            emergencyContact: saved[currentPassenger].emergencyContact,
            meal: rtMeal, seat: rtSeat, baggage: rtBaggage,
            priority: rtPriority, insurance: rtInsurance, lounge: rtLounge,
            price: retTotal
        };

        // update passenger card display
        $("#display-name-" + currentPassenger).text(saved[currentPassenger].fullName);
        if (seat !== "None") {
            $("#display-seat-" + currentPassenger).text(seat);
        } else {
            $("#display-seat-" + currentPassenger).text("-");
        }
        if (isRoundTrip) {
            if (rtSeat !== "None") {
                $("#display-rt-seat-" + currentPassenger).text(rtSeat);
            } else {
                $("#display-rt-seat-" + currentPassenger).text("-");
            }
            // show departure and return meal together
            $("#display-meal-" + currentPassenger).text(mealDisplay + " / " + rtMealDisplay);
        } else {
            $("#display-meal-" + currentPassenger).text(mealDisplay);
        }
        $("#display-baggage-" + currentPassenger).text(baggage + rtBaggage);

        var priorityTotal = 0;
        if (priority) {
            priorityTotal++;
        }
        if (rtPriority) {
            priorityTotal++;
        }
        $("#display-priority-" + currentPassenger).text(priorityTotal);

        var insuranceTotal = 0;
        if (insurance) {
            insuranceTotal++;
        }
        if (rtInsurance) {
            insuranceTotal++;
        }
        $("#display-insurance-" + currentPassenger).text(insuranceTotal);

        var loungeTotal = 0;
        if (lounge) {
            loungeTotal++;
        }
        if (rtLounge) {
            loungeTotal++;
        }
        $("#display-lounge-" + currentPassenger).text(loungeTotal);

        $("#display-price-" + currentPassenger).text("₱" + (depTotal + retTotal).toLocaleString());

        backToList();
    });

    // search flights button
    $("#btn-search").click(function() {
        window.location.href = "/search";
    });

    // confirm button
    $("#btn-confirm").click(function() {
        var allFilled = true;
        var keys = Object.keys(saved);

        for (var i = 0; i < keys.length; i++) {
            if (saved[keys[i]] === null) {
                allFilled = false;
            }
        }

        if (isRoundTrip) {
            var rtKeys = Object.keys(returnSaved);
            for (var i = 0; i < rtKeys.length; i++) {
                if (returnSaved[rtKeys[i]] === null) {
                    allFilled = false;
                }
            }
        }

        if (!allFilled) {
            alert("Please fill in details for all passengers before confirming.");
            return;
        }

        var confirmModal = new bootstrap.Modal(document.getElementById("confirmBookingModal"));
        confirmModal.show();
    });

    $("#btn-confirm-booking").click(function() {
        // sum up departure total prices
        var keys = Object.keys(saved);
        var totalPrice = 0;
        for (var i = 0; i < keys.length; i++) {
            if (saved[keys[i]]) {
                totalPrice += saved[keys[i]].price;
            }
        }

        // sum up return total prices
        var returnTotalPrice = 0;
        if (isRoundTrip) {
            var rtKeys2 = Object.keys(returnSaved);
            for (var i = 0; i < rtKeys2.length; i++) {
                if (returnSaved[rtKeys2[i]]) {
                    returnTotalPrice += returnSaved[rtKeys2[i]].price;
                }
            }
        }

        var cabinTypeToSend = "";
        if (selectedFlight) {
            cabinTypeToSend = selectedFlight.cabinType;
        }

        var returnPassengersToSend = [];
        if (isRoundTrip) {
            returnPassengersToSend = Object.values(returnSaved);
        }

        $.ajax({
            url: "/booking",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                flightId: flightId,
                returnFlightId: returnFlightId,
                cabinType: cabinTypeToSend,
                totalPrice: totalPrice,
                returnTotalPrice: returnTotalPrice,
                passengers: Object.values(saved),
                returnPassengers: returnPassengersToSend
            }),
            success: function(response) {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                window.location.href = "/reservations";
            },
            error: function(err) {
                alert("Something went wrong. Please try again.");
                console.error(err);
            }
        });

        bootstrap.Modal.getInstance(document.getElementById("confirmBookingModal")).hide();
    });

    // expand/collapse sidebar sections
    $(".summary-toggle").click(function() {
        var target = $(this).data("target");
        $("#" + target).slideToggle(150);
    });

    // bootstrap tooltips
    $('[data-bs-toggle="tooltip"]').each(function() {
        new bootstrap.Tooltip(this);
    });

});