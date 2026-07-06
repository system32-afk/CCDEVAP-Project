//FILE FOR USER COLLECTION
const mongoose = require('mongoose');
const { create } = require('./user_model');

const cabinSchema = new mongoose.Schema({
    economy:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:0},
        label:{type: String, default: 'Economy'}
        },
    premium_economy:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:0},
        label:{type: String, default: 'Premium Economy'}       
    },
    business_class:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:0},
        label:{type: String, default: 'Business Class'}
    },
    first_class:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:0},
        label:{type: String, default: 'First Class'}
    }
        
});

const flightSchema = new mongoose.Schema({
    flightNumber:{type: Number, required: true, min: 0},
    airline:{type: String, required: true, trim:true},
    origin:{type: String , required: true, trim: true},
    destination:{type: String, required: true, trim: true},
    departureDate:{type: String, required: true},
    departureTime:{type: String, required: true, trim: true},
    arrivalDate:{type: String, required: true},
    arrivalTime:{type: String, required: true, trim: true},
    cabin:{type: cabinSchema, required: true},
    logoName:{type: String, trim: true, required: true},
    numOfLayovers:{type: Number, required: true}

});


const Flight = mongoose.model('flights', flightSchema);


module.exports = Flight; 