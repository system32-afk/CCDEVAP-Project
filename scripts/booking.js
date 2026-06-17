$(document).ready(function () {

    let currentPassenger = null;

    const BASE_TOTAL = 5920; // adult 3200 + child 2400 + infant 320
    const MEAL_PRICES = { standard: 0, vegetarian: 150, vegan: 200, halal: 100, kosher: 350, "gluten-free": 300 };
    const SEAT_UPGRADE   = 500;
    const BAGGAGE_PRICE  = 300;
    const PRIORITY_PRICE = 250;
    const INSURANCE_PRICE = 400;
    const LOUNGE_PRICE   = 600;
    const TAX_RATE = 0.12;

    // hides all steps, shows step n, updates progress bar
    function goToStep(n) {
        $(".passenger-step").hide();
        $("#passenger-step-" + n).show();
        $(".progress-bar").css("width", (n / 4 * 100) + "%");
    }

    // resets all step inputs back to default
    function resetForm() {
        $("#passenger-form input, #passenger-form select").val("");
        $(".meal-option").removeClass("selected");
        $(".seat").not(".occupied").removeClass("selected");
        $("#selected-seat-display").text("None");
        $("#baggage-count").text(0);
        $("#priority-toggle, #insurance-toggle, #lounge-toggle").prop("checked", false);
        $(".inline-validation").hide();
    }

    // close form and go back to passenger list
    function backToList() {
        currentPassenger = null;
        resetForm();
        updateSummary();
        $("#passenger-form").hide();
        $("#passenger-list, #outside-buttons").show();
    }

    // real-time sidebar update
    function updateSummary() {
        const selectedMeal = $(".meal-option.selected").data("meal") || null;
        const selectedSeat = $(".seat.selected").data("seat") || null;
        const baggage = parseInt($("#baggage-count").text());
        const priority = $("#priority-toggle").is(":checked");
        const insurance = $("#insurance-toggle").is(":checked");
        const lounge = $("#lounge-toggle").is(":checked");

        const totalMeal = MEAL_PRICES[selectedMeal] || 0;
        const totalSeat = selectedSeat && $(`.seat[data-seat="${selectedSeat}"]`).hasClass("premium") ? SEAT_UPGRADE : 0;
        const totalExtras = (baggage * BAGGAGE_PRICE) + (priority ? PRIORITY_PRICE : 0) + 
                            (insurance ? INSURANCE_PRICE : 0) + (lounge ? LOUNGE_PRICE : 0);

        const subtotal = BASE_TOTAL + totalMeal + totalSeat + totalExtras;
        const taxes = Math.round(subtotal * TAX_RATE);

        $("#summary-seat").text(selectedSeat || "-");
        $("#summary-meal").text(selectedMeal ? selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1) : "-");
        $("#summary-baggage").text(baggage);
        $("#summary-priority").text(priority ? 1 : 0);
        $("#summary-insurance").text(insurance ? 1 : 0);
        $("#summary-lounge").text(lounge ? 1 : 0);

        $("#summary-meal-cost").text(totalMeal > 0 ? "₱" + totalMeal.toLocaleString() : "₱0");
        $("#summary-seat-cost").text(totalSeat > 0 ? "₱" + totalSeat.toLocaleString() : "₱0");
        $("#summary-extras").text(totalExtras > 0 ? "₱" + totalExtras.toLocaleString() : "₱0");
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + (subtotal + taxes).toLocaleString());
    }

    // open passenger form
    $(document).on("click", ".btn-add-details", function() {
        currentPassenger = $(this).data("passenger");
        resetForm();

        $("#passenger-list, #outside-buttons").hide();
        $("#passenger-form").show();

        goToStep(1);

        // infants only need step 1 (lap seat and no extra services)
        if (currentPassenger === "infant-1") {
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

        const dob = new Date($("#birthdate").val());
        if (!$("#birthdate").val() || dob > new Date()) {
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

        if (!valid) {
            return;
        }  

        // infants skip to done
        if (currentPassenger === "infant-1") {
            backToList();
        } else {
            goToStep(2);
        }
    });

    // meal selection
    $(".meal-option").click(function() {
        $(".meal-option").removeClass("selected");
        $(this).addClass("selected");
        updateSummary();
    });

    $("#btn-next-2").click(function() {
        if (!$(".meal-option.selected").length) { 
            $("#err-meal").show(); 
            return; 
        }
        $("#err-meal").hide();
        $(".meal-option").removeClass("selected");
        updateSummary();
        goToStep(3);
    });

    // seat selection
    $(".seat").click(function() {
        if ($(this).hasClass("occupied")) {
            return;
        }
        $(".seat").not(".occupied").removeClass("selected");
        $(this).addClass("selected");
        $("#selected-seat-display").text($(this).data("seat"));
        updateSummary();
    });

    $("#btn-next-3").click(function() {
        if (!$(".seat.selected").length) { 
            $("#err-seat").show(); 
            return; 
        }
        $("#err-seat").hide();
        $(".seat").not(".occupied").removeClass("selected");
        $("#selected-seat-display").text("None");
        updateSummary();
        goToStep(4);
    });

    // baggage counter
    $("#baggage-plus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n < 3) { 
            $("#baggage-count").text(n + 1); 
            updateSummary(); 
        }
    });
    $("#baggage-minus").click(function() {
        const n = parseInt($("#baggage-count").text());

        if (n > 0) { 
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
        $(".meal-option").removeClass("selected"); 
        updateSummary(); 
        goToStep(2);
    });

    $("#btn-back-4").click(function() {
        $(".seat").not(".occupied").removeClass("selected"); 
        updateSummary(); 
        goToStep(3);
    });

    // done - nothing to save, just close
    $("#btn-done").click(function() { 
        backToList(); 
    });

    // page navigation
    $("#btn-back-5").click(function() { 
        window.location.href = "search.html"; 
    });

    $("#btn-next-5").click(function() { 
        window.location.href = "reservations.html";
    });

    // bootstrap tooltips
    $('[data-bs-toggle="tooltip"]').each(function() { 
        new bootstrap.Tooltip(this); 
    });

    // letters only for name
    $("#full-name").on("input", function() {
        $(this).val($(this).val().replace(/[^a-zA-Z\s]/g, ""));
    });

});

// expand/collapse sidebar sections
$(document).on("click", ".summary-toggle", function() {
    const target = $(this).data("target");
    $("#" + target).slideToggle(150);
});