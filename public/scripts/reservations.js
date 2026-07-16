let reservations = [];

// Search button applies the selected filters and sorting
document.getElementById("sortReservations")?.addEventListener("click", searchReservations);

// Load reservations once the page is ready
document.addEventListener("DOMContentLoaded", loadReservations);

// Formats a date into DD-MM-YYYY
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Calculates the total flight duration in minutes
function calculateMinutesForDuration(departureDate, departureTime, arrivalDate, arrivalTime) {
    const departure = new Date(departureDate);
    const [departureHours, departureMinutes] = departureTime.split(":").map(Number);
    departure.setHours(departureHours, departureMinutes, 0, 0);

    const arrival = new Date(arrivalDate);
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number);
    arrival.setHours(arrivalHours, arrivalMinutes, 0, 0);

    // Convert milliseconds into minutes
    return Math.round((arrival - departure) / 60000);
}

// Converts the duration into hours and minutes
function formatDuration(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
}

// Formats the price with the PHP currency
function formatPrice(price) {
    return `PHP ${Number(price).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// Makes sure the status starts with a capital letter
function formatStatus(status) {
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Returns the CSS class for the reservation status
function getStatusClass(status) {
    return status.toLowerCase();
}

// Paths for the airlines
const airlineLogos = {
    "Philippine Airlines": "/images/PAL.png",
    "Cebu Pacific": "/images/CebuPac.png",
    "AirAsia": "/images/AirAsia.png",
    "Cathay Pacific": "/images/CathPac.png",
    "Singapore Airlines": "/images/SingaporeAirlinesLogo.png",
    "Japan Airlines": "/images/JapanAirlinesLogo.png"
};

// Returns the airline logo based on its name
function getAirlineLogo(airline) {
    return airlineLogos[airline] || "/images/airline-logo.png";
}

// Loads all reservations from the server
async function loadReservations() {
    try {
        // Check if we're on the admin page
        const isAdminPage = window.location.pathname.startsWith("/admin");
        const endpoint = isAdminPage ? "/admin-reservations-data" : "/reservations-data";

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch reservations");

        reservations = await response.json();
        renderReservations(reservations);
    } catch (err) {
        console.error("Error loading reservations:", err);
    }
}

// Swaps the selected departure and destination airports
function swapLocations() {
    var origin = document.getElementById('departure-airports');
    var destination = document.getElementById('destination-airports');

    var swap = origin.value;
    origin.value = destination.value;
    destination.value = swap;
}

// Applies the selected filters and sorting
function searchReservations() {
    // Make a copy so the original list isn't changed
    let filteredReservations = [...reservations];

    filteredReservations = filterReservations(filteredReservations);
    filteredReservations = sortReservations(filteredReservations);

    renderReservations(filteredReservations);
}

// Filters the reservation list based on the search fields
function filterReservations(list) {
    const departure = document.getElementById("departure-airports").value;
    const destination = document.getElementById("destination-airports").value;
    const departureDate = document.getElementById("departureDate").value;
    const status = document.getElementById("statusFilter").value;
    const flightNumber = document.getElementById("flightNumber").value;
    const bookingReference = document.getElementById("bookingReference").value;

    return list.filter(reservation => {
        if (departure !== "None" && reservation.flight.origin !== departure) {
            return false;
        }

        if (destination !== "None" && reservation.flight.destination !== destination) {
            return false;
        }

        // Compare only the date part
        if (departureDate && reservation.flight.departureDate.slice(0, 10) !== departureDate) {
            return false;
        }

        // At least one passenger should match the selected status
        if (status && !reservation.passengers.some(passenger => passenger.status === status)) {
            return false;
        }

        if (flightNumber && reservation.flight.flightNumber !== Number(flightNumber)) {
            return false;
        }

        if (bookingReference && reservation.bookingReference !== bookingReference) {
            return false;
        }

        return true;
    });
}

// Sorts the reservation list based on the selected option
function sortReservations(list) {
    const sort = document.getElementById("sortBy").value;

    switch (sort) {
        // Sort by departure date
        case "dateAsc":
            list.sort((reservation1, reservation2) =>
                new Date(reservation1.flight.departureDate) -
                new Date(reservation2.flight.departureDate)
            );
            break;

        // Sort by departure date in reverse order
        case "dateDesc":
            list.sort((reservation1, reservation2) =>
                new Date(reservation2.flight.departureDate) -
                new Date(reservation1.flight.departureDate)
            );
            break;

        // Sort by total price
        case "priceAsc":
            list.sort((reservation1, reservation2) =>
                reservation1.totalPrice - reservation2.totalPrice
            );
            break;

        // Sort by total price in reverse order
        case "priceDesc":
            list.sort((reservation1, reservation2) =>
                reservation2.totalPrice - reservation1.totalPrice
            );
            break;

        // Sort by flight duration
        case "flightAsc":
            list.sort((reservation1, reservation2) =>
                calculateMinutesForDuration(
                    reservation1.flight.departureDate,
                    reservation1.flight.departureTime,
                    reservation1.flight.arrivalDate,
                    reservation1.flight.arrivalTime
                ) -
                calculateMinutesForDuration(
                    reservation2.flight.departureDate,
                    reservation2.flight.departureTime,
                    reservation2.flight.arrivalDate,
                    reservation2.flight.arrivalTime
                )
            );
            break;

        // Sort by flight duration in reverse order
        case "flightDesc":
            list.sort((reservation1, reservation2) =>
                calculateMinutesForDuration(
                    reservation2.flight.departureDate,
                    reservation2.flight.departureTime,
                    reservation2.flight.arrivalDate,
                    reservation2.flight.arrivalTime
                ) -
                calculateMinutesForDuration(
                    reservation1.flight.departureDate,
                    reservation1.flight.departureTime,
                    reservation1.flight.arrivalDate,
                    reservation1.flight.arrivalTime
                )
            );
            break;
    }

    return list;
}

// Clears all search fields and shows every reservation again
function resetSearch() {
    document.getElementById("searchAndSortForm").reset();
    renderReservations(reservations);
}