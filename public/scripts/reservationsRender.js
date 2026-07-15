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
    return `PHP ${Number(price).toLocaleString("en-PH")}`;
}

function getStatusClass(status) {
    return status.toLowerCase();
}

const airlineLogos = {
    "Philippine Airlines": "/images/PAL.png",
    "Cebu Pacific": "/images/CebuPac.png",
    "AirAsia": "/images/AirAsia.png",
    "Cathay Pacific": "/images/CathPac.png",
};

function getAirlineLogo(airline) {
    return airlineLogos[airline] || "/images/airline-logo.png";
}

function renderReservations(list) {
    const container = document.getElementById("reservationContainer");
    if (!container) return; // this page has no reservation list, nothing to render

    container.innerHTML = "";

    list.forEach(reservation => {
        container.innerHTML += createReservationCard(reservation);
        container.innerHTML += showFullReservationCard(reservation);
    });
}

function createReservationCard(reservation) {
    // Keyed on bookingReference + seat, since multiple passengers can
    // share the same bookingReference and IDs must be unique in the DOM.
    const modalId = `modal-${reservation.bookingReference}-${reservation.seat}`;
    const editModalId = `modal-edit-${reservation.bookingReference}-${reservation.seat}`;
    const cancelModalId = `modal-cancel-${reservation.bookingReference}-${reservation.seat}`;

    return `
    <div class="reservation-card">
        <img src="${getAirlineLogo(reservation.airline)}" class="card-airline-logo" alt="${reservation.airline} Logo">
                <div class="flight-subheader">
                    <h2 class="flight-title">
                        ${reservation.origin}
                        <img src="/images/right-arrow-red.png" class="right-arrow-img">
                        ${reservation.destination}
                    </h2>
                    <span class="status-badge ${getStatusClass(reservation.status)}">${reservation.status}</span>
                </div>

                <div class="flight-subheader">
                    <p><strong>Flight:</strong> ${reservation.flightNum}</p>
                    <p><strong>Provided by:<br></strong> ${reservation.airline}</p>
                </div>

                <p><strong>Date:</strong> ${formatDate(reservation.departureDate)}</p>
                <p><strong><br>Passenger:</strong> ${reservation.passenger}</p>

                <div class="options-group">
                    <button class="view-button" onclick="openModal('${modalId}')">View Details</button>
                    <button class="edit-button" onclick="openModal('${editModalId}')">Edit</button>
                    <button class="cancel-button" onclick="openModal('${cancelModalId}')">Cancel</button>
                </div>
    </div>
    `;
}

function showFullReservationCard(reservation) {
    const modalId = `modal-${reservation.bookingReference}-${reservation.seat}`;

    return `
    <div id="${modalId}" class="modal-overlay" onclick="whenUserClicksOutside(event, '${modalId}')">
        <div class="modal-content-box">
            <span class="modal-close-btn" onclick="closeModal('${modalId}')">
                <img src="/images/close_gray_x.png">
            </span>
            
            <div class="reservation-card">
                <img src="${getAirlineLogo(reservation.airline)}" class="full-card-airline-logo" alt="${reservation.airline} Logo">
                
                <div class="flight-header">
                    <div class="flight-subheader">
                        <h2 class="flight-title">
                            ${reservation.origin}
                            <img src="/images/right-arrow-red.png" class="right-arrow-img">
                            ${reservation.destination}
                        </h2>
                        <h2 class="flight-title">
                            ${reservation.flightNum}
                        </h2>
                    </div>

                    <div class="flight-subheader">
                        <p><strong>${formatDate(reservation.departureDate)}</strong></p>
                        <span class="status-badge ${getStatusClass(reservation.status)}">${reservation.status}</span>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>${reservation.departureTime}</strong> ${reservation.origin}</p> <br>
                        </div>
                        <h4 class="flight-passenger"><strong>${reservation.passenger}(${reservation.seat})</strong></h4>
                    </div>

                    <div class="flight-subheader">
                        <img src="/images/dotted-line-arrow-down.png" class="dotted-line-arrow-down-img">
                        <p class="flight-airline"><strong>Provided by:</strong><br>${reservation.airline}</p>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>${reservation.arrivalTime}</strong> ${reservation.destination}</p>
                        </div>
                    </div>

                </div>

                <div class="flight-subheader">
                    <p class="vertical-spacer"></p>
                </div>

                <div class="flight-subheader">
                    <h4 class="flight-duration">
                        <img src="/images/flight-image-ticket.png" class="plane-img">
                        Flight Duration: ${formatDuration(reservation.duration)}
                    </h4>
                    <h2 class="flight-price">${formatPrice(reservation.price)}</h2>    
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
