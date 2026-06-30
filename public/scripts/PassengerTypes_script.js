const addAdult = $('#adult-increase');
const subtractAdult = $('#adult-decrease');
const adultCount = $('#adult-count');

const addChild = $('#child-increase');
const subtractChild = $('#child-decrease');
const childCount = $('#child-count'); 

const addInfant = $('#infant-increase');
const subtractInfant = $('#infant-decrease');
const infantCount = $('#infant-count'); 
const passengerSelect = $('#passenger-select'); //the dropdown button for passenger select


var passengers = booking_info.passengers || {
    adults: 1,
    children: 0,
    infants: 0
};

const MAX_PASSENGERS = 9;




$(function() {
    updatePassengerSelectText();
    $("#adults-count").text(passengers.adults);
    $("#children-count").text(passengers.children);
    $("#infants-count").text(passengers.infants);
});

function addPassenger (type) {
    if (passengers.adults + passengers.children + passengers.infants < MAX_PASSENGERS) {
        passengers[type]++;
        $(`#${type}-count`).text(passengers[type]);
        updatePassengerSelectText()
        
    }
    
}

function subtractPassenger (type) {
    if (type === 'adults' && passengers.adults > 1) {
        passengers.adults--;
        $(`#${type}-count`).text(passengers[type]);
        updatePassengerSelectText()
    }else if (type === 'children' && passengers[type] > 0) {
        passengers[type]--;
        $(`#${type}-count`).text(passengers[type]);
        updatePassengerSelectText()
    }else if (type === 'infants' && passengers[type] > 0) {
        passengers[type]--;
        $(`#${type}-count`).text(passengers[type]);
        updatePassengerSelectText()
    }
    
}

function updatePassengerSelectText() {

    var text = `${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`;

    if (passengers.children > 0) {
        text += `, ${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`;
    }

    if (passengers.infants > 0) {
        text += `, ${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`;
    }

    passengerSelect.text(text);
}


//prevents passenger dropdown from closing
$('.dropdown-passengers').on('click', (event) => {
    event.stopPropagation();
});





sessionStorage.setItem(
    "booking_info",
    JSON.stringify(booking_info)
);