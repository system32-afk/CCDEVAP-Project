const mongoose = require('mongoose');


const airlineSchema = new mongoose.Schema({
    airlineName: {type: String, required: true, unique: true, trim:true},
    isAirlineActive: {type: Boolean, required: true}
});

const Airline = mongoose.model('airlines', airlineSchema);


// Airline.create({
//     "airlineName": "Air Asia",
//     "isAirlineActive": "true"
// })
module.exports = Airline;