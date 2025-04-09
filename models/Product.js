import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  productPrice: { type: Number, required: true, min: 0 },
  wholesalePrice: { type: Number, required: true, min: 0 },
  productOffer: { type: Number, default: 0, min: 0, max: 100 },
  productAvailability: { type: Boolean, default: true },
  productDescription: { type: String, required: true, trim: true },
  productImages: [{ type: String, required: true }],
}, { timestamps: true });

const Product = mongoose.model('Product', schema);
export default Product;