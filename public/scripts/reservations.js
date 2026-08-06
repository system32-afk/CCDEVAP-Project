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

// Loads all reservations from the server
async function loadReservations() {
    try {
        // Check if we're on the admin page
        const isAdminPage = window.location.pathname.startsWith("/admin");
        const endpoint = isAdminPage ? "/admin/admin-reservations-data" : "/reservations/reservations-data";

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

// filtering and sorting
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

        // Filter for Destination
        if (destination !== "None" && reservation.flight.destination !== destination) {
            return false;
        }

        // Compare only the date part
        if (departureDate && reservation.flight.departureDate.slice(0, 10) !== departureDate) {
            return false;
        }

        // Checks each passenger's status
        if (status && !reservation.passengers.some(passenger => passenger.status === status)) {
            return false;
        }

        // Filter for Flight Number
        if (flightNumber && reservation.flight.flightNumber !== Number(flightNumber)) {
            return false;
        }

        // Filter for Booking Reference
        if (bookingReference && reservation.bookingReference !== bookingReference) {
            return false;
        }

        return true;
    });
}

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

const EDIT_SEAT_ROWS = 10;
const EDIT_PREMIUM_ROWS = [1, 2];
const EDIT_SEAT_COLS = ["A", "B", "C", "D", "E", "F"];

