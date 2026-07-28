const {getReservationsHandler,updateSeatHandler} = require('../public/scripts/utilities/controller_helper.js');
const express = require('express');
const router = express.Router();
const {isAuthenticated,isUser} = require('../middleware/auth.js');
const bookingModel = require('../models/booking_model.js');
const flightModel = require('../models/flight_model.js');
const cityModel = require('../models/city_model.js');

router.get('/', isAuthenticated, isUser, async function(req,res){
    const cities = await cityModel.find({}).sort({ cityName: 1 }).lean();

    res.render('pages/reservations',{
        title: "Reservations",
        cities,
        pageScripts: `
            <script src="/scripts/reservationModal.js" defer></script>
            <script src="/scripts/reservationsRender.js" defer></script>
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});


router.get("/reservations-data", isAuthenticated, (req, res) => {
    getReservationsHandler(req, res, { filterAll: false });
});




//======PUT FUNCTIONS======
router.put("/passenger/:passengerId/status", isAuthenticated, async function(req, res){
    try {
        const { status } = req.body;

        if (status !== "Cancelled") {
            return res.status(400).json({ message: "Users may only cancel a reservation." });
        }

        const booking = await bookingModel.findOne({ "passengers._id": req.params.passengerId });
        if (!booking) {
            return res.status(404).json({ message: "Passenger not found" });
        }

        if (String(booking.belongsToUser) !== String(req.session.userID)) {
            return res.status(403).json({ message: "You do not have permission to modify this reservation." });
        }

        const passenger = booking.passengers.id(req.params.passengerId);

        if (passenger.status !== "Cancelled" && status === "Cancelled") {
            await flightModel.findByIdAndUpdate(booking.flight, {
                $inc: { [`cabin.${booking.cabinType}.seats`]: 1 }
            });
        }

        passenger.status = status;
        await booking.save();

        res.status(200).json({ message: "passenger status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put("/reservations/passenger/:passengerId/seat", isAuthenticated, (req, res) => {
    updateSeatHandler(req, res, { checkOwnership: true });
});

module.exports = router;