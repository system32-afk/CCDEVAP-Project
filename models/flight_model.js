//FILE FOR USER COLLECTION
const mongoose = require('mongoose');


const cabinSchema = new mongoose.Schema({
    economy:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true,min:60, max:60},
        label:{type: String, default: 'Economy'}
        },
    premium_economy:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:60, max:60},
        label:{type: String, default: 'Premium Economy'}       
    },
    business_class:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:0},
        label:{type: String, default: 'Business Class'}
    },
    first_class:{
        price:{type: Number, required: true, min:0},
        seats:{type: Number, required: true, min:60, max:60},
        label:{type: String, default: 'First Class'}
    }
        
});

const flightSchema = new mongoose.Schema({
    flightNumber:{type: Number, required: true, min: 0},
    airline:{type: String, required: true, trim:true},
    origin:{type: String , required: true, trim: true},
    destination:{type: String, required: true, trim: true},
    departureDate:{type: Date, required: true},
    departureTime:{type: String, required: true, trim: true},
    arrivalDate:{type: Date, required: true},
    arrivalTime:{type: String, required: true, trim: true},
    cabin:{type: cabinSchema, required: true},
    logoName:{type: String, trim: true, required: true},
    numOfLayovers:{type: Number, required: true},
    isActive:{type: Boolean, required: true}

});


const Flight = mongoose.model('flights', flightSchema);
//     Flight.create({
//    "flightNumber": 6789,
//     "airline": "Japan Airlines",
//     "origin": "Manila",
//     "destination": "Tokyo",
//     "departureDate": "2026-07-12",
//     "departureTime": "22:00",
//     "arrivalDate": "2026-07-13",
//     "arrivalTime": "05:00",
//     "cabin": {
//       "economy": {
//         "price": 12000,
//         "seats": 200,
//         "label": "Economy"
//       },
//       "premium_economy": {
//         "price": 20000,
//         "seats": 60,
//         "label": "Premium Economy"
//       },
//       "business_class": {
//         "price": 35000,
//         "seats": 35,
//         "label": "Business Class"
//       },
//       "first_class": {
//         "price": 55000,
//         "seats": 15,
//         "label": "First Class"
//       }
//     },
//     "logoName": "JAL",
//     "numOfLayovers": 0,
//     "isActive": false
// })
module.exports = Flight; 