function getBookingInfo() {
    return JSON.parse(sessionStorage.getItem("booking_info")) || {
        originCity: "",
        destinationCity: "",
        departureDate: "",
        returnDate: "",
        cabinType: "Economy",
        tripType: "one-way",
        passengers: {
            adults: 1,
            children: 0,
            infants: 0
        }
    };
}

function getFilterOptions(){
    return JSON.parse(sessionStorage.getItem("filter_options")) ||{
    airline: "any",
    isDirectFlight: false,
    isFlexible: false,
    minPrice: 1,
    maxPrice: 0,
    };
}

