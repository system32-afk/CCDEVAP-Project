$(document).ready(function() {

    let currentPassenger = null;
    let passengersData = {};

    // pricing constants
    const PRICES = {
        baseFare: { adult: 5000, child: 3500, infant: 500 },
        meal: { standard: 0, vegetarian: 150, vegan: 200, halal: 100, kosher: 350, "gluten-free": 300 },
        seat: 500,
        baggage: 300,
        priority: 250,
        insurance: 400,
        lounge: 600,
        tax: 0.12
    };

    // summary sidebar price computations
    function updateSummary() {
        let totalBase = 0;
        let totalMeal = 0;
        let totalSeat = 0;
        let totalExtras = 0;

        // base fare based on cards
        $(".btn-add-details").each(function() {
            const key = $(this).data("passenger");
            if (key.startsWith("adult")) 
                totalBase += PRICES.baseFare.adult;
            else if (key.startsWith("child")) 
                totalBase += PRICES.baseFare.child;
            else if (key.startsWith("infant")) 
                totalBase += PRICES.baseFare.infant;
        });

        // combine all saved passengers + current being edited
        const allPassengers = { ...passengersData };
        if (currentPassenger) {
            allPassengers[currentPassenger] = { ...passengerData };
        }

        // selections
        let seats = [];
        let mealCounts = {};
        let totalBaggage = 0;
        let totalPriority = 0;
        let totalInsurance = 0;
        let totalLounge = 0;

        $.each(allPassengers, function(key, p) {
            if (key.startsWith("infant")) return;

            // seats
            if (p.seat) seats.push(p.seat);

            // meals
            if (p.mealPackage) {
                const meal = p.mealPackage;
                mealCounts[meal] = (mealCounts[meal] || 0) + 1;
                totalMeal += PRICES.meal[meal] || 0;
            }

            // seat upgrade
            const seatEl = $(`.seat[data-seat="${p.seat}"]`);
            if (seatEl.hasClass("premium")) totalSeat += PRICES.seat;

            // extra services
            totalBaggage += p.extraServices.additionalBaggage;
            if (p.extraServices.priorityBoarding) totalPriority++;
            if (p.extraServices.travelInsurance) totalInsurance++;
            if (p.extraServices.loungeAccess) totalLounge++;

            totalExtras += (p.extraServices.additionalBaggage * PRICES.baggage);
            if (p.extraServices.priorityBoarding) totalExtras += PRICES.priority;
            if (p.extraServices.travelInsurance) totalExtras += PRICES.insurance;
            if (p.extraServices.loungeAccess) totalExtras += PRICES.lounge;
        });

        // sort seats ascending
        seats.sort(function(a, b) {
            const rowA = parseInt(a), rowB = parseInt(b);
            const colA = a.replace(/[0-9]/g, ""), colB = b.replace(/[0-9]/g, "");
            return rowA !== rowB ? rowA - rowB : colA.localeCompare(colB);
        });

        // format meals
        const mealDisplay = Object.keys(mealCounts).length > 0
            ? Object.entries(mealCounts).map(([meal, count]) => count + "x " + meal.charAt(0).toUpperCase() + meal.slice(1)).join(", ")
            : "—";

        // update selections
        $("#summary-seat").text(seats.length > 0 ? seats.join(", ") : "—");
        $("#summary-meal").text(mealDisplay);
        $("#summary-baggage").text(totalBaggage);
        $("#summary-priority").text(totalPriority);
        $("#summary-insurance").text(totalInsurance);
        $("#summary-lounge").text(totalLounge);

        // pricing
        const subtotal = totalBase + totalMeal + totalSeat + totalExtras;
        const taxes = Math.round(subtotal * PRICES.tax);
        const total = subtotal + taxes;

        $("#summary-base").text("₱" + totalBase.toLocaleString());
        $("#summary-meal-cost").text(totalMeal > 0 ? "+₱" + totalMeal.toLocaleString() : "₱0");
        $("#summary-seat-cost").text(totalSeat > 0 ? "+₱" + totalSeat.toLocaleString() : "₱0");
        $("#summary-extras").text(totalExtras > 0 ? "+₱" + totalExtras.toLocaleString() : "₱0");
        $("#summary-taxes").text("₱" + taxes.toLocaleString());
        $("#summary-total").text("₱" + total.toLocaleString());
    }

    // passenger data template
    function newPassengerData() {
        return {
            fullName: null,
            email: null,
            contactNumber: null,
            passportNumber: null,
            nationality: null,
            dateOfBirth: null,
            gender: null,
            emergencyContact: null,
            mealPackage: null,
            seat: null,
            extraServices: {
                additionalBaggage: 0,
                priorityBoarding: false,
                travelInsurance: false,
                loungeAccess: false
            }
        };
    }

    let passengerData = newPassengerData();

    // show form when clicking add details
    $(".btn-add-details").click(function() {
        currentPassenger = $(this).data("passenger");

        // load existing data or fresh form
        if (passengersData[currentPassenger]) {
            passengerData = { ...passengersData[currentPassenger] };
            $("#full-name").val(passengerData.fullName);
            $("#email").val(passengerData.email);
            $("#contact").val(passengerData.contactNumber);
            $("#passport").val(passengerData.passportNumber);
            $("#nationality").val(passengerData.nationality);
            $("#birthdate").val(passengerData.dateOfBirth);
            $("#gender").val(passengerData.gender);
            $("#emergency-contact").val(passengerData.emergencyContact);
            $(".meal-option").removeClass("selected");
            $(`.meal-option[data-meal="${passengerData.mealPackage}"]`).addClass("selected");
            $(".seat").not(".occupied").removeClass("selected");
            $(`.seat[data-seat="${passengerData.seat}"]`).addClass("selected");
            $("#selected-seat-display").text(passengerData.seat || "None");
            $("#baggage-count").text(passengerData.extraServices.additionalBaggage);
            $("#priority-toggle").prop("checked", passengerData.extraServices.priorityBoarding);
            $("#insurance-toggle").prop("checked", passengerData.extraServices.travelInsurance);
            $("#lounge-toggle").prop("checked", passengerData.extraServices.loungeAccess);
        } else {
            passengerData = newPassengerData();
            $("#full-name").val("");
            $("#email").val("");
            $("#contact").val("");
            $("#passport").val("");
            $("#nationality").val("");
            $("#birthdate").val("");
            $("#gender").val("");
            $("#emergency-contact").val("");
            $(".meal-option").removeClass("selected");
            $(".seat").not(".occupied").removeClass("selected");
            $("#selected-seat-display").text("None");
            $("#baggage-count").text(0);
            $("#priority-toggle").prop("checked", false);
            $("#insurance-toggle").prop("checked", false);
            $("#lounge-toggle").prop("checked", false);
        }

        $("#passenger-list").hide();
        $("#outside-buttons").hide();
        $("#passenger-form").show();
        goToStep(1);
        updateSummary();

        // different progress bar for infants
        if (currentPassenger.startsWith("infant")) {
            $(".progress-bar").css("width", "100%");
            $("#btn-next-1").text("Done");
        } else {
            $(".progress-bar").css("width", "25%");
            $("#btn-next-1").text("Next");
        }
    });

    // progress bar steps
    function goToStep(n) {
        $(".passenger-step").hide();
        $("#passenger-step-" + n).show();
        $(".progress-bar").css("width", (n / 4 * 100) + "%");
    }

    // inline validations for next button
    // passenger details
    $("#btn-next-1").click(function() {
        let valid = true;

        // full name
        const nameInput = document.getElementById("full-name");
        if (!nameInput.checkValidity()) {
            $("#err-full-name").show();
            valid = false;
        } else {
            $("#err-full-name").hide();
        }

        // email
        const emailInput = document.getElementById("email");
        if (!emailInput.checkValidity()) {
            $("#err-email").show();
            valid = false;
        } else {
            $("#err-email").hide();
        }

        // contact number
        if ($("#contact").val().trim() === "") {
            $("#err-contact").show();
            valid = false;
        } else {
            $("#err-contact").hide();
        }

        // passport number
        if ($("#passport").val().trim() === "") {
            $("#err-passport").show();
            valid = false;
        } else {
            $("#err-passport").hide();
        }

        // nationality
        if ($("#nationality").val() === "") {
            $("#err-nationality").show();
            valid = false;
        } else {
            $("#err-nationality").hide();
        }

        // date of birth
        const birthdate = new Date($("#birthdate").val());
        const today = new Date();
        if (!$("#birthdate").val() || birthdate > today) {
            $("#err-birthdate").show();
            valid = false;
        } else {
            $("#err-birthdate").hide();
        }

        // gender
        if ($("#gender").val() === "") {
            $("#err-gender").show();
            valid = false;
        } else {
            $("#err-gender").hide();
        }

        // emergency contact
        if ($("#emergency-contact").val().trim() === "") {
            $("#err-emergency").show();
            valid = false;
        } else {
            $("#err-emergency").hide();
        }

        // save passenger details
        if (valid) {
            passengerData.fullName = $("#full-name").val().trim();
            passengerData.email = $("#email").val().trim();
            passengerData.contactNumber = $("#contact").val().trim();
            passengerData.passportNumber = $("#passport").val().trim();
            passengerData.nationality = $("#nationality").val();
            passengerData.dateOfBirth = $("#birthdate").val();
            passengerData.gender = $("#gender").val();
            passengerData.emergencyContact = $("#emergency-contact").val().trim();

            // infants dont get to choose meal and seat
            if (currentPassenger.startsWith("infant")) {
                passengersData[currentPassenger] = { ...passengerData };
                $("#display-name-" + currentPassenger).text(passengerData.fullName);
                updateSummary();
                $("#passenger-form").hide();
                $("#passenger-list").show();
                $("#outside-buttons").show();
            } else {
                goToStep(2);
            }
        }
    });

    // clickable meal options
    $(".meal-option").click(function() {
        $(".meal-option").removeClass("selected");
        $(this).addClass("selected");
        passengerData.mealPackage = $(this).data("meal");
        updateSummary();
    });

    // meal selection validation
    $("#btn-next-2").click(function() {
        if ($(".meal-option.selected").length === 0) {
            $("#err-meal").show();
        } else {
            $("#err-meal").hide();
            passengerData.mealPackage = $(".meal-option.selected").data("meal");
            goToStep(3);
        }
    });

    // clickable seats
    $(".seat").click(function() {
        if ($(this).hasClass("occupied")) return;
        $(".seat").not(".occupied").removeClass("selected");
        $(this).addClass("selected");

        const seat = $(this).data("seat");
        passengerData.seat = seat;
        $("#selected-seat-display").text(seat);
        updateSummary();
    });

    // seat selection validation
    $("#btn-next-3").click(function() {
        if ($(".seat.selected").length === 0) {
            $("#err-seat").show();
        } else {
            $("#err-seat").hide();
            passengerData.seat = $(".seat.selected").data("seat");
            goToStep(4);
        }
    });

    // seat tooltip
    $(".seat").on("mouseenter", function(e) {
        const seat = $(this).data("seat");
        const isPremium = $(this).hasClass("premium");
        const isOccupied = $(this).hasClass("occupied");
        const status = isOccupied ? "Occupied" : isPremium ? "Premium (+₱500)" : "Available";
        $("#seat-tooltip").text("Seat " + seat + " - " + status).show();
    }).on("mousemove", function(e) {
        $("#seat-tooltip").css({ top: e.clientY + 12, left: e.clientX + 12 });
    }).on("mouseleave", function() {
        $("#seat-tooltip").hide();
    });

    // extra services
    // additional baggage
    $("#baggage-plus").click(function() {
        if (passengerData.extraServices.additionalBaggage < 3) {
            passengerData.extraServices.additionalBaggage++;
            $("#baggage-count").text(passengerData.extraServices.additionalBaggage);
            updateSummary();
        }
    });

    $("#baggage-minus").click(function() {
        if (passengerData.extraServices.additionalBaggage > 0) {
            passengerData.extraServices.additionalBaggage--;
            $("#baggage-count").text(passengerData.extraServices.additionalBaggage);
            updateSummary();
        }
    });

    // priority boarding
    $("#priority-toggle").change(function() {
        passengerData.extraServices.priorityBoarding = $(this).is(":checked");
        updateSummary();
    });

    // travel insurance
    $("#insurance-toggle").change(function() {
        passengerData.extraServices.travelInsurance = $(this).is(":checked");
        updateSummary();
    });

    // lounge access
    $("#lounge-toggle").change(function() {
        passengerData.extraServices.loungeAccess = $(this).is(":checked");
        updateSummary();
    });

    // back buttons
    $("#btn-back-2").click(function() { goToStep(1); });
    $("#btn-back-3").click(function() { goToStep(2); });
    $("#btn-back-4").click(function() { goToStep(3); });

    // back to passenger list
    $("#btn-back-1").click(function() {
        $("#passenger-form").hide();
        $("#passenger-list").show();
        $("#outside-buttons").show();
    });

    // save and back to passenger list
    $("#btn-done").click(function() {
        passengersData[currentPassenger] = { ...passengerData };
        console.log(passengersData);

        // update card display
        $("#display-name-" + currentPassenger).text(passengerData.fullName);
        $("#display-seat-" + currentPassenger).text(passengerData.seat);
        $("#display-meal-" + currentPassenger).text(passengerData.mealPackage);
        $("#display-baggage-" + currentPassenger).text(passengerData.extraServices.additionalBaggage);
        $("#display-priority-" + currentPassenger).text(passengerData.extraServices.priorityBoarding ? "Yes" : "No");
        $("#display-insurance-" + currentPassenger).text(passengerData.extraServices.travelInsurance ? "Yes" : "No");
        $("#display-lounge-" + currentPassenger).text(passengerData.extraServices.loungeAccess ? "Yes" : "No");
        
        updateSummary();

        $("#passenger-form").hide();
        $("#passenger-list").show();
        $("#outside-buttons").show();
    });

    // go back to search flights
    $("#btn-back-5").click(function() {
        window.location.href = "search.html";
    });

    // go to reservations
    $("#btn-next-5").click(function() {
        window.location.href = "reservations.html";
    });

    updateSummary();
});

// expandable / collapsible price breakdown
$(document).on("click", ".summary-toggle", function() {
    const target = $(this).data("target");
    $("#" + target).slideToggle(150);
    $(this).text($("#" + target).is(":visible") ? "▾" : "▴");
});