function createEditSeatModal(reservation, passenger) {
    const editModalId = `modal-edit-${reservation.bookingReference}-${passenger.seat}`;
    const seatMapId = `edit-seat-map-${passenger._id}`;
    const displayId = `edit-selected-seat-${passenger._id}`;
    const errId = `edit-seat-err-${passenger._id}`;
    const isAdminPage = window.location.pathname.startsWith("/admin");
    const endpointBase = isAdminPage ? "/admin" : "/reservations";

    return `
    <div id="${editModalId}" class="modal-overlay" onclick="whenUserClicksOutside(event, '${editModalId}')">
        <div class="modal-content-box">
            <span class="modal-close-btn" onclick="closeModal('${editModalId}')">
                <img src="/images/close_gray_x.png">
            </span>

            <div class="reservation-card">
                <h5 class="card-title">Change Seat &mdash; ${passenger.fullName}</h5>
                <hr>

                <div class="d-flex gap-3 flex-wrap mb-3 justify-content-center">
                    <div class="d-flex align-items-center gap-1">
                        <span class="seat-legend available"></span>
                        <p class="passenger-detail">Available</p>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <span class="seat-legend occupied"></span>
                        <p class="passenger-detail">Occupied</p>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <span class="seat-legend selected"></span>
                        <p class="passenger-detail">Selected</p>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <span class="seat-legend premium"></span>
                        <p class="passenger-detail">Premium (+${formatPrice(500)})</p>
                    </div>
                </div>

                <p class="option-desc text-center">Selected Seat: <span class="option-name" id="${displayId}">${passenger.seat || "None"}</span></p>

                <div class="d-flex justify-content-center">
                    <div class="seat-map"
                        id="${seatMapId}"
                        data-passenger-id="${passenger._id}"
                        data-current-seat="${passenger.seat || ""}"
                        data-flight-id="${reservation.flight._id}"
                        data-cabin-type="${reservation.cabinType}"
                        data-endpoint-base="${endpointBase}">
                        <p class="option-desc seat-select text-center">FRONT OF THE PLANE</p>
                        <hr>
                        <div class="d-flex align-items-center gap-1 mb-1">
                            <div class="seat-row-label"></div>
                            <div class="seat-cell text-muted small fw-bold">A</div>
                            <div class="seat-cell text-muted small fw-bold">B</div>
                            <div class="seat-cell text-muted small fw-bold">C</div>
                            <div class="seat-aisle"></div>
                            <div class="seat-cell text-muted small fw-bold">D</div>
                            <div class="seat-cell text-muted small fw-bold">E</div>
                            <div class="seat-cell text-muted small fw-bold">F</div>
                        </div>
                        <!-- rows injected by seatEditModal.js -->
                    </div>
                </div>

                <p class="text-danger inline-validation text-center" id="${errId}" style="display:none;">Please select a seat.</p>

                <div class="options-group mt-3">
                    <button class="edit-button" onclick="saveNewSeat('${passenger._id}')">Save Seat</button>
                    <button class="cancel-button" onclick="closeModal('${editModalId}')">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

function buildEditSeatRows(occupied, currentSeat) {
    let html = "";

    for (let r = 1; r <= EDIT_SEAT_ROWS; r++) {
        html += '<div class="d-flex align-items-center gap-1 mb-1">';
        html += '<div class="seat-row-label text-muted small fw-bold">' + r + '</div>';

        for (let i = 0; i < EDIT_SEAT_COLS.length; i++) {
            const label = r + EDIT_SEAT_COLS[i];
            const isPremium = EDIT_PREMIUM_ROWS.indexOf(r) !== -1;
            const isCurrent = label === currentSeat;
            const isOccupied = !isCurrent && occupied.indexOf(label) !== -1;

            let status = "Available";
            if (isCurrent) status = "Your current seat";
            else if (isOccupied) status = "Occupied";
            else if (isPremium) status = "Premium";

            let cls = "seat";
            cls += isPremium ? " premium" : " available";
            if (isOccupied) cls += " occupied";
            if (isCurrent) cls += " selected";

            html += '<div class="seat-cell"><div class="' + cls + '" data-seat="' + label + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Seat ' + label + ' - ' + status + '"></div></div>';
            if (i === 2) html += '<div class="seat-aisle"></div>';
        }

        html += '</div>';
    }

    return html;
}

function openEditSeatModal(modalId, passengerId) {
    openModal(modalId);

    const container = document.getElementById(`edit-seat-map-${passengerId}`);
    if (container) loadEditSeatMap(container);
}

async function loadEditSeatMap(container) {
    if (container.dataset.loaded === "true") return;

    const flightId = container.dataset.flightId;
    const cabinType = container.dataset.cabinType;
    const currentSeat = container.dataset.currentSeat;

    try {
        const response = await fetch(`/api/occupied-seats?flightId=${encodeURIComponent(flightId)}&cabinType=${encodeURIComponent(cabinType)}`);
        if (!response.ok) throw new Error("Failed to load seat map");

        const data = await response.json();
        container.innerHTML += buildEditSeatRows(data.occupiedSeats || [], currentSeat);
        container.dataset.loaded = "true";

        if (typeof $ !== "undefined") {
            $('[data-bs-toggle="tooltip"]').tooltip();
        }
    } catch (err) {
        console.error("Error loading seat map:", err);
    }
}

document.addEventListener("click", function (event) {
    const cell = event.target.closest(".seat");
    if (!cell) return;

    const container = cell.closest(".seat-map[data-passenger-id]");
    if (!container) return; 

    if (cell.classList.contains("occupied")) return;

    container.querySelectorAll(".seat").forEach(seat => seat.classList.remove("selected"));
    cell.classList.add("selected");

    const passengerId = container.dataset.passengerId;

    const display = document.getElementById(`edit-selected-seat-${passengerId}`);
    if (display) display.textContent = cell.dataset.seat;

    const err = document.getElementById(`edit-seat-err-${passengerId}`);
    if (err) err.style.display = "none";
});

async function saveNewSeat(passengerId) {
    const container = document.getElementById(`edit-seat-map-${passengerId}`);
    if (!container) return;

    const selected = container.querySelector(".seat.selected");
    if (!selected) {
        const err = document.getElementById(`edit-seat-err-${passengerId}`);
        if (err) err.style.display = "block";
        return;
    }

    const newSeat = selected.dataset.seat;
    const endpointBase = container.dataset.endpointBase;
    const modalOverlay = container.closest(".modal-overlay");


    try {
        const response = await fetch(`${endpointBase}/passenger/${passengerId}/seat`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seat: newSeat })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Failed to update seat");

        if (modalOverlay) closeModal(modalOverlay.id);
        await loadReservations();
    } catch (err) {
        console.error("Error updating seat:", err);
        alert(err.message || "Something went wrong updating the seat. Please try again.");
    }
}