const mongoose = require('mongoose');

const travelHistory = new mongoose.Schema({
    belongs_to_user:{type: String},
    origin:{ type: String, required: true, trim: true},
    destination:{ type: String, required: true, trim: true},
    date:{ type: String, trim: true},
    airline:{ type: String, required: true, trim: true},
    cabinType:{ type: String, required: true, trim: true},
    price:{ type: Number, required: true, trim: true},
    flightID:{ type: String, required: true, trim: true},
    seat:{ type: String, required: true, trim: true},
    bookingRef:{ type: String, required: true, trim: true},
  
},{ collection: 'travelHistory' }
)

module.exports  = mongoose.model('travelHistory',travelHistory);