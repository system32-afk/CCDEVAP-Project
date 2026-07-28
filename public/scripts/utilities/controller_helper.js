
const bookingModel = require('../../../models/booking_model'); 

// for updating seat selection
const PREMIUM_SEAT_ROWS = [1, 2];
const SEAT_UPGRADE_PRICE = 500;

function isPremiumSeat(seatLabel) {
    const row = parseInt(seatLabel, 10);
    return PREMIUM_SEAT_ROWS.includes(row);
}

async function changePassengerSeat(booking, passengerId, newSeat) {
    const passenger = booking.passengers.id(passengerId);
    if (!passenger) {
        return { status: 404, body: { message: "Passenger not found" } };
    }

    if (passenger.status === "Cancelled") {
        return { status: 400, body: { message: "Cannot change the seat on a cancelled reservation." } };
    }

    if (newSeat === passenger.seat) {
        return { status: 200, body: { message: "Seat unchanged", seat: passenger.seat, price: passenger.price } };
    }

    const takenElsewhere = await bookingModel.findOne({
        _id: { $ne: booking._id },
        flight: booking.flight,
        cabinType: booking.cabinType,
        passengers: { $elemMatch: { seat: newSeat, status: "Confirmed" } }
    });

    const takenInSameBooking = booking.passengers.some(function(p) {
        return String(p._id) !== String(passenger._id) && p.seat === newSeat && p.status === "Confirmed";
    });

    if (takenElsewhere || takenInSameBooking) {
        return { status: 409, body: { message: "That seat is already taken." } };
    }

    const wasPremium = isPremiumSeat(passenger.seat);
    const nowPremium = isPremiumSeat(newSeat);

    if (!wasPremium && nowPremium) {
        passenger.price += SEAT_UPGRADE_PRICE;
        booking.totalPrice += SEAT_UPGRADE_PRICE;
    } else if (wasPremium && !nowPremium) {
        passenger.price -= SEAT_UPGRADE_PRICE;
        booking.totalPrice -= SEAT_UPGRADE_PRICE;
    }

    passenger.seat = newSeat;
    await booking.save();

    return {
        status: 200,
        body: {
            message: "Seat updated successfully",
            seat: passenger.seat,
            price: passenger.price,
            totalPrice: booking.totalPrice
        }
    };
}
async function updateSeatHandler(req, res, { checkOwnership = false } = {}) {
    try {
        const { seat } = req.body;
        if (!seat || typeof seat !== "string") {
            return res.status(400).json({ message: "A seat is required." });
        }

        const booking = await bookingModel.findOne({ "passengers._id": req.params.passengerId });
        if (!booking) {
            return res.status(404).json({ message: "Passenger not found" });
        }

        if (checkOwnership && String(booking.belongsToUser) !== String(req.session.userID)) {
            return res.status(403).json({ message: "You do not have permission to modify this reservation." });
        }

        const result = await changePassengerSeat(booking, req.params.passengerId, seat);
        return res.status(result.status).json(result.body);
    } catch (err) {
        console.error("Error updating seat:", err);
        return res.status(500).json({ error: err.message });
    }
}
async function getReservationsHandler(req, res, { filterAll = false } = {}) {
    try {
        // Admin fetches all ({}), customer fetches only their own
        const filter = filterAll ? {} : { belongsToUser: req.session.userID };

        const reservations = await bookingModel.find(filter).populate('flight').lean();

        return res.status(200).json(reservations);
    } catch (err) {
        console.error("Error fetching reservations:", err);
        return res.status(500).json({ message: "server error fetching reservations." });
    }
}


module.exports = {
    getReservationsHandler,
    updateSeatHandler
};