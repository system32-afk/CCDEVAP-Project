//FILE FOR USER COLLECTION
const mongoose = require('mongoose');
const bcrypt  = require('bcryptjs')

const paymentMethodSchema = new mongoose.Schema({
    cardHolder:{type: String, required: true, trim: true},
    expDate:{type: String, required: true, trim: true},
    cvv:{type: String, required: true, trim: true},
    cardNumber:{type: String, required: true, trim: true},
    network:{type: String, required: true, trim: true},
    
})

const userSchema = new mongoose.Schema({
    Fname:{ type: String, required: true, trim: true},
    Lname:{ type: String, required: true, trim: true},
    MI:{ type: String, trim: true},
    DOB:{ type: String, required: true, trim: true},
    MobileNum:{ type: String, required: true, trim: true},
    nationality:{ type: String, required: true, trim: true},
    emailAddress:{ type: String, required: true, trim: true},
    sex:{ type: String, required: true, trim: true},
    password:{type:String, required:true},
    preferences: {
        flightStatusNotifications: { 
            type: Boolean, 
            default: true
        },
        marketingNotifications: { 
            type: Boolean, 
            default: false 
        }},
        role:{type: String,enum:["customer", "admin"], default:"customer"},
    paymentMethods:[paymentMethodSchema]
},
{ collection: 'users' }
)


userSchema.pre('save', async function () {
  
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports  = mongoose.model('users',userSchema);