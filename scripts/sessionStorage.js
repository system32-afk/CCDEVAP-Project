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

