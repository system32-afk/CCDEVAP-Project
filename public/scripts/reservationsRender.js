// Displays all reservation cards on the page
function renderReservations(list) {
    const container = document.getElementById("reservationContainer");
    if (!container) return;

    container.innerHTML = "";

    list.forEach(reservation => {
        // Create a card and its matching modal for each passenger
        for (let i = 0; i < reservation.passengers.length; i++) {
            container.innerHTML += createReservationCard(reservation, reservation.passengers[i]);
            container.innerHTML += showFullReservationCard(reservation, reservation.passengers[i]);
        }
    });
}

// Creates the reservation card shown in the list
function createReservationCard(reservation, passenger) {
    const modalId = `modal-${reservation.bookingReference}-${passenger.seat}`;
    const editModalId = `modal-edit-${reservation.bookingReference}-${passenger.seat}`;

    return `
    <div class="reservation-card">
        <img src="${getAirlineLogo(reservation.flight.airline)}" class="card-airline-logo" alt="${reservation.flight.airline} Logo">
                <div class="flight-subheader">
                    <h2 class="flight-title">
                        ${reservation.flight.origin}
                        <img src="/images/right-arrow-red.png" class="right-arrow-img">
                        ${reservation.flight.destination}
                    </h2>
                    <span class="status-badge ${getStatusClass(passenger.status)}">${passenger.status}</span>
                </div>

                <div class="flight-subheader">
                    <p><strong>Flight:</strong> ${reservation.flight.flightNumber}</p>
                    <p><strong>Provided by:<br></strong> ${reservation.flight.airline}</p>
                </div>

                <p><strong>Date:</strong> ${formatDate(reservation.flight.departureDate)}</p>
                <p><strong><br><br>Passenger:</strong> ${passenger.fullName}</p>

                <div class="options-group">
                    <button class="view-button" onclick="openModal('${modalId}')">View Details</button>
                    <button class="edit-button" onclick="openModal('${editModalId}')">Edit</button>
                    <button class="cancel-button" onclick="requestCancelReservation('${passenger._id}', '${passenger.status}')">Cancel</button>
                </div>
    </div>
    `;
}

// Creates the full reservation details shown in the modal
function showFullReservationCard(reservation, passenger) {
    const modalId = `modal-${reservation.bookingReference}-${passenger.seat}`;

    return `
    <div id="${modalId}" class="modal-overlay" onclick="whenUserClicksOutside(event, '${modalId}')">
        <div class="modal-content-box">
            <span class="modal-close-btn" onclick="closeModal('${modalId}')">
                <img src="/images/close_gray_x.png">
            </span>
            
            <div class="reservation-card">
                <img src="${getAirlineLogo(reservation.flight.airline)}" class="full-card-airline-logo" alt="${reservation.flight.airline} Logo">
                
                <div class="flight-header">
                    <div class="flight-subheader">
                        <h2 class="flight-title">
                            ${reservation.flight.origin}
                            <img src="/images/right-arrow-red.png" class="right-arrow-img">
                            ${reservation.flight.destination}
                        </h2>
                        <h2 class="flight-title">
                            ${reservation.flight.flightNumber}
                        </h2>
                    </div>

                    <div class="flight-subheader">
                        <p><strong>${formatDate(reservation.flight.departureDate)}</strong></p>
                        <span class="status-badge ${getStatusClass(passenger.status)}">${passenger.status}</span>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>${reservation.flight.departureTime}</strong> 
                            ${reservation.flight.origin}</p> <br>
                        </div>
                        <h4 class="flight-passenger"><strong>${passenger.fullName} (${passenger.seat})</strong></h4>
                    </div>

                    <div class="flight-subheader">
                        <img src="/images/dotted-line-arrow-down.png" class="dotted-line-arrow-down-img">
                        <p class="flight-airline"><strong>Provided by:</strong><br>${reservation.flight.airline}</p>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>${reservation.flight.arrivalTime}</strong> ${reservation.flight.destination}</p>
                        </div>
                    </div>

                </div>

                <div class="flight-subheader">
                    <p class="vertical-spacer"></p>
                </div>

                <div class="flight-subheader">
                    <h4 class="flight-duration">
                        <img src="/images/flight-image-ticket.png" class="plane-img">
                        Flight Duration: ${formatDuration(calculateMinutesForDuration(
                            reservation.flight.departureDate,
                            reservation.flight.departureTime,
                            reservation.flight.arrivalDate,
                            reservation.flight.arrivalTime
                        ))}
                    </h4>
                    <h2 class="flight-price">${formatPrice(passenger.price)}</h2>
                </div>

                <div class="flight-subheader">
                    <p></p>
                    <h4>${reservation.bookingReference}</h4>
                </div>
            </div>
        </div>
    </div>
    `;
}