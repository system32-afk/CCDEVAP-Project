$(document).ready(function () {

    // stores which passenger is currently being edited
    let currentPassenger = null;

    var chosenMeal = null;
    var chosenSeat = null;

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

    // get how many passengers cards to display
    const bookingInfo = JSON.parse(sessionStorage.getItem("booking_info")) || {
        passengers: { adults: 1, children: 0, infants: 0 }
    };
    const passengerCounts = bookingInfo.passengers;

    // saved passengers
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

    // flight id
    const flightId = $("#flight-id").val();

    // price breakdown
    var selectedFlight = JSON.parse(sessionStorage.getItem("selected_flight"));
    var basePrice = 0;

    if (selectedFlight) {
        var adultPrice = selectedFlight.ticketPrice;
        var childPrice = Math.round(selectedFlight.ticketPrice * 0.75);
        var infantPrice = Math.round(selectedFlight.ticketPrice * 0.25);

        basePrice = (passengerCounts.adults * adultPrice) +
                    (passengerCounts.children * childPrice) +
                    (passengerCounts.infants * infantPrice);
    }

    const MEAL_PRICES = { standard: 0, vegetarian: 150, vegan: 200, halal: 100, kosher: 350, "gluten-free": 300 };
    const SEAT_UPGRADE   = 500;
    const BAGGAGE_PRICE  = 300;
    const PRIORITY_PRICE = 250;
    const INSURANCE_PRICE = 400;
    const LOUNGE_PRICE   = 600;
    const TAX_RATE = 0.12;

    function renderPassengerCards() {
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

    function buildCard(type, num) {
        var id = type + "-" + num;
        var label = type.charAt(0).toUpperCase() + type.slice(1) + " " + num;
        var extras = "";

        if (type !== "infant") {
            extras = "<p class='passenger-detail'>Seat: <span id='display-seat-" + id + "'>-</span></p>" +
                    "<p class='passenger-detail'>Meal: <span id='display-meal-" + id + "'>-</span></p>" +
                    "<hr>" +
                    "<p class='passenger-detail'>Additional Baggage: <span id='display-baggage-" + id + "'>-</span></p>" +
                    "<p class='passenger-detail'>Priority Boarding: <span id='display-priority-" + id + "'>-</span></p>" +
                    "<p class='passenger-detail'>Travel Insurance: <span id='display-insurance-" + id + "'>-</span></p>" +
                    "<p class='passenger-detail'>Lounge Access: <span id='display-lounge-" + id + "'>-</span></p>";
        }

        return "<div class='col'>" +
                "<div class='card h-100 p-3'>" +
                    "<h5 class='card-title'>" + label + "</h5>" +
                    "<button class='btn btn-add-details w-100' data-passenger='" + id + "'>Add this traveler's details</button>" +
                    "<hr>" +
                    "<p class='passenger-detail'>Name: <span id='display-name-" + id + "'>-</span></p>" +
                    extras +
                "</div>" +
            "</div>";
    }

    renderPassengerCards();

    function renderFlightDetails() {
        var flight = JSON.parse(sessionStorage.getItem("selected_flight"));

        if (!flight) {
            return;
        }

        $("#summary-flight").text(flight.airline + " " + flight.flightNum);
        $("#summary-route").text(flight.origin + " → " + flight.destination);
        $("#summary-departure").text(flight.departure);
        $("#summary-arrival").text(flight.arrival);
        $("#summary-duration").text(flight.duration);
        $("#summary-cabin").text(flight.cabinType);
        $("#summary-base").text("₱" + basePrice.toLocaleString());
        updateSummary();
    }

    renderFlightDetails();

    // hides all the other steps except the current one
    function goToStep(n) {
        $(".passenger-step").hide();
        $("#passenger-step-" + n).show();
        $(".progress-bar").css("width", (n / 4 * 100) + "%");
    }

    // clears all form inputs and selections
    function resetForm() {
        $("#passenger-form input, #passenger-form select").val("");
        $(".meal-option").removeClass("selected");
        $(".seat").removeClass("selected");
        $("#selected-seat-display").text("None");
        $("#baggage-count").text(0);
        $("#priority-toggle, #insurance-toggle, #lounge-toggle").prop("checked", false);
        $(".inline-validation").hide();
    }

    // hides the passenger form and shows the passenger list again
    function backToList() {
        currentPassenger = null;
        resetForm();
        updateSummary();
        $("#passenger-form").hide();
        $("#passenger-list, #outside-buttons").show();
    }

    // live updates while filling form
    function updateSummaryLive() {
        var selectedMeal = $(".meal-option.selected").data("meal");
        var selectedSeat = $(".seat.selected").data("seat");
        var baggage = parseInt($("#baggage-count").text());
        var priority = $("#priority-toggle").is(":checked");
        var insurance = $("#insurance-toggle").is(":checked");
        var lounge = $("#lounge-toggle").is(":checked");

        let totalMeal = 0;
        if (selectedMeal) {
            totalMeal = MEAL_PRICES[selectedMeal];
        }

        let totalSeat = 0;
        if (selectedSeat) {
            if ($(".seat.selected").hasClass("premium")) {
                totalSeat = SEAT_UPGRADE;
            }
        }

        let totalExtras = baggage * BAGGAGE_PRICE;
        if (priority) { totalExtras += PRIORITY_PRICE; }
        if (insurance) { totalExtras += INSURANCE_PRICE; }
        if (lounge) { totalExtras += LOUNGE_PRICE; }

        var subtotal = basePrice + totals.mealCost + totals.seatCost + totals.extrasCost + totalMeal + totalSeat + totalExtras;
        var taxes = Math.round(subtotal * TAX_RATE);

        var liveSeat = totals.seats.slice();
        if (selectedSeat) { liveSeat.push(selectedSeat); }
        var liveMeal = totals.meals.slice();
        if (selectedMeal) { liveMeal.push(selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)); }

        if (selectedSeat) {
            $("#summary-seat").text(liveSeat.join(", "));
        } else {
            $("#summary-seat").text(totals.seats.length ? totals.seats.join(", ") : "-");
        }

        if (selectedMeal) {
            $("#summary-meal").text(liveMeal.join(", "));
        } else {
            $("#summary-meal").text(totals.meals.length ? totals.meals.join(", ") : "-");
        }

        $("#summary-baggage").text(totals.baggage + baggage);
        $("#summary-priority").text(totals.priority + (priority ? 1 : 0));
        $("#summary-insurance").text(totals.insurance + (insurance ? 1 : 0));
        $("#summary-lounge").text(totals.lounge + (lounge ? 1 : 0));
        $("#summary-meal-cost").text("₱" + (totals.mealCost + totalMeal).toLocaleString());
        $("#summary-seat-cost").text("₱" + (totals.seatCost + totalSeat).toLocaleString());
        $("#summary-extras").text("₱" + (totals.extrasCost + totalExtras).toLocaleString());
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // cumulative update after done is clicked
    function updateSummary() {
        var subtotal = basePrice + totals.mealCost + totals.seatCost + totals.extrasCost;
        var taxes = Math.round(subtotal * TAX_RATE);

        $("#summary-seat").text(totals.seats.length ? totals.seats.join(", ") : "-");
        $("#summary-meal").text(totals.meals.length ? totals.meals.join(", ") : "-");
        $("#summary-baggage").text(totals.baggage);
        $("#summary-priority").text(totals.priority);
        $("#summary-insurance").text(totals.insurance);
        $("#summary-lounge").text(totals.lounge);
        $("#summary-meal-cost").text("₱" + totals.mealCost.toLocaleString());
        $("#summary-seat-cost").text("₱" + totals.seatCost.toLocaleString());
        $("#summary-extras").text("₱" + totals.extrasCost.toLocaleString());
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // open passenger form
   $(".btn-add-details").click(function() {
        currentPassenger = $(this).data("passenger");
        resetForm();

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
                $("[data-meal='" + s.meal + "']").addClass("selected");
            }

            if (s.seat) {
                $(".seat[data-seat='" + s.seat + "']").addClass("selected");
                $("#selected-seat-display").text(s.seat);
            }

            $("#baggage-count").text(s.baggage);
            $("#priority-toggle").prop("checked", s.priority);
            $("#insurance-toggle").prop("checked", s.insurance);
            $("#lounge-toggle").prop("checked", s.lounge);
        }

        if (saved[currentPassenger]) {
            var old = saved[currentPassenger];

            if (old.seat && old.seat !== "None") {
                var seatIndex = totals.seats.indexOf(old.seat);
                if (seatIndex !== -1) { totals.seats.splice(seatIndex, 1); }
            }

            if (old.meal) {
                var oldMealDisplay = old.meal.charAt(0).toUpperCase() + old.meal.slice(1);
                var mealIndex = totals.meals.indexOf(oldMealDisplay);
                if (mealIndex !== -1) { totals.meals.splice(mealIndex, 1); }
                totals.mealCost -= MEAL_PRICES[old.meal] || 0;
            }

            totals.baggage -= old.baggage;
            if (old.priority) { totals.priority--; }
            if (old.insurance) { totals.insurance--; }
            if (old.lounge) { totals.lounge--; }
            totals.extrasCost -= (old.baggage * BAGGAGE_PRICE) + (old.priority ? PRIORITY_PRICE : 0) + (old.insurance ? INSURANCE_PRICE : 0) + (old.lounge ? LOUNGE_PRICE : 0);
            if ($(".seat[data-seat='" + old.seat + "']").hasClass("premium")) { totals.seatCost -= SEAT_UPGRADE; }
        }

        $("#passenger-list, #outside-buttons").hide();
        $("#passenger-form").show();

        goToStep(1);

        // infants only need step 1 (lap seat and no extra services)
        if (currentPassenger.indexOf("infant") !== -1) {
            $(".progress-bar").css("width", "100%");
            $("#btn-next-1").text("Done");
        } else {
            $("#btn-next-1").text("Next");
        }
    });

    // passenger details validation
    $("#btn-next-1").click(function() {
        let valid = true;

        if (!document.getElementById("full-name").checkValidity()) {
            $("#err-full-name").show(); 
            valid = false;
        } else { 
            $("#err-full-name").hide(); 
        }

        if (!document.getElementById("email").checkValidity()) {
            $("#err-email").show(); 
            valid = false;
        } else { 
            $("#err-email").hide(); 
        }

        if (!$("#contact").val().trim()) {
            $("#err-contact").show(); 
            valid = false;
        } else { 
            $("#err-contact").hide(); 
        }

        if (!$("#passport").val().trim()) {
            $("#err-passport").show(); 
            valid = false;
        } else { 
            $("#err-passport").hide(); 
        }

        if (!$("#nationality").val()) {
            $("#err-nationality").show(); 
            valid = false;
        } else { 
            $("#err-nationality").hide(); 
        }

        const birthdate = new Date($("#birthdate").val());
        if (!$("#birthdate").val() || birthdate > new Date()) {
            $("#err-birthdate").show(); 
            valid = false;
        } else { 
            $("#err-birthdate").hide(); 
        }

        if (!$("#gender").val()) {
            $("#err-gender").show(); 
            valid = false;
        } else { 
            $("#err-gender").hide(); 
        }

        if (!$("#emergency-contact").val().trim()) {
            $("#err-emergency").show(); 
            valid = false;
        } else { 
            $("#err-emergency").hide(); 
        }

        if (valid) {
            // infants skip to done
            if (currentPassenger.indexOf("infant") !== -1) {
                saved["infant-1"] = {
                    passengerType: "infant",
                    fullName: $("#full-name").val().trim(),
                    email: $("#email").val().trim(),
                    contact: $("#contact").val().trim(),
                    passport: $("#passport").val().trim(),
                    nationality: $("#nationality").val(),
                    birthdate: $("#birthdate").val(),
                    gender: $("#gender").val(),
                    emergencyContact: $("#emergency-contact").val().trim(),
                    meal: null,
                    seat: null,
                    baggage: 0,
                    priority: false,
                    insurance: false,
                    lounge: false
                };
                backToList();
            } else {
                goToStep(2);
            }
        }
    });

    // meal selection
    $(".meal-option").click(function() {
        $(".meal-option").removeClass("selected"); // one card can only be selected at a time
        $(this).addClass("selected");
        updateSummaryLive()
    });

    $("#btn-next-2").click(function() {
        if (!$(".meal-option.selected").length) { 
            $("#err-meal").show(); 
        } else {
            $("#err-meal").hide();
            updateSummaryLive()
            goToStep(3);
        }
    });

    // seat selection
    $(".seat").click(function() {
        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");
            $("#selected-seat-display").text($(this).data("seat"));
            updateSummaryLive()
        }
    });

    $("#btn-next-3").click(function() {
        if (!$(".seat.selected").length) {
            $("#err-seat").show();
        } else {
            $("#err-seat").hide();
            updateSummaryLive()
            goToStep(4);
        }
    });

    // baggage counter
    $("#baggage-plus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n < 3) { // only increment if less than 3
            $("#baggage-count").text(n + 1); 
            updateSummaryLive()
        }
    });

    $("#baggage-minus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n > 0) { // only decrement if more than 0
            $("#baggage-count").text(n - 1); 
            updateSummaryLive()
        }
    });

    // extra service toggles
    $("#priority-toggle, #insurance-toggle, #lounge-toggle").change(function() { 
        updateSummaryLive()
    });

    // back buttons
    $("#btn-back-1").click(function() {
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

            totals.extrasCost += (old.baggage * BAGGAGE_PRICE) + (old.priority ? PRIORITY_PRICE : 0) + (old.insurance ? INSURANCE_PRICE : 0) + (old.lounge ? LOUNGE_PRICE : 0);
            
            if ($(".seat[data-seat='" + old.seat + "']").hasClass("premium")) { 
                totals.seatCost += SEAT_UPGRADE; 
            }
        }
        backToList();
    });

    $("#btn-back-2").click(function() {
        goToStep(1);
    });

    $("#btn-back-3").click(function() {
        updateSummaryLive()
        goToStep(2);
    });

    $("#btn-back-4").click(function() {
        updateSummaryLive()
        goToStep(3);
    });

    // done button displays text in passenger card
    $("#btn-done").click(function() {
        $("#display-name-" + currentPassenger).text($("#full-name").val().trim());
        $("#display-seat-" + currentPassenger).text($("#selected-seat-display").text());
        $("#display-meal-" + currentPassenger).text($("#summary-meal").text());
        $("#display-baggage-" + currentPassenger).text($("#baggage-count").text());

        if ($("#priority-toggle").is(":checked")) {
            $("#display-priority-" + currentPassenger).text("Yes");
        } else {
            $("#display-priority-" + currentPassenger).text("No");
        }

        if ($("#insurance-toggle").is(":checked")) {
            $("#display-insurance-" + currentPassenger).text("Yes");
        } else {
            $("#display-insurance-" + currentPassenger).text("No");
        }

        if ($("#lounge-toggle").is(":checked")) {
            $("#display-lounge-" + currentPassenger).text("Yes");
        } else {
            $("#display-lounge-" + currentPassenger).text("No");
        }

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
            meal: $(".meal-option.selected").data("meal"),
            seat: $("#selected-seat-display").text(),
            baggage: parseInt($("#baggage-count").text()),
            priority: $("#priority-toggle").is(":checked"),
            insurance: $("#insurance-toggle").is(":checked"),
            lounge: $("#lounge-toggle").is(":checked")
        };

        var meal = $(".meal-option.selected").data("meal");
        var seat = $("#selected-seat-display").text();
        var baggage = parseInt($("#baggage-count").text());
        var priority = $("#priority-toggle").is(":checked");
        var insurance = $("#insurance-toggle").is(":checked");
        var lounge = $("#lounge-toggle").is(":checked");
        
        if (seat && seat !== "None") { totals.seats.push(seat); }
        if (meal) { 
            totals.meals.push(meal.charAt(0).toUpperCase() + meal.slice(1));
            totals.mealCost += MEAL_PRICES[meal] || 0;
        }
        totals.baggage += baggage;
        if ($(".seat.selected").hasClass("premium")) { totals.seatCost += SEAT_UPGRADE; }
        if (priority) { totals.priority++; }
        if (insurance) { totals.insurance++; }
        if (lounge) { totals.lounge++; }
        totals.extrasCost += (baggage * BAGGAGE_PRICE) + (priority ? PRIORITY_PRICE : 0) + (insurance ? INSURANCE_PRICE : 0) + (lounge ? LOUNGE_PRICE : 0);

        backToList();
    });

    // back button from passenger list
    $("#btn-back-5").click(function() { 
        window.location.href = "/search"; 
    });

    // confirm button from passenger list
    $("#btn-next-5").click(function() { 
        var allFilled = true;
        var keys = Object.keys(saved);

        for (var i = 0; i < keys.length; i++) {
            if (saved[keys[i]] === null) {
                allFilled = false;
            }
        }

        if (!allFilled) {
            alert("Please fill in details for all passengers before confirming.");
            return;
        }

        $.ajax({
            url: "/booking",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                flightId: flightId,
                passengers: [saved["adult-1"], saved["child-1"], saved["infant-1"]]
            }),
            success: function(response) {
                window.location.href = "/reservations";
            },
            error: function(err) {
                alert("Something went wrong. Please try again.");
                console.error(err);
            }
        });
    });

    // expand/collapse sidebar sections
    $(".summary-toggle").click(function() {
        const target = $(this).data("target");
        $("#" + target).slideToggle(150);
    });

    // bootstrap tooltips
    $('[data-bs-toggle="tooltip"]').each(function() { 
        new bootstrap.Tooltip(this); 
    });
});

