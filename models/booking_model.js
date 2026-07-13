const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    bookingReference: { type: String, required: true, unique: true },
    status: { type: String, default: 'Confirmed', enum: ['Confirmed', 'Cancelled'] },
    passengerType: { type: String, required: true, enum: ['adult', 'child', 'infant'] },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    passport: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    birthdate: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    meal: { type: String, trim: true },
    seat: { type: String, trim: true },
    baggage: { type: Number, default: 0 },
    priority: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    lounge: { type: Boolean, default: false },
    price: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
    flightNum: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    airline: { type: String, required: true },
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: Number, required: true },
    belongsToUser: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    passengers: [passengerSchema]
}, { collection: 'bookings' });

module.exports = mongoose.model('bookings', bookingSchema);