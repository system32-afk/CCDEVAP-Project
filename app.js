const dotenv = require('dotenv');
dotenv.config({path: './credentials.env'});
const session = require('express-session');
const MongoStore = require('connect-mongo');
const express = require('express');
const expresshbs = require('express-handlebars');
const port = process.env.SERVER_port;
const sessionString = process.env.secretString;
const DBuri = process.env.DBuri;
const DBname = process.env.DBname;
const app = express('express');
const bcrypt  = require('bcryptjs')
const userModel = require('./models/user_model.js');
const flightModel = require('./models/flight_model.js');
const airlineModel = require('./models/airline_model.js');
const cityModel = require('./models/city_model.js');
const savedPassengerModel = require('./models/savedPassenger_Model.js');
const travelHistoryModel = require('./models/TravelHistory_model.js');
const bookingModel = require('./models/booking_model.js');

//DATABASE CONNECTION
const {connectToMongoDB} = require('./conn.js'); 
const { ReturnDocument } = require('mongodb');

connectToMongoDB((err) =>{
    if (err){
        console.log("an error occured while connecting to mongoDB");
        console.log(err);
        process.exit(); // close the program
    }else{
        console.log("connected")
    }
})




// to load static files in /public folder
app.use(express.static(__dirname + "/public"));

//creates login session for authentication
app.use(session({
    secret: sessionString,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.MongoStore.create({
        mongoUrl: DBuri,
        collection: DBname
    }),
    cookie: {
        httpOnly: true,
        secure: false, // Set to true if deploying over HTTPS
        maxAge: 1000 * 60 * 60 * 24 // expires after 24 hours
    }
}));



app.engine("hbs", expresshbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    helpers: {
        eq: function(a, b){
            return a === b;
        },
        formatDate: function(date){
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        }
    }
}));

