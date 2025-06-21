const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: { 
    type: String,
    required: true,
 },
    lastname: {
    type: String,
    required: true,
},

  email: { 
    type: String,
    required: true,
    unique: true },

  password: {
    type: String,
    required: true 
  },
  confirmPassword: {
    type: String,
    required: true 
  },
  phone: {
    type: String,
    required: false 
 },

userType: {   
  type: String,
  enum: ['admin', 'user'],
  default: 'user' 
},
isAdmin: {
  type: Boolean, 
  default: false 
},
isActive: {
  type: Boolean,
  default: true
}

}, {
    timestamps: true
});


const User = mongoose.model('User', UserSchema);
module.exports = User;

