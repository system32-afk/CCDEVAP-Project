const express = require('express');
const router = express.Router();
const {isAuthenticated,isUser} = require('../middleware/auth.js');
const flightModel = require('../models/flight_model.js');


router.get('/', isAuthenticated,isUser, function(req,res){
    res.render('pages/search',{
        title: "Search",
        layout:"main", 
        pageScripts: `           
            <script src="../scripts/sessionStorage.js" defer></script>
            <script src="../scripts/search_script.js" defer></script>
            <script src="../scripts/PassengerTypes_script.js" defer></script>
            <script src="../scripts/dropdowns_Script.js" defer></script>
            <script src="../scripts/advanceSearch_scripts.js" defer></script>
            <script src="../scripts/getFlights_script.js" defer></script>
            <script src="../scripts/utilities/search_dropdown_script.js" defer></script>
            <script src="../scripts/utilities/flights_database_script.js" defer></script>
            <script src="../scripts/helper_algorithms.js" defer></script>
            <script src="../scripts/filter_sidebar.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

router.get("/search-flights",isAuthenticated, isUser, async function(req,res){
    

    try{
        var {origin,
            destination,
            cabinType,
            departureDate,
            airline,
            isFlexible,
            isDirectFlight,
            minPrice,
            maxPrice} = req.query;

            //default query condition
            var queryCondition ={isActive:true};


            //QUERY PARAMETERS

            //must match origin
            if(origin){
                queryCondition.origin = origin;
            }
            //must match destination
            if(destination){
                queryCondition.destination = destination;
            }

            //must match airline  preference
            if(airline && airline !== "any"){
                queryCondition.airline = airline;
            }

            //must match cabin type
            if (cabinType) {
                const seatsPath = `cabin.${cabinType}.seats`;

                queryCondition[seatsPath] = { $gt: 0 }; 
            }

            //must match if flight is direct flight
            if(isDirectFlight==="true"){
                queryCondition.numOfLayovers = 0;
            }

            
            if(Number(maxPrice) !==0){
                const price = `cabin.${cabinType}.price`;
                queryCondition[price]={
                    $gte: Number(minPrice),
                    $lte: Number(maxPrice)
                }
            }

            if (isFlexible === "true" && departureDate) {
                const baseDate = new Date(`${departureDate}T00:00:00.000Z`);
                if (!isNaN(baseDate.getTime())) {
                    const fiveDayRange = 5 * 24 * 60 * 60 * 1000;
                    const minDate = new Date(baseDate.getTime() - fiveDayRange);
                    const maxDate = new Date(baseDate.getTime() + fiveDayRange);
                    queryCondition.departureDate = {
                    $gte: minDate,
                    $lte: maxDate
                    };
                }
                }
                else if (isFlexible==="false") {
                queryCondition.departureDate = new Date(`${departureDate}T00:00:00.000Z`);
            }

        
        console.log("Query Params:", req.query);
        console.log("Mongo Query:", queryCondition);

        const flights = await flightModel.find(queryCondition);
        console.log("Flights:", flights);
        return res.status(200).json(flights);
    }catch(error){
        console.error("BACKEND ERROR: ERROR FETCHING FLIGHTS: ", error);
        return res.status(500).json({ message: "server error fetching flight" });
    }
 
})

router.get("/flight-info",isAuthenticated, isUser, async function(req,res){
    try{
        let {flightID} = req.query; 

        const flightInfo = await flightModel.findById(flightID);

        if (!flightInfo) {
            return res.status(404).json({ message: "Flight not found" });
        }

        return res.status(200).json(flightInfo);
    }catch(error){
        console.error("BACKEND ERROR: ERROR FETCHING FLIGHT INFO: ", error);
        return res.status(500).json({ message: "server error fetching flight info" });
    }
})



module.exports = router;