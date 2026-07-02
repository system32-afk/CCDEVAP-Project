const dotenv = require('dotenv');
dotenv.config({path: './credentials.env'});
const session = require('express-session');
const MongoStore = require('connect-mongo');
const express = require('express');
const expresshbs = require('express-handlebars');
const port = process.env.SERVER_port;
const sessionString = process.env.secretString;
const DBuri = process.env.DBuri;
const app = express();


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
        collection: "FLIGHT-MANAGEMENT-SYSTEM"
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

//makes it so whenever the server starts it goes to login immediately
app.get('/', function(req,res){
    res.redirect("/login");
})

app.get('/login', function(req,res){
    res.render("pages/login",{layout:'auth'});
})

app.get('/register', function(req,res){
    res.render("pages/register",{layout:'auth'});
})

app.get('/home', function(req, res) {
    res.render("pages/index", {
        title: "Online Airline Ticketing System",
        pageScripts: `
            <script src="/scripts/sessionStorage.js" defer></script>
            <script src = "/scripts/index_searchFlight.js" defer></script>
            <script src="/scripts/utilities/search_dropdown_script.js" defer></script>
        `
    });
});

app.get('/admin-dashboard', function(req,res){
    res.render('pages/admin-dashboard',{
        title: "Admin Dashboard",
        pageScripts: `
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
        `
    });
});

app.get('/admin-flights', function(req,res){
    res.render('pages/admin-flights',{
        title: "Admin Flights",
        pageScripts: `    
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/admin.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});


app.get('/admin-reservations', function(req,res){
    res.render('pages/admin-reservations',{
        title: "Admin Reservations",
        pageScripts: `
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/admin.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/admin-users', function(req,res){
    res.render('pages/admin-users',{
        title: "Admin Users",
        pageScripts: `
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/booking', function(req,res){
    res.render('pages/booking',{
        title: "Bookings",
        pageScripts: `
            <script src="/scripts/booking.js"></script>    
    `
    });
});

app.get('/profile', function(req,res){
    res.render('pages/profile',{
        title: "Profile",
        pageScripts: `
            <script src="/scripts/utilities/saved_passengers.js" defer></script>
            <script src="/scripts/utilities/user_travel_history.js" defer></script>
            <script src="/scripts/profile.js" defer></script>
            <script src="/scripts/utilities/payment_methods.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
            <script src="/scripts/helper_algorithms.js" defer></script>
            <script src="/scripts/utilities/user_info.js" defer></script>
    `
    });
});

app.get('/reservations', function(req,res){
    res.render('pages/reservations',{
        title: "Reservations",
        pageScripts: `
            <script src="/scripts/reservations.js" defer></script>
            <script src="/scripts/utilities/load_navbar_script.js" defer></script>
    `
    });
});

app.get('/search', function(req,res){
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




app.listen(port, () =>{
    console.log("Server now listening on port " + port);
});