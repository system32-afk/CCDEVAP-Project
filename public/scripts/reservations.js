let reservations = [];

document.getElementById("sortReservations")?.addEventListener("click", searchReservations);

document.addEventListener("DOMContentLoaded", loadReservations);

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

function calculateMinutesForDuration(departureDate, departureTime, arrivalDate, arrivalTime) {
    const departure = new Date(departureDate);
    const [departureHours, departureMinutes] = departureTime.split(":").map(Number);
    departure.setHours(departureHours, departureMinutes, 0, 0);

    const arrival = new Date(arrivalDate);
    const [arrivalHours, arrivalMinutes] = arrivalTime.split(":").map(Number);
    arrival.setHours(arrivalHours, arrivalMinutes, 0, 0);

    return Math.round((arrival - departure) / 60000); // miliseconds to minutes
}

function formatDuration(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
}

function formatPrice(price) {
    return `PHP ${Number(price).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatStatus(status) {
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getStatusClass(status) {
    return status.toLowerCase();
}

const airlineLogos = {
    "Philippine Airlines": "/images/PAL.png",
    "Cebu Pacific": "/images/CebuPac.png",
    "AirAsia": "/images/AirAsia.png",
    "Cathay Pacific": "/images/CathPac.png",
    "Singapore Airlines": "/images/SingaporeAirlinesLogo.png",
    "Japan Airlines": "/images/JapanAirlinesLogo.png"
};

function getAirlineLogo(airline) {
    return airlineLogos[airline] || "/images/airline-logo.png";
}


async function loadReservations() {
    try {
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

function swapLocations() {
    var origin = document.getElementById('departure-airports');
    var destination = document.getElementById('destination-airports');

    var swap = origin.value;
    origin.value = destination.value;
    destination.value = swap;
}

function searchReservations() {
    let filteredReservations = [...reservations];
    filteredReservations = filterReservations(filteredReservations);
    filteredReservations = sortReservations(filteredReservations);

    renderReservations(filteredReservations);
}

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

        if (departureDate && reservation.flight.departureDate.slice(0, 10) !== departureDate) {
            return false;
        }

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

function sortReservations(list) {
    const sort = document.getElementById("sortBy").value;

    switch (sort) {
        case "dateAsc":
            list.sort((reservation1, reservation2) =>
                new Date(reservation1.flight.departureDate) -
                new Date(reservation2.flight.departureDate)
            );
            break;

        case "dateDesc":
            list.sort((reservation1, reservation2) =>
                new Date(reservation2.flight.departureDate) -
                new Date(reservation1.flight.departureDate)
            );
            break;

        case "priceAsc":
            list.sort((reservation1, reservation2) =>
                reservation1.totalPrice - reservation2.totalPrice
            );
            break;

        case "priceDesc":
            list.sort((reservation1, reservation2) =>
                reservation2.totalPrice - reservation1.totalPrice
            );
            break;

        case "flightAsc":
            list.sort((reservation1, reservation2) =>
                calculateMinutesForDuration(reservation1.flight.departureDate, reservation1.flight.departureTime,
                    reservation1.flight.arrivalDate, reservation1.flight.arrivalTime) -
                calculateMinutesForDuration(reservation2.flight.departureDate, reservation2.flight.departureTime,
                    reservation2.flight.arrivalDate, reservation2.flight.arrivalTime)
            );
            break;

        case "flightDesc":
            list.sort((reservation1, reservation2) =>
                calculateMinutesForDuration(reservation2.flight.departureDate, reservation2.flight.departureTime,
                    reservation2.flight.arrivalDate, reservation2.flight.arrivalTime) - 
                calculateMinutesForDuration(reservation1.flight.departureDate, reservation1.flight.departureTime,
                    reservation1.flight.arrivalDate, reservation1.flight.arrivalTime)
            );
            break;
    }

    return list;
}

function resetSearch() {
    document.getElementById("searchAndSortForm").reset();
    renderReservations(reservations);
}