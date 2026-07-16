// Displays all reservations in the admin table
function renderReservations(list) {
    const tbody = document.getElementById("reservationAdminContainer");

    // Stop if the table isn't on the current page
    if (!tbody) return;

    tbody.innerHTML = "";

    list.forEach(reservation => {
        // Create a row and its matching modal for each passenger
        for (let i = 0; i < reservation.passengers.length; i++) {
            const passenger = reservation.passengers[i];

            tbody.innerHTML += createAdminReservationRow(reservation, passenger);
            tbody.innerHTML += showFullAdminReservationModal(reservation, passenger);
            tbody.innerHTML += createEditSeatModal(reservation, passenger);
        }
    });
}

// Creates a table row for a reservation
function createAdminReservationRow(reservation, passenger) {
    const modalId = `modal-${reservation.bookingReference}-${passenger.seat}`;
    const editModalId = `modal-edit-${reservation.bookingReference}-${passenger.seat}`;
    const status = passenger.status.toLowerCase();
    const isCancelled = passenger.status === "Cancelled";

    return `
    <tr>
        <td><strong>${reservation.bookingReference}</strong></td>
        <td>${passenger.fullName}</td>
        <td>${formatDate(reservation.flight.departureDate)}</td>
        <td>
            <select class="status-select ${getStatusClass(passenger.status)}"
                    data-current-status="${status}"
                    onchange="updateReservationStatus(this, '${passenger._id}')">
                <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
        </td>
        <td><button class="view-button" onclick="openModal('${modalId}')">View Details</button></td>
        <td><button class="edit-button" ${isCancelled ? "disabled" : ""} onclick="openEditSeatModal('${editModalId}', '${passenger._id}')">Edit</button></td>
    </tr>
    `;
}

// Creates the full reservation details shown in the admin modal
function showFullAdminReservationModal(reservation, passenger) {
    const modalId = `modal-${reservation.bookingReference}-${passenger.seat}`;

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
                    <p>${formatStatus(passenger.status)}</p>
                </div>

                <div class="form-group">
                    <label>Flight Number</label>
                    <p>${reservation.flight.flightNumber}</p>
                </div>

                <div class="form-group">
                    <label>Airline</label>
                    <p>${reservation.flight.airline}</p>
                </div>

                <div class="form-group">
                    <label>Date of Departure</label>
                    <p>${formatDate(reservation.flight.departureDate)}</p>
                </div>

                <div class="form-group">
                    <label>Fare / Price</label>
                    <p>${formatPrice(passenger.price)}</p>
                </div>

                <div class="form-group">
                    <label>Departure Time</label>
                    <p>${reservation.flight.departureTime}</p>
                </div>

                <div class="form-group">
                    <label>Arrival Time</label>
                    <p>${reservation.flight.arrivalTime}</p>
                </div>

                <div class="form-group">
                    <label>Flight Duration</label>
                    <p>${formatDuration(calculateMinutesForDuration(
                        reservation.flight.departureDate,
                        reservation.flight.departureTime,
                        reservation.flight.arrivalDate,
                        reservation.flight.arrivalTime
                    ))}</p>
                </div>

                <div class="form-group">
                    <label>Origin</label>
                    <p>${reservation.flight.origin}</p>
                </div>

                <div class="form-group">
                    <label>Destination</label>
                    <p>${reservation.flight.destination}</p>
                </div>

                <div class="form-group">
                    <label>Passenger Name</label>
                    <p>${passenger.fullName}</p>
                </div>
            </div>

            <div class="options-group">
                <button class="cancel-button" onclick="closeModal('${modalId}')">Close</button>
            </div>
        </div>
    </div>
    `;
}