$(document).ready(function () {

    // stores which passenger is currently being edited
    let currentPassenger = null;

    // price breakdown
    const BASE_TOTAL = 5920; // adult 3200 + child 2400 + infant 320
    const MEAL_PRICES = { standard: 0, vegetarian: 150, vegan: 200, halal: 100, kosher: 350, "gluten-free": 300 };
    const SEAT_UPGRADE   = 500;
    const BAGGAGE_PRICE  = 300;
    const PRIORITY_PRICE = 250;
    const INSURANCE_PRICE = 400;
    const LOUNGE_PRICE   = 600;
    const TAX_RATE = 0.12;

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

    // real-time sidebar update
    function updateSummary() {
        // get and store selected options
        const selectedMeal = $(".meal-option.selected").data("meal");
        const selectedSeat = $(".seat.selected").data("seat");
        const baggage = parseInt($("#baggage-count").text());
        const priority = $("#priority-toggle").is(":checked");
        const insurance = $("#insurance-toggle").is(":checked");
        const lounge = $("#lounge-toggle").is(":checked");

        // compute prices
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
        if (priority) {
            totalExtras += PRIORITY_PRICE;
        }
        if (insurance) {
            totalExtras += INSURANCE_PRICE;
        }
        if (lounge) {
            totalExtras += LOUNGE_PRICE;
        }

        const subtotal = BASE_TOTAL + totalMeal + totalSeat + totalExtras;
        const taxes = Math.round(subtotal * TAX_RATE);

        // display selections
        if (selectedSeat) {
            $("#summary-seat").text(selectedSeat);
        } else {
             $("#summary-seat").text("-");
        }

        let mealDisplay = "-";
        if (selectedMeal) {
            mealDisplay = selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1);
        }
        $("#summary-meal").text(mealDisplay);

        $("#summary-baggage").text(baggage);

        if (priority) {
            $("#summary-priority").text(1);
        } else {
             $("#summary-priority").text(0);
        }

        if (insurance) {
            $("#summary-insurance").text(1);
        } else {
             $("#summary-insurance").text(0);
        }

        if (lounge) {
            $("#summary-lounge").text(1);
        } else {
             $("#summary-lounge").text(0);
        }

        $("#summary-meal-cost").text("₱" + totalMeal.toLocaleString());
        $("#summary-seat-cost").text("₱" + totalSeat.toLocaleString());
        $("#summary-extras").text("₱" + totalExtras.toLocaleString());
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // open passenger form
   $(".btn-add-details").click(function() {
        currentPassenger = $(this).data("passenger");
        resetForm();

        $("#passenger-list, #outside-buttons").hide();
        $("#passenger-form").show();

        goToStep(1);

        // infants only need step 1 (lap seat and no extra services)
        if (currentPassenger == "infant-1") {
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
            if (currentPassenger === "infant-1") {
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
        updateSummary();
    });

    $("#btn-next-2").click(function() {
        if (!$(".meal-option.selected").length) { 
            $("#err-meal").show(); 
        } else {
            $("#err-meal").hide();
            updateSummary();
            goToStep(3);
        }
    });

    // seat selection
    $(".seat").click(function() {
        if (!$(this).hasClass("occupied")) {
            $(".seat").removeClass("selected");
            $(this).addClass("selected");
            $("#selected-seat-display").text($(this).data("seat"));
            updateSummary();
        }
    });

    $("#btn-next-3").click(function() {
        if (!$(".seat.selected").length) {
            $("#err-seat").show();
        } else {
            $("#err-seat").hide();
            updateSummary();
            goToStep(4);
        }
    });

    // baggage counter
    $("#baggage-plus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n < 3) { // only increment if less than 3
            $("#baggage-count").text(n + 1); 
            updateSummary(); 
        }
    });

    $("#baggage-minus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n > 0) { // only decrement if more than 0
            $("#baggage-count").text(n - 1); 
            updateSummary(); 
        }
    });

    // extra service toggles
    $("#priority-toggle, #insurance-toggle, #lounge-toggle").change(function() { 
        updateSummary(); 
    });

    // back buttons
    $("#btn-back-1").click(function() {
        backToList();
    });

    $("#btn-back-2").click(function() {
        goToStep(1);
    });

    $("#btn-back-3").click(function() {
        updateSummary(); 
        goToStep(2);
    });

    $("#btn-back-4").click(function() {
        updateSummary(); 
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

        backToList();
    });

    // back button from passenger list
    $("#btn-back-5").click(function() { 
        window.location.href = "search.html"; 
    });

    // confirm button from passenger list
    $("#btn-next-5").click(function() { 
        window.location.href = "reservations.html";
    });

    // bootstrap tooltips
    $('[data-bs-toggle="tooltip"]').each(function() { 
        new bootstrap.Tooltip(this); 
    });
});

// expand/collapse sidebar sections
$(".summary-toggle").click(function() {
    const target = $(this).data("target");
    $("#" + target).slideToggle(150);
});