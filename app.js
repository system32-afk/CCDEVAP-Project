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



const flightModel = require('./models/flight_model.js');
const airlineModel = require('./models/airline_model.js');
const cityModel = require('./models/city_model.js');
const bookingModel = require('./models/booking_model.js');
const userModel = require('./models/user_model.js');
const savedPassengerModel = require('./models/savedPassenger_Model.js');
const travelHistoryModel = require('./models/TravelHistory_model.js');


const profileRouter = require('./routes/profile.js');
const searchRouter = require('./routes/search.js');
const adminRouter = require('./routes/admin.js');
const bookingRouter = require('./routes/booking.js');
const reservationRouter = require('./routes/reservations.js');
const apiRouter = require('./routes/APIs.js');

const AuditLog = require('./models/AuditLog');

const {isAuthenticated,isUser} = require('./middleware/auth.js');
//DATABASE CONNECTION
const {connectToMongoDB} = require('./conn.js'); 
const { ReturnDocument } = require('mongodb');
const e = require('express');

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


//router
app.use('/profile',profileRouter);
app.use('/search',searchRouter);
app.use('/admin',adminRouter);
app.use('/booking',bookingRouter);
app.use('/api',apiRouter);
app.use('/reservations',reservationRouter);



// makes it so whenever the server starts it goes to login immediately
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

app.get('/home', isAuthenticated, isUser, async function(req, res) {
    
    try{
        var currentUser = await userModel.findById(req.session.userID);
        res.render("pages/index", {
        title: "Online Airline Ticketing System",
        isAdmin: req.session.role === "admin",
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

app.post('/logout', isAuthenticated, async function(req, res) {
    try {
        
        const actor = req.session.email || 'Unknown';
        const userRole = req.session.role || 'User';

       
        await AuditLog.create({
            actor: actor,
            action: 'USER LOGGED OUT',
            user_role: userRole,
        });

        
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.redirect('/home');
            }

            res.clearCookie('connect.sid'); // Clears the browser session cookie
            return res.redirect('/login');
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.redirect('/home');
    }
});



//=========================POST FUNCTIONS=============================================
app.post("/register",async  function(req,res){
    
    try{
    const {Fname,Lname,MI,DOB,MobileNum,nationality,sex,password,emailAddress} =  req.body; 

    let user = await userModel.findOne({emailAddress});

    //if user already exist don't register
    if(user){
        return res.redirect('/register');
    }


    user = new userModel({
        Fname,
        Lname,
        MI,
        DOB,
        MobileNum,
        nationality,
        sex,
        password,
        emailAddress});
    
    await user.save();
    
    
    await AuditLog.create({
        actor:user.emailAddress,
        action:"USER REGISTERED",
        user_role: user.role
    })

    
    res.redirect('/login');
    }catch(error){
        console.log("Registeration error:", error);
        res.redirect('/register');
    }
});


app.post("/login", async function(req,res){
    try{
    const{emailAddress, password} = req.body;

    const  user = await userModel.findOne({emailAddress});
    if(!user){
        return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);

     await AuditLog.create({
        actor: user ? user.emailAddress : 'unknown',
        action: isMatch ? 'LOGIN SUCCESS' : 'LOGIN FAILED',
        user_role: user ? user.role : 'unknown',
    })
    if(!isMatch){
        console.log("wrong password");
        return res.redirect("/login");
    }

    req.session.userID = user._id;
    req.session.isLoggedIn = true;
    req.session.role = user.role;
    req.session.email = user.emailAddress;
    
    req.session.save((err) => {
        if(err){
            console.log("Session save error:", err);
            return res.status(500).redirect("/login");
        } else{
            if(user.role === "admin"){
                res.redirect("/admin");
        
        }else{
            res.redirect("/home");
        }
        }
    })
    }catch(error){
        return res.status(500).redirect("/login");
    }
});


app.listen(port, () =>{
    console.log("Server now listening on port " + port);
});


module.exports = app;