app.set("view engine", "hbs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//makes it so whenever the server starts it goes to login immediately
app.get('/', function(req,res){
    res.redirect("/login");
})

app.get('/login', function(req,res){
    res.render("pages/login",{layout:'auth'});
})

app.get('/register', function(req,res){
    res.render("pages/register",{
        layout:'auth',
         pageScripts: `
            <script src="../scripts/DOB_formater_script.js" defer></script>
            `});
})

app.get('/home', isAuthenticated, async function(req, res) {
    
    try{
        var currentUser = await userModel.findById(req.session.userID);
        res.render("pages/index", {
        title: "Online Airline Ticketing System",
        pageScripts: `
            <script src="../scripts/sessionStorage.js" defer></script>
            <script src="../scripts/index_searchFlight.js" defer></script>
            <script src="../scripts/utilities/search_dropdown_script.js" defer></script>
        `
    });
    }catch(err){
        res.status(500).send("Error logging in. Server Error")
    }
    
});

app.get('/admin-dashboard', isAuthenticated,function(req,res){
    res.render('pages/admin-dashboard',{
        title: "Admin Dashboard",
        pageScripts: `
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
        `
    });
});

app.get('/admin-flights', isAuthenticated, async function(req,res){

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

// gets flight
app.get('/api/flights/:id', isAuthenticated, async function(req,res){

    const flight = await flightModel.findById(req.params.id);

    if(!flight){
        return res.status(404).json({
            message: "Flight not found"
        });
    }

    
    res.json(flight);
});

// gets airlines
app.get('/api/airlines', isAuthenticated, async function(req,res) {
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
app.get('/api/airlines/:id', isAuthenticated, async function(req,res) {

    const airline = await airlineModel.findById(req.params.id);


    if(!airline){
        return res.status(404).json({
            message: "Airline not found"
        });
    }
    res.json(airline);
});

// gets cities
app.get('/api/cities', isAuthenticated, async function(req,res) {
    try{
        const cities = await cityModel.find({}).sort({ cityName: 1}).lean();
        res.json(cities);
    }catch(error){
            console.error("Error fetching cities", error);
            return res.status(500).json({ message: "Server error fetching cities"})
        }

});

// gets city
app.get('/api/cities/:id', isAuthenticated, async function(req,res) {
    
        const city = await cityModel.findById(req.params.id);

        if(!city){
            return res.status(404).json({
                message: "City not found"
            });
        }
    res.json(city);
});



app.get('/admin-reservations', isAuthenticated,function(req,res){
    res.render('pages/admin-reservations',{
        title: "Admin Reservations",
        pageScripts: `
            <script src="/scripts/reservationModal.js" defer></script>
            <script src="/scripts/reservationsRenderAdmin.js" defer></script>
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/admin.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/admin-users',isAuthenticated ,function(req,res){
    res.render('pages/admin-users',{
        title: "Admin Users",
        pageScripts: `
            <script src="../scripts/reservations.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});


app.get('/booking', isAuthenticated, function(req, res) {
    res.render('pages/booking', {
        title: "Bookings",
        flightId: req.query.flightId,
        pageScripts: `
            <script src="../scripts/sessionStorage.js"></script>
            <script src="../scripts/booking.js"></script>
    `
    });
});

app.get('/profile', isAuthenticated , async function(req,res){
    var user = await userModel.findById(req.session.userID).lean();
    var savedPassenger = await savedPassengerModel.find({belong_to_user:req.session.userID})
    console.log("Sending user to template:", user);
    res.render('pages/profile',{
        user: user,
        savedPassenger:savedPassenger,
        title: "Profile",
        pageScripts: `
            <script src="../scripts/utilities/saved_passengers.js" defer></script>
            <script src="../scripts/utilities/user_travel_history.js" defer></script>
            <script src="../scripts/profile.js" defer></script>
            <script src="../scripts/utilities/payment_methods.js" defer></script>
            <script src="../scripts/utilities/load_navbar_script.js" defer></script>
            <script src="../scripts/helper_algorithms.js" defer></script>
            <script src="../scripts/utilities/user_info.js" defer></script>
            <script src="../scripts/DOB_formater_script.js" defer></script>
    `
    });
});


app.get("/saved-passengers",isAuthenticated, async function(req,res) {
    try{

        console.log("Session User ID:", req.session.userID);
        var passengers = await savedPassengerModel.find({
            belongs_to_user: req.session.userID
        });

        return res.status(200).json(passengers);
    }catch(error){
        console.error("error fetching saved passengers:", error);
        return res.status(500).json({ message: "server error fetching passengers." });
    }
})

app.get("/saved-passengers/edit/:id", isAuthenticated, async function(req,res){
    try{
        var passenger = await savedPassengerModel.findById(req.params.id);
        res.status(200).json(passenger);
    }catch(err){
        res.status(500).json({ error: err.message});
    }
})

app.get("/paymentMethods", isAuthenticated, async function(req,res){
    try{
        var user = await userModel.findById(req.session.userID);

        if(!user){
            return res.status(404).json({message: "User profile not found!"});
        }

        var cards = user.paymentMethods;

        return res.status(200).json(cards);
    }catch(err){
        console.error("Error retreiving payment methods: ",err);
        return res.status(500).json({ error: " server error fetching payment records." });
    }
})

app.get("/travel-history", isAuthenticated, async function(req,res) {
    try{
        var history = await travelHistoryModel.find({belongs_to_user: req.session.userID});

        if(!history){
            return res.status(404).json({message: "Travel history not found!"});
        }

        return res.status(200).json(history);
    }catch(error){

    }
})

app.get('/reservations', async function(req,res){
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

app.get('/search', isAuthenticated, function(req,res){
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

app.get('/logout',isAuthenticated ,function(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid'); // Clears the browser session cookie
        res.redirect('/login');
    });
});

app.get("/search-flights",isAuthenticated, async function(req,res){
    

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

app.get("/flight-info",isAuthenticated, async function(req,res){
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

//=========================POST FUNCTIONS=============================================
app.post("/register",async  function(req,res){
    
    const {Fname,Lname,MI,DOB,MobileNum,nationality,sex,password,emailAddress} =  req.body; 

    let user = await userModel.findOne({emailAddress});
    if(user){
        return res.redirect('/register');
    }
    var hashedPsw =  await bcrypt.hash(password,12);
    user = new userModel({
        Fname,
        Lname,
        MI,
        DOB,
        MobileNum,
        nationality,
        sex,
        password: hashedPsw,
        emailAddress});

    await user.save();

    res.redirect('/login');
});

// create city
app.post("/admin-cities", async function(req, res){
    const {cityName} = req.body;

    // checks if city already exists
    let city = await cityModel.findOne({cityName});
        if(city){
            return res.redirect('/admin-flights');
        }

        city = new cityModel({
            cityName
        });
        await city.save();

        res.redirect('/admin-flights');
});

// creates airline
app.post("/admin-airlines", async function(req, res){
    const {airlineName, isAirlineActive} = req.body;


    // checks if airline already exists
    let airline = await airlineModel.findOne({airlineName});
        if(airline){
            return res.redirect('/admin-flights');
        }

        airline = new airlineModel({
            airlineName, isAirlineActive
        });
        await airline.save();

        res.redirect('/admin-flights');
});

// create flight
app.post("/admin-flights", async function(req,res){
    const {flightNumber, airline,origin, destination, departureDate, departureTime, arrivalDate,
        arrivalTime, logoName, numOfLayovers, isActive, cabin} = req.body;

    // CHECKS IF FLIGHT ALREADY EXISTS
    let flight = await flightModel.findOne({flightNumber});
    if(flight) {
        return res.redirect('/admin-flights');
    }

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

    res.redirect('/admin-flights');
});

app.post("/login", async function(req,res){
    const{emailAddress, password} = req.body;

    const  user = await userModel.findOne({emailAddress});
    console.log("User object found in DB:", user);
    if(!user){
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        console.log("wrong password");
        return res.redirect("/login");
    }

    req.session.userID = user._id;
    req.session.isLoggedIn = true;
    
    req.session.save((err) => {
        if(err){
            console.errow("Session save error:", err);
        }else{
            res.redirect("/home");
        }
        
    })
});

app.post("/saved-passengers/add", isAuthenticated, async function (req, res) {
    try {
        const newPassenger = new savedPassengerModel({
            ...req.body,
            belongs_to_user: req.session.userID
        });
        await newPassenger.save();
        res.status(201).json({ message: "Passenger added successfully" });
    } catch(err) {
        
        
        res.status(500).json({ message: err.message });
    }
});


app.post("/add-payment",isAuthenticated,async function(req,res){
    try{
        const user = await userModel.findById(req.session.userID);

        if(!user){
            return res.status(404).json({message: "User account not found"});
        }

        user.paymentMethods.push(req.body);

        await user.save();

        return res.status(200).json({message: "Payment method saved"});
    }catch(err){
            console.error("Payment registration error: ",err);
            return res.status(500).json({ error: err.message });
        };
})

//==========================PUT FUNCTIONS=============================


app.put("/profile/update", isAuthenticated, async function(req,res){
    const {Fname, Lname, MI, sex, MobileNum, DOB, nationality } = req.body;

    var updatedUser = await userModel.findByIdAndUpdate(
    req.session.userID,
    {
        $set:{
            Fname,
            Lname,
            MI,
            sex,
            MobileNum,
            DOB,
            nationality
        }
    },
    { 
    returnDocument: 'after',
    runValidators: true 
    }
    )

    if (!updatedUser) {
        return res.status(404).json({ message: "User profile record not found." });
    }

    return res.status(200).json({ message: "Information updated successfully!" });
})

app.put("/saved-passengers/update/:id",isAuthenticated, async function(req,res){
    try{
        await savedPassengerModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({messag: "passenger updated successfully"});

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

// route that updates the document with selected flightNumber 
app.put("/admin-flights/:id",isAuthenticated ,async function(req,res){
    
    const updatedFlight = await flightModel.findIdAndUpdate(
        req.params.id,
        {returnDocument:"after"}
    );
    res.json(updatedFlight);
})

// updates airlines
app.put("/admin-airlines/:id",isAuthenticated, async function(req,res){

    const airline = await airlineModel.findByIdAndUpdate(
        req.params.id, { $set: req.body}, { returnDocument: "after"}
    );
    res.json(airline);
})

app.put("/admin-cities/:id",isAuthenticated, async function(req,res){
    const city = await cityModel.findByIdAndUpdate(
        req.params.id, { $set: req.body},  {returnDocument:"after"}
    );
    res.json(city);
})

app.put("/admin-reservations/passenger/:passengerId/status", isAuthenticated, async function(req, res){
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
        passenger.status = normalizedStatus;
        await booking.save();

        res.status(200).json({ message: "passenger status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/reservations/passenger/:passengerId/status", isAuthenticated, async function(req, res){
    try {
        const { status } = req.body;

        if (status !== "Cancelled") {
            return res.status(400).json({ message: "Users may only cancel a reservation." });
        }

        const booking = await bookingModel.findOne({ "passengers._id": req.params.passengerId });
        if (!booking) {
            return res.status(404).json({ message: "Passenger not found" });
        }

        if (booking.belongsToUser !== req.session.userID) {
            return res.status(403).json({ message: "You do not have permission to modify this reservation." });
        }

        const passenger = booking.passengers.id(req.params.passengerId);
        passenger.status = status;
        await booking.save();

        res.status(200).json({ message: "passenger status updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//====================================DELETE FUNCTIONS=====================
app.delete("/saved-passengers/delete/:id", isAuthenticated, async function (req, res){
    try {
        await savedPassengerModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "passenger deleted successfully" });
    } catch (err){
        res.status(500).json({ error: err.message });
    }
});

app.delete("/delete-payment/:cardId",isAuthenticated, async function(req,res){
    try{
        const user = await userModel.findById(req.session.userID);


        user.paymentMethods.pull({_id: req.params.cardId});

        await user.save();

        return res.status(200).json({ message: "Payment method removed successfully." });
    }catch(err){
        console.error(" BACKEND ERROR: CARD DELETION: ", err);
        return res.status(500).json({ error: err.message });
    }
})


//=================PATCH FUNCTIONS============================

app.patch("/update-preferences",isAuthenticated, async function(req,res){
    try{

        var user = await userModel.findById(req.session.userID);

        if (!user) {
            return res.status(404).json({ message: "User session profile not found." });
        }

        if (req.body.flightStatusNotification !== undefined) {
            user.preferences.flightStatusNotifications = req.body.flightStatusNotification;
        }
        if (req.body.marketingNotification !== undefined) {
            user.preferences.marketingNotifications = req.body.marketingNotification;
        }

        await user.save();
        return res.status(200).json({ message: "preferences updated successfully." });
    }catch(err){
        console.error("BACKEND ERROR: ACC PREFERENCE: ",err);
        return res.status(500).json({ error: err.message });
    }
})

// soft deletes flight
app.patch("/admin-flights/:id/deactivate", isAuthenticated, async function(req,res){

    try{
            
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
        return res.status(200).json({
            message: "Flight canncelled successfully."
        });

    }catch(err){
        return res.status(500).json({
            error:err.message
        });
    }

});
app.patch("/admin-airlines/:id/deactivate", isAuthenticated, async function(req,res){
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

//==========================READ OPERATIIONS=============================

app.get("/reservations-data", isAuthenticated, async function(req, res){
    try{
        var reservations = await bookingModel.find({
            belongsToUser: req.session.userID
        }).populate('flight').lean();

        return res.status(200).json(reservations);
    }catch(err){
        console.error("Error fetching reservations:", err);
        return res.status(500).json({ message: "server error fetching reservations." });
    }
});

app.get("/admin-reservations-data", isAuthenticated, async function(req, res){
    try{
        var reservations = await bookingModel.find({}).populate('flight').lean();
        return res.status(200).json(reservations);
    }catch(err){
        console.error("Error fetching all reservations:", err);
        return res.status(500).json({ message: "server error fetching reservations." });
    }
});

app.listen(port, () =>{
    console.log("Server now listening on port " + port);
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.isLoggedIn && req.session.userID) {
        return next(); // session is valid. proceed to next  route
    }
    
    // session is invalid or doesn't exist
    res.redirect('/login');
}

//========================== FLIGHT BOOKING =============================

app.post("/booking", isAuthenticated, async function(req, res) {
    try {
        const { flightId, cabinType, totalPrice, passengers } = req.body;

        const flight = await flightModel.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: "Flight not found" });
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
        return res.status(201).json({ message: "Booking saved successfully" });
    } catch(err) {
        console.error("Booking error: ", err);
        return res.status(500).json({ error: err.message });
    }
});