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
const savedPassengerModel = require('./models/savedPassenger_model.js');

//DATABASE CONNECTION
const {connectToMongoDB} = require('./conn.js'); 

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
    partialsDir: __dirname + "/views/partials"
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
            <script src="/scripts/DOB_formater_script.js" defer></script>
            
           `});
})

app.get('/home', isAuthenticated, async function(req, res) {
     
    try{
        var currentUser = await userModel.findById(req.session.userID);
        res.render("pages/index", {
        title: "Online Airline Ticketing System",
        pageScripts: `
            <script src="/scripts/sessionStorage.js" defer></script>
            <script src = "/scripts/index_searchFlight.js" defer></script>
            <script src="/scripts/utilities/search_dropdown_script.js" defer></script>
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
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
        `
    });
});

app.get('/admin-flights', isAuthenticated,function(req,res){
    res.render('pages/admin-flights',{
        title: "Admin Flights",
        pageScripts: `    
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/admin.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});


app.get('/admin-reservations', isAuthenticated,function(req,res){
    res.render('pages/admin-reservations',{
        title: "Admin Reservations",
        pageScripts: `
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
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/booking', isAuthenticated,function(req,res){
    res.render('pages/booking',{
        title: "Bookings",
        pageScripts: `
            <script src="/scripts/booking.js"></script>    
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
            <script src="/scripts/utilities/saved_passengers.js" defer></script>
            <script src="/scripts/utilities/user_travel_history.js" defer></script>
            <script src="/scripts/profile.js" defer></script>
            <script src="/scripts/utilities/payment_methods.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
            <script src="/scripts/helper_algorithms.js" defer></script>
            <script src="/scripts/utilities/user_info.js" defer></script>
            <script src="/scripts/DOB_formater_script.js" defer></script>
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





app.get('/reservations', function(req,res){
    res.render('pages/reservations',{
        title: "Reservations",
        pageScripts: `
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/search', isAuthenticated, function(req,res){
    res.render('pages/search',{
        title: "Search", 
        pageScripts: `           
            <script src="/scripts/sessionStorage.js" defer></script>
            <script src="/scripts/search_script.js" defer></script>
            <script src="/scripts/PassengerTypes_script.js" defer></script>
            <script src="/scripts/dropdowns_Script.js" defer></script>
            <script src="/scripts/advanceSearch_scripts.js" defer></script>
            <script src="/scripts/getFlights_script.js" defer></script>
            <script src="/scripts/utilities/search_dropdown_script.js" defer></script>
            <script src="/scripts/utilities/flights_database_script.js" defer></script>
            <script src="/scripts/helper_algorithms.js" defer></script>
            <script src="/scripts/filter_sidebar.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
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



//====================================DELETE FUNCTIONS=====================
app.delete("/saved-passengers/delete/:id", isAuthenticated, async function (req, res){
    try {
        await savedPassengerModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "passenger deleted successfully" });
    } catch (err){
        res.status(500).json({ error: err.message });
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