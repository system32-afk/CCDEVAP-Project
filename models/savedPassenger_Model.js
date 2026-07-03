const mongoose = require('mongoose');

const savedPassengers = new mongoose.Schema({
    belongs_to_user:{type: String},
    Fname:{ type: String, required: true, trim: true},
    Lname:{ type: String, required: true, trim: true},
    MI:{ type: String, trim: true},
    DOB:{ type: String, required: true, trim: true},
    mobileNum:{ type: String, required: true, trim: true},
    nationality:{ type: String, required: true, trim: true},
    emailAddress:{ type: String, required: true, trim: true},
    sex:{ type: String, required: true, trim: true},
    nationality:{ type: String, required: true, trim: true},
  
},{ collection: 'savedPassengers' }
)

module.exports  = mongoose.model('savedPassengers',savedPassengers);