import jwt from 'jsonwebtoken';
import RetailCustomer from '../models/RetailCustomer.js';
import WholesaleClient from '../models/WholesaleClient.js';
import 'dotenv/config';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await RetailCustomer.findOne({ _id: decoded._id });
    let userType = 'retail';

    if (!user) {
      user = await WholesaleClient.findOne({ _id: decoded._id });
      userType = 'wholesale';
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    req.token = token;
    req.user = user;
    req.userType = userType;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const retailUser = (req, res, next) => {
  if (req.userType !== 'retail') {
    return res.status(403).json({ error: 'Access denied: Retail customers only' });
  }
  next();
};

export const wholesaleClient = (req, res, next) => {
  if (req.userType !== 'wholesale') {
    return res.status(403).json({ error: 'Access denied: Wholesale clients only' });
  }
  next();
};




 
