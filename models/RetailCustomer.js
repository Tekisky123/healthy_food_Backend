import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema({
  userName: { type: String, required: true, trim: true },
  userEmail: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  userMobileNumber: { type: String, required: true, trim: true },
  userPassword: { type: String, required: true, minlength: 6 },
  userAddress: { type: String, required: true, trim: true },
}, { 
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.userPassword;
      delete ret.__v;
    }
  }
});

schema.pre('save', async function(next) {
  if (!this.isModified('userPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.userPassword = await bcrypt.hash(this.userPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

schema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.userPassword);
};

// Add this method to control what data is returned when converting to JSON
schema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.userPassword;
  delete userObject.__v;
  return userObject;
};

const RetailCustomer = mongoose.model('RetailCustomer', schema);
export default RetailCustomer;