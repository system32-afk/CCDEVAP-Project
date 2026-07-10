const mongoose = require('mongoose');


const airlineSchema = new mongoose.Schema({
    airlineName: {type: String, required: true, unique: true, trim:true}
});

const Airline = mongoose.model('airlines', airlineSchema);


Airline.create({
    "airlineName": "Philippine Airlines"
});
module.exports = Airline;