// ---- Helpers ----

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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

function getStatusClass(status) {
    return status.toLowerCase();
}

function formatStatus(status) {
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const airlineCodes = {
    "Philippine Airlines": "Philippine Airlines (PAL)",
    "Cebu Pacific": "Cebu Pacific (CEB)",
    "AirAsia": "AirAsia (PQ)",
    "Cathay Pacific": "Cathay Pacific (CX)",
};

function getAirlineWithCode(airline) {
    return airlineCodes[airline] || airline;
}

// ---- Render ----

function renderReservations(list) {
    const tbody = document.getElementById("reservationAdminContainer");
    if (!tbody) return; // this page has no admin reservation table, nothing to render

    tbody.innerHTML = "";

    const modalContainer = document.getElementById("modalContainer") || document.body;

    list.forEach((reservation, index) => {
        tbody.innerHTML += createAdminReservationRow(reservation, index);
        modalContainer.innerHTML += showFullAdminReservationModal(reservation, index);
    });
}

function createAdminReservationRow(reservation, index) {
    // Keyed on index since the admin table displays one row per reservation
    // and modal ids only need to be unique within the rendered page.
    const modalId = `reservation-${index + 1}`;
    const status = reservation.status.toLowerCase();

    return `
    <tr>
        <td><strong>${reservation.bookingReference}</strong></td>
        <td>${reservation.passenger}</td>
        <td>${formatDate(reservation.departureDate)}</td>
        <td>
            <select class="status-select ${getStatusClass(reservation.status)}" onchange="updateReservationStatus(this, '${reservation.bookingReference}')">
                <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="pending" ${status === "pending" ? "selected" : ""}>Pending</option>
                <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
        </td>
        <td><button class="view-button" onclick="openModal('${modalId}')">View Details</button></td>
    </tr>
    `;
}

function showFullAdminReservationModal(reservation, index) {
    const modalId = `reservation-${index + 1}`;

    return `
    <div id="${modalId}" class="modal-overlay" onclick="whenUserClicksOutside(event, '${modalId}')">
        <div class="modal-content-box-small">
            <h2>FULL DETAILS OF RESERVATION</h2>

            <div class="modal-form-grid">
                <div class="form-group">
                    <label>Booking Reference</label>
                    <p>${reservation.bookingReference}</p>
                </div>

                <div class="form-group">
                    <label>Status</label>
                    <p>${formatStatus(reservation.status)}</p>
                </div>

                <div class="form-group">
                    <label>Flight Number</label>
                    <p>${reservation.flightNum}</p>
                </div>

                <div class="form-group">
                    <label>Airline</label>
                    <p>${getAirlineWithCode(reservation.airline)}</p>
                </div>

                <div class="form-group">
                    <label>Date of Departure</label>
                    <p>${formatDate(reservation.departureDate)}</p>
                </div>

                <div class="form-group">
                    <label>Fare / Price</label>
                    <p>${formatPrice(reservation.price)}</p>
                </div>

                <div class="form-group">
                    <label>Departure Time</label>
                    <p>${reservation.departureTime}</p>
                </div>

                <div class="form-group">
                    <label>Arrival Time</label>
                    <p>${reservation.arrivalTime}</p>
                </div>

                <div class="form-group">
                    <label>Flight Duration</label>
                    <p>${formatDuration(reservation.duration)}</p>
                </div>

                <div class="form-group">
                    <label>Origin</label>
                    <p>${reservation.origin}</p>
                </div>

                <div class="form-group">
                    <label>Destination</label>
                    <p>${reservation.destination}</p>
                </div>

                <div class="form-group">
                    <label>Passenger Name</label>
                    <p>${reservation.passenger}</p>
                </div>
            </div>

            <div class="options-group">
                <button class="cancel-button" onclick="closeModal('${modalId}')">Close</button>
            </div>
        </div>
    </div>
    `;
}