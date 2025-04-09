import Order from '../models/Order.js';
import Product from '../models/Product.js';

const calculateItemPrice = (product, isWholesale) =>
  isWholesale ? product.wholesalePrice : product.productPrice;

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    if (!items?.length) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (!product.productAvailability) {
        return res.status(400).json({ error: `Product unavailable: ${product.productName}` });
      }

      const isWholesale = req.userType === 'wholesale';
      const price = calculateItemPrice(product, isWholesale);
      totalAmount += price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: price,
        isWholesale,
      });
    }

    const order = await Order.create({
      [req.userType === 'retail' ? 'user' : 'client']: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || req.user.userAddress || req.user.clientAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const query = req.userType === 'retail' 
      ? { user: req.user._id } 
      : { client: req.user._id };
    
    const orders = await Order.find(query)
      .populate('items.product', 'productName productImages');
      
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'productName productPrice productImages');
      
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const isOwner = req.userType === 'retail' 
      ? order.user.equals(req.user._id)
      : order.client.equals(req.user._id);
      
    if (!isOwner) return res.status(403).json({ error: 'Unauthorized' });
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};