import Product from '../models/Product.js';

const calculatePrice = (product, userType) => 
  userType === 'wholesale' 
    ? product.wholesalePrice 
    : product.productPrice * (1 - (product.productOffer / 100));

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      productImages: req.imageUrls || []
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    const response = products.map(product => ({
      ...product.toObject(),
      currentPrice: calculatePrice(product, req.userType)
    }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const response = {
      ...product.toObject(),
      currentPrice: calculatePrice(product, req.userType)
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        ...(req.imageUrls && { productImages: [...req.body.productImages, ...req.imageUrls] })
      },
      { new: true, runValidators: true }
    );
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};