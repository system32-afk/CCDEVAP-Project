const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
{
    belongsToUser: {type: String},
    bookingReference: {type: String, required: true},
    flightNum: {type: String, required: true},
    status: {type: String, enum: ["Confirmed", "Pending", "Cancelled"],default: "Pending"},
    passenger: {type: String, required: true},
    seat: {type: String, required: true, unique: true},
    origin: {type: String, required: true},
    destination: {type: String, required: true},
    airline: {type: String, required: true},
    departureDate: {type: Date, required: true},
    departureTime: {type: String, required: true},
    arrivalTime: {type: String, required: true},
    duration: {type: Number, required: true},
    price: {type: Number, required: true}
},

{
    timestamps: true
}

);

module.exports = mongoose.model("Reservation", reservationSchema);