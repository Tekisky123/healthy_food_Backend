import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  clientMobileNum: { type: String, required: true, trim: true },
  clientEmail: { 
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
  clientPassword: { type: String, required: true, minlength: 6 },
  clientAddress: { type: String, required: true, trim: true },
}, { 
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.clientPassword;
      delete ret.__v;
    }
  }
});

schema.pre('save', async function(next) {
  if (!this.isModified('clientPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.clientPassword = await bcrypt.hash(this.clientPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

schema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.clientPassword);
};

// Add this method to control what data is returned when converting to JSON
schema.methods.toJSON = function() {
  const clientObject = this.toObject();
  delete clientObject.clientPassword;
  delete clientObject.__v;
  return clientObject;
};

const WholesaleClient = mongoose.model('WholesaleClient', schema);
export default WholesaleClient;