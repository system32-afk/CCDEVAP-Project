const mongoose = require('mongoose');


const citySchema = new mongoose.Schema({
    cityName: {type: String, required: true, unique: true, trim:true},
});

const City = mongoose.model('cities', citySchema);


// City.create({
//     "cityName": "Seoul"
// });
module.exports = City;