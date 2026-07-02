//FILE FOR USER COLLECTION
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Fname:{ type: String, required: true, trim: true},
    Lname:{ type: String, required: true, trim: true},
    MI:{ type: CharacterData, required: true, trim: true},
    DOB:{ type: String, required: true, trim: true},
    MobileNum:{ type: String, required: true, trim: true},
    nationality:{ type: String, required: true, trim: true},
    emailAddress:{ type: String, required: true, trim: true},
    sex:{ type: String, required: true, trim: true},
    nationality:{ type: String, required: true, trim: true},
    paymentMethods:[paymentMethodSchema]
})

const paymentMethodSchema = new mongoose.Schema({
    cardHolder:{type: String, required: true, trim: true},
    expDate:{type: String, required: true, trim: true},
    cvv:{type: String, required: true, trim: true},
    cardNumber:{type: String, required: true, trim: true},
    network:{type: String, required: true, trim: true},
})

async function getUserByID(userID) {
    return await db.collection("users").find({user_id:userID}).toArray();
}

async function createUser(params) {
    
}
