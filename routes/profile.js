const express = require('express');
const router = express.Router();
const userModel = require('../models/user_model.js');
const savedPassengerModel = require('../models/savedPassenger_Model.js');
const travelHistoryModel = require('../models/TravelHistory_model.js');
const {isAuthenticated,isUser} = require('../middleware/auth.js');

//TODO: ADD /Profile TO AJAX REFERENCES

router.get('/', isAuthenticated ,isUser, async function(req,res){
    var user = await userModel.findById(req.session.userID).lean();
    var savedPassenger = await savedPassengerModel.find({belong_to_user:req.session.userID})
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

router.get("/saved-passengers",isAuthenticated, isUser, async function(req,res) {
    try{

        var passengers = await savedPassengerModel.find({
            belongs_to_user: req.session.userID
        });

        return res.status(200).json(passengers);
    }catch(error){
        console.error("error fetching saved passengers:", error);
        return res.status(500).json({ message: "server error fetching passengers." });
    }
})


router.get("/saved-passengers/edit/:id", isAuthenticated, async function(req,res){
    try{
        var passenger = await savedPassengerModel.findById(req.params.id);
        res.status(200).json(passenger);
    }catch(err){
        res.status(500).json({ error: err.message});
    }
})

router.get("/paymentMethods", isAuthenticated,isUser, async function(req,res){
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

router.get("/travel-history", isAuthenticated,isUser, async function(req,res) {
    try{
        var history = await travelHistoryModel.find({belongs_to_user: req.session.userID});

        if(!history){
            return res.status(404).json({message: "Travel history not found!"});
        }

        return res.status(200).json(history);
    }catch(error){

    }
})






//==========POST METHODS==========

router.post("/saved-passengers/add", isAuthenticated, async function (req, res) {
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


router.post("/add-payment",isAuthenticated,async function(req,res){
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


router.put("/update", isAuthenticated, async function(req,res){
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

router.put("/saved-passengers/update/:id",isAuthenticated, async function(req,res){
    try{
        await savedPassengerModel.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({messag: "passenger updated successfully"});

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

//====================================DELETE FUNCTIONS=====================
router.delete("/saved-passengers/delete/:id", isAuthenticated, async function (req, res){
    try {
        await savedPassengerModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "passenger deleted successfully" });
    } catch (err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/delete-payment/:cardId",isAuthenticated, async function(req,res){
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

router.patch("/update-preferences",isAuthenticated, async function(req,res){
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
module.exports = router;