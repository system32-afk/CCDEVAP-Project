const {getReservationsHandler,updateSeatHandler} = require('../public/scripts/utilities/controller_helper.js');
const express = require('express');
const router = express.Router();
const {isAuthenticated,isUser} = require('../middleware/auth.js');
const bookingModel = require('../models/booking_model.js');
const flightModel = require('../models/flight_model.js');
const AuditLog = require('../models/AuditLog.js');

router.get('/', isAuthenticated,isUser, function(req, res) {
        res.render('pages/booking', {
        title: "Bookings",
        flightId: req.query.flightId,
        returnFlightId: req.query.returnFlightId || "",
        pageScripts: `
            <script src="../scripts/sessionStorage.js"></script>
            <script src="../scripts/booking.js"></script>
    `
    });
});


router.post("/", isAuthenticated, isUser, async function(req, res) {
    try {
        const { flightId, returnFlightId, cabinType, totalPrice, returnTotalPrice, passengers, returnPassengers } = req.body;

        const flight = await flightModel.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: "Departure flight not found" });
        }

        // check if any requested seat is already taken by a confirmed passenger
        const requestedSeats = passengers.map(p => p.seat).filter(Boolean);
        if (requestedSeats.length) {
            const seatConflict = await bookingModel.findOne({
                flight: flightId,
                cabinType: cabinType,
                "passengers.status": "Confirmed",
                "passengers.seat": { $in: requestedSeats }
            });
            if (seatConflict) {
                return res.status(409).json({ message: "This seat is already occupied" });
            }
        }

        if (flight.cabin[cabinType].seats < passengers.length) {
            return res.status(409).json({ message: "Not enough seats available on departure flight" });
        }

        const bookingRef = "BK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        const newBooking = new bookingModel({
            bookingReference: bookingRef,
            flight: flightId,
            cabinType: cabinType,
            belongsToUser: req.session.userID,
            totalPrice: totalPrice,
            passengers: passengers
        });

        await newBooking.save();

        await flightModel.findByIdAndUpdate(flightId, {
            $inc: { [`cabin.${cabinType}.seats`]: -passengers.length }
        });

        await AuditLog.create({
            actor: req.session.email,
            action: "RESERVATION CREATED",
            user_role: req.session.role
        });

        if (returnFlightId) {
            const returnFlight = await flightModel.findById(returnFlightId);
            if (!returnFlight) {
                return res.status(404).json({ message: "Return flight not found" });
            }

            // check if any requested seat is already taken by a confirmed passenger
            const returnRequestedSeats = returnPassengers.map(p => p.seat).filter(Boolean);
            if (returnRequestedSeats.length) {
                const returnSeatConflict = await bookingModel.findOne({
                    flight: returnFlightId,
                    cabinType: cabinType,
                    "passengers.status": "Confirmed",
                    "passengers.seat": { $in: returnRequestedSeats }
                });
                if (returnSeatConflict) {
                    return res.status(409).json({ message: "This seat is already occupied" });
                }
            }

            if (returnFlight.cabin[cabinType].seats < returnPassengers.length) {
                return res.status(409).json({ message: "Not enough seats available on return flight" });
            }

            const returnRef = "BK-" + Math.random().toString(36).substring(2, 10).toUpperCase();

            const returnBooking = new bookingModel({
                bookingReference: returnRef,
                flight: returnFlightId,
                cabinType: cabinType,
                belongsToUser: req.session.userID,
                totalPrice: returnTotalPrice,
                passengers: returnPassengers
            });

            await returnBooking.save();

            await flightModel.findByIdAndUpdate(returnFlightId, {
                $inc: { [`cabin.${cabinType}.seats`]: -returnPassengers.length }
            });

            await AuditLog.create({
                actor: req.session.email,
                action: "RESERVATION CREATED",
                user_role: req.session.role
            });
        }

        return res.status(201).json({ message: "Booking saved successfully" });
    } catch(err) {
        console.error("Booking error: ", err);
        return res.status(500).json({ error: err.message });
    }
});



module.exports = router;