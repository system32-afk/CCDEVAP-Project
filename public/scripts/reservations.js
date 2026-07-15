let reservations = [];

document.getElementById("sortReservations")?.addEventListener("click", searchReservations);

document.addEventListener("DOMContentLoaded", loadReservations);

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

    return list.filter(reservation => {
        if (departure !== "None" && reservation.origin !== departure) {
            return false;
        }

        if (destination !== "None" && reservation.destination !== destination) {
            return false;
        }

        // reservation.departureDate comes back from Mongo as a full ISO string
        // (e.g. "2025-08-01T00:00:00.000Z"), while the date input gives "2025-08-01",
        // so compare just the date portion instead of the full string.
        if (departureDate && reservation.departureDate.slice(0, 10) !== departureDate) {
            return false;
        }

        if (status && reservation.status !== status) {
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
                new Date(reservation1.departureDate) -
                new Date(reservation2.departureDate)
            );
            break;

        case "dateDesc":
            list.sort((reservation1, reservation2) =>
                new Date(reservation2.departureDate) -
                new Date(reservation1.departureDate)
            );
            break;

        case "priceAsc":
            list.sort((reservation1, reservation2) =>
                reservation1.price - reservation2.price
            );
            break;

        case "priceDesc":
            list.sort((reservation1, reservation2) =>
                reservation2.price - reservation1.price
            );
            break;

        case "flightAsc":
            list.sort((reservation1, reservation2) =>
                reservation1.duration - reservation2.duration
            );
            break;

        case "flightDesc":
            list.sort((reservation1, reservation2) =>
                reservation2.duration - reservation1.duration
            );
            break;
    }

    return list;
}

function resetSearch() {
    document.getElementById("searchAndSortForm").reset();
    renderReservations(reservations);
}