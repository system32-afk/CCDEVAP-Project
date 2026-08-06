const express = require('express');
const router = express.Router();
const {isAuthenticated,isAdmin} = require('../middleware/auth.js');
const {getReservationsHandler,updateSeatHandler} = require('../public/scripts/utilities/controller_helper.js');
const userModel = require('../models/user_model.js');
const flightModel = require('../models/flight_model.js');
const airlineModel = require('../models/airline_model.js');
const cityModel = require('../models/city_model.js');
const savedPassengerModel = require('../models/savedPassenger_Model.js');
const travelHistoryModel = require('../models/TravelHistory_model.js');
const bookingModel = require('../models/booking_model.js');
const AuditLog = require('../models/AuditLog.js');


router.get('/', isAuthenticated, isAdmin, function(req,res){
    res.render('pages/admin-dashboard',{
        title: "Admin Dashboard",
        isAdmin: req.session.role === "admin",
        pageScripts: `
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
        `
    });
});

router.get('/admin-flights', isAuthenticated, isAdmin, async function(req,res){

    const currentCabin = req.query.cabin || 'economy';
      let sortField = {};
        switch(currentCabin) {
            case 'economy':
                sortField = { 'cabin.economy.price': 1 };
                break;
            case 'premium_economy':
                sortField = { 'cabin.premium_economy.price': 1 };
                break;
            case 'business_class':
                sortField = { 'cabin.business_class.price': 1 };
                break;
            case 'first_class':
                sortField = { 'cabin.first_class.price': 1 };
                break;
            default:
                sortField = { 'cabin.economy.price': 1 };
                break;
        }
    //read flights that are only active and sort flightnumber ascending    
    const flights = await flightModel.find({ isActive: true}).sort({flightNumber: 1}).lean();
    const cities = await cityModel.find({}).sort({ cityName: 1}).lean();
    const airlines = await airlineModel.find({}).sort({ airlineName :1}).lean();

    // lean for to return JS objects instead of mongoose documents



    res.render('pages/admin-flights',{
        title: "Admin Flights",
        flights: flights,
        isAdmin: req.session.role === "admin",
        airlines,
        cities,
        currentCabin:currentCabin,
        pageScripts: `    
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/admin.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
    
});

router.get('/admin-reservations', isAuthenticated, isAdmin, function(req,res){
    res.render('pages/admin-reservations',{
        title: "Admin Reservations",
        isAdmin: req.session.role === "admin",
        pageScripts: `
            <script src="/scripts/reservationModal.js" defer></script>
            <script src="/scripts/reservationsRenderAdmin.js" defer></script>
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/admin.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

router.get('/admin-users',isAuthenticated , isAdmin, function(req,res){
    res.render('pages/admin-users',{
        title: "Admin Users",
        isAdmin: req.session.role === "admin",
        pageScripts: `
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});
router.get('/admin-audit-logs',isAuthenticated , isAdmin, async function(req,res){
    
    const audits = await AuditLog.find({}).sort({timestamp:-1}).lean();
    
    res.render('pages/admin-audit-logs',{
        title: "Audit Logs",
        AuditLog: audits,
        isAdmin: req.session.role === "admin",
        pageScripts: `
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});
router.get("/admin-reservations-data", isAuthenticated, isAdmin, async function(req, res){
    try{
        var reservations = await bookingModel.find({}).populate('flight').lean();
        return res.status(200).json(reservations);
    }catch(err){
        console.error("Error fetching all reservations:", err);
        return res.status(500).json({ message: "server error fetching reservations." });
    }
});

router.get("/admin-reservations-data", isAuthenticated, isAdmin, (req, res) => {
    getReservationsHandler(req, res, { filterAll: true });
});
//===============POST FUNCTIONS===========
// create city
router.post("/admin-cities",isAuthenticated, isAdmin, async function(req, res){
    const {cityName} = req.body;

    // checks if city already exists
    let city = await cityModel.findOne({cityName});
        if(city){
            return res.redirect('/admin/admin-flights');
        }

        city = new cityModel({
            cityName
        });
        await city.save();

        res.redirect('/admin/admin-flights');
});

// creates airline
router.post("/admin-airlines",isAuthenticated, isAdmin, async function(req, res){
    const {airlineName, isAirlineActive} = req.body;


    // checks if airline already exists
    let airline = await airlineModel.findOne({airlineName});
        if(airline){
            return res.redirect('/admin/admin-flights');
        }

        airline = new airlineModel({
            airlineName, isAirlineActive
        });
        await airline.save();

        res.redirect('/admin/admin-flights');
});

// create flight
router.post("/admin-flights",isAuthenticated, isAdmin, async function(req,res){
    const {flightNumber, airline,origin, destination, departureDate, departureTime, arrivalDate,
        arrivalTime, logoName, numOfLayovers, isActive, cabin} = req.body;

    // const admin = await userModel.findById(req.session.userID);
    //     if(!admin){
    //         return res.status(401).json({message: "Admin not found"});
    //     }

     flight = new flightModel({
        flightNumber, 
        airline,
        origin,
        destination,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        logoName,
        numOfLayovers,
        isActive,
        cabin
    });
    await flight.save();

    await AuditLog.create({
        actor: req.session.email,
        action:"FLIGHT CREATED",
        user_role: req.session.role
    });

    res.redirect('/admin/admin-flights');
});





//===========PUT FUNCTIONS=================

router.put("/admin-flights/:id", isAuthenticated, isAdmin,async function(req,res){
  
    
  
    const updatedFlight = await flightModel.findByIdAndUpdate(
        req.params.id,
       req.body,
        {returnDocument:"after"}
    );

    
    await AuditLog.create({
        actor: req.session.email,
        action:"FLIGHT UPDATED",
        user_role: req.session.role
    });

    res.json(updatedFlight);
})

// updates airlines
router.put("/admin-airlines/:id",isAuthenticated, isAdmin, async function(req,res){

    const airline = await airlineModel.findByIdAndUpdate(
        req.params.id, { $set: req.body}, { returnDocument: "after"}
    );
    res.json(airline);
})

router.put("/admin-cities/:id",isAuthenticated, isAdmin, async function(req,res){
    const city = await cityModel.findByIdAndUpdate(
        req.params.id, { $set: req.body},  {returnDocument:"after"}
    );
    res.json(city);
})

router.put("/admin-reservations/passenger/:passengerId/status",isAuthenticated, isAdmin, async function(req, res){
    try {
        const { status } = req.body;
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        if (!["Confirmed", "Cancelled"].includes(normalizedStatus)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const booking = await bookingModel.findOne({ "passengers._id": req.params.passengerId });
        if (!booking) {
            return res.status(404).json({ message: "Passenger not found" });
        }

        const passenger = booking.passengers.id(req.params.passengerId);

        if (passenger.status !== "Cancelled" && normalizedStatus === "Cancelled") {
            await flightModel.findByIdAndUpdate(booking.flight, {
                $inc: { [`cabin.${booking.cabinType}.seats`]: 1 }
            });
        }

        passenger.status = normalizedStatus;
        await booking.save();

        res.status(200).json({ message: "passenger status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//updating seat selection
router.put("/passenger/:passengerId/seat", isAuthenticated, isAdmin, (req, res) => {
    updateSeatHandler(req, res, { checkOwnership: false });
});






//=========PATCH FUNCTIONS==========

// soft deletes flight
router.patch("/admin-flights/:id/deactivate", isAuthenticated, isAdmin, async function(req,res){

    try{
  
        // const admin = await userModel.findById(req.session.userID);
        //     if(!admin){
        //         return res.status(401).json({message: "Admin not found"});
        //     }
              
        const flight = await flightModel.findByIdAndUpdate(
            req.params.id,
            {$set: {isActive: false}},
            {returnDocument: 'after'}
        );

        if(!flight){
            return res.status(404).json({
                message: "Flight not found."
            });
        }

        await AuditLog.create({
            actor: req.session.email,
            action:"FLIGHT DEACTIVATED",
            user_role: req.session.role
        });

        return res.status(200).json({
            message: "Flight canncelled successfully."
        });
    


    }catch(err){
        return res.status(500).json({
            error:err.message
        });
    }

});

router.patch("/admin-airlines/:id/deactivate", isAuthenticated, isAdmin, async function(req,res){
    try{
        const airline = await airlineModel.findByIdAndUpdate(
            req.params.id,
            {$set:{isAirlineActive: false}},
            {returnDocument: "after"}
        );
        if(!airline){
            return res.status(404).json({
                message:  "Airline not found"
            });
        }
        return res.status(200).json({
            message: "Airline deactivated successfully."
        });
    }catch(err){
            return res.status(500).json({
            error:err.message
        }); 
    }
});

module.exports = router;