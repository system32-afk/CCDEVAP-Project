
function renderReservations(list) {

    const container =
        document.getElementById("reservationContainer");

    container.innerHTML = "";

    list.forEach(reservation => {

        container.innerHTML += createReservationCard(reservation);

    });

}

function createReservationCard(reservation){

    return `
    <div class="reservation-card">
        <img src="/images/PAL.png" class="card-airline-logo" alt="Airline Logo">
                <div class="flight-subheader">
                    <h2 class="flight-title">
                        NAIA (Manila)
                        <img src="/images/right-arrow-red.png" class="right-arrow-img">
                        MCIA (Cebu)
                    </h2>
                    <span class="status-badge confirmed">Confirmed</span>
                </div>

                <div class="flight-subheader">
                    <p><strong>Flight:</strong> PR-1845</p>
                    <p><strong>Provided by:<br></strong> Philippine Airlines</p>
                </div>

                <p><strong>Date:</strong> 12-07-2026</p>
                <p><strong><br>Passenger:</strong> Juan Cruz</p>

                <div class="options-group">
                    <button class="view-button" onclick="openModal('modal-1')">View Details</button>
                    <button class="edit-button" onclick="openModal('modal-edit')">Edit</button>
                    <button class="cancel-button" onclick="openModal('modal-cancel')">Cancel</button>
                </div>
    </div>
    `;

}

function showFullReservationCard(reservation){

    return `
    <div id="modal-1" class="modal-overlay" onclick="whenUserClicksOutside(event, 'modal-1')">
        <div class="modal-content-box">
            <span class="modal-close-btn" onclick="closeModal('modal-1')">
                <img src="/images/close_gray_x.png">
            </span>
            
            <div class="reservation-card">
                <img src="/images/PAL.png" class="full-card-airline-logo" alt="Airline Logo">
                
                <div class="flight-header">
                    <div class="flight-subheader">
                        <h2 class="flight-title">
                            NAIA (Manila)
                            <img src="/images/right-arrow-red.png" class="right-arrow-img">
                            MCIA (Cebu)
                        </h2>
                        <h2 class="flight-title">
                            PR-1845
                        </h2>
                    </div>

                    <div class="flight-subheader">
                        <p><strong>12-07-2026</strong></p>
                        <span class="status-badge confirmed">Confirmed</span>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>08:30</strong> Ninoy Aquino International Airport (MANILA)</p> <br>
                        </div>
                        <h4 class="flight-passenger"><strong>Juan Cruz(12A)</strong></h4>
                    </div>

                    <div class="flight-subheader">
                        <img src="/images/dotted-line-arrow-down.png" class="dotted-line-arrow-down-img">
                        <p class="flight-airline"><strong>Provided by:</strong><br>Philippine Airlines</p>
                    </div>

                    <div class="flight-subheader">
                        <div class="timeline">
                            <p class="timeline-route"><strong>10:00</strong> Mactan-Cebu International Airport (CEBU)</p>
                        </div>
                    </div>

                </div>

                <div class="flight-subheader">
                    <p class="vertical-spacer"></p>
                </div>

                <div class="flight-subheader">
                    <h4 class="flight-duration">
                        <img src="/images/flight-image-ticket.png" class="plane-img">
                        Flight Duration: 1h 30m
                    </h4>
                    <h2 class="flight-price">PHP 38,250</h2>    
                </div>
                
                <div class="flight-subheader">
                    <p></p>
                    <h4>BK-DOM982</h4>
                </div>
            </div>
        </div>
    </div>
    `;

}
