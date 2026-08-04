const flightModel = require('../models/flight_model.js');
const airlineModel = require('../models/airline_model.js');
const cityModel = require('../models/city_model.js');
const bookingModel = require('../models/booking_model.js');
const express = require('express');
const router = express.Router();
const {isAuthenticated} = require('../middleware/auth.js');






// gets flight
router.get('/flights/:id', isAuthenticated, async function(req,res){

    const flight = await flightModel.findById(req.params.id);

    if(!flight){
        return res.status(404).json({
            message: "Flight not found"
        });
    }

    
    res.json(flight);
});

// gets airlines
router.get('/airlines', isAuthenticated, async function(req,res) {
    try{
        const airlines = await airlineModel.find({}).sort({ airlineName :1}).lean();

        res.json(airlines);

    }catch(error){
        console.error(error);
        res.status(500).json({
            message: "Server error fetching airlines"
        });
    }
});

// gets airline
router.get('/airlines/:id', isAuthenticated, async function(req,res) {

    const airline = await airlineModel.findById(req.params.id);


    if(!airline){
        return res.status(404).json({
            message: "Airline not found"
        });
    }
    res.json(airline);
});

// gets cities
router.get('/cities', isAuthenticated, async function(req,res) {
    try{
        const cities = await cityModel.find({}).sort({ cityName: 1}).lean();
        res.json(cities);
    }catch(error){
            console.error("Error fetching cities", error);
            return res.status(500).json({ message: "Server error fetching cities"})
        }

});

// gets city
router.get('/cities/:id', isAuthenticated, async function(req,res) {
    
        const city = await cityModel.findById(req.params.id);

        if(!city){
            return res.status(404).json({
                message: "City not found"
            });
        }
    res.json(city);
});

router.get("/occupied-seats", isAuthenticated, async function(req, res) {
    try {
        const { flightId, cabinType } = req.query;

        const bookings = await bookingModel.find({
            flight: flightId,
            cabinType: cabinType,
            "passengers.status": "Confirmed"
        }).lean();

        const occupiedSeats = [];
        bookings.forEach(booking => {
            booking.passengers.forEach(passenger => {
                if (passenger.status === "Confirmed" && passenger.seat) {
                    occupiedSeats.push(passenger.seat);
                }
            });
        });

        res.status(200).json({ occupiedSeats });
    } catch (err) {
        console.error("Error fetching occupied seats:", err);
        res.status(500).json({ error: err.message });
    }
});

// gets occupied seats for a flight's cabin
router.get("/occupied-seats", isAuthenticated, async function(req, res) {
        try {
        const { flightId, cabinType } = req.query;

        const bookings = await bookingModel.find({
            flight: flightId,
            cabinType: cabinType,
            "passengers.status": "Confirmed"
        }).lean();

        const occupiedSeats = [];
        bookings.forEach(booking => {
            booking.passengers.forEach(passenger => {
                if (passenger.status === "Confirmed" && passenger.seat) {
                    occupiedSeats.push(passenger.seat);
                }
            });
        });

        return res.status(200).json({ occupiedSeats });
    } catch (err) {
        console.error("Error fetching occupied seats:", err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;