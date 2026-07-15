const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    passengerType: { type: String, required: true, enum: ['adult', 'child', 'infant'] },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
    passport: { type: String, trim: true },
    nationality: { type: String, required: true, trim: true },
    birthdate: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    emergencyContact: { type: String, trim: true },
    meal: { type: String, trim: true },
    seat: { type: String, trim: true },
    baggage: { type: Number, default: 0 },
    priority: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    lounge: { type: Boolean, default: false }
});

const bookingSchema = new mongoose.Schema({
    bookingReference: { type: String, required: true, unique: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'flights', required: true },
    cabinType: { type: String, required: true },
    status: { type: String, default: 'Confirmed', enum: ['Confirmed', 'Cancelled'] },
    belongsToUser: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    passengers: [passengerSchema]
}, { collection: 'bookings' });

module.exports = mongoose.model('bookings', bookingSchema);