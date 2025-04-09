import jwt from 'jsonwebtoken';
import RetailCustomer from '../models/RetailCustomer.js';
import WholesaleClient from '../models/WholesaleClient.js';
import 'dotenv/config';

// Helper function to generate token
const generateToken = (id) => jwt.sign({ _id: id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register Retail Customer
export const registerRetail = async (req, res) => {
  try {
    const { userName, userEmail, userMobileNumber, userPassword, userAddress } = req.body;
    
    if (await RetailCustomer.findOne({ userEmail })) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const customer = await RetailCustomer.create({
      userName,
      userEmail,
      userMobileNumber,
      userPassword,
      userAddress
    });

    const token = generateToken(customer._id);
    
    res.status(201).json({
      user: {
        id: customer._id,
        name: customer.userName,
        email: customer.userEmail,
        type: 'retail'
      },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Register Wholesale Client
export const registerWholesale = async (req, res) => {
  try {
    const { clientName, clientMobileNum, clientEmail, clientPassword, clientAddress } = req.body;
    
    if (await WholesaleClient.findOne({ clientEmail })) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const client = await WholesaleClient.create({
      clientName,
      clientMobileNum,
      clientEmail,
      clientPassword,
      clientAddress
    });

    const token = generateToken(client._id);
    
    res.status(201).json({
      user: {
        id: client._id,
        name: client.clientName,
        email: client.clientEmail,
        type: 'wholesale'
      },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    let user;
    if (userType === 'retail') {
      user = await RetailCustomer.findOne({ userEmail: email });
    } else if (userType === 'wholesale') {
      user = await WholesaleClient.findOne({ clientEmail: email });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    res.json({
      user: {
        id: user._id,
        name: user.userName || user.clientName,
        email: user.userEmail || user.clientEmail,
        type: userType,
      },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // In a real implementation, you would add the token to a blacklist
    // Here we just return success as JWT is stateless
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User/Client

// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = Object.keys(req.body);
    
//     const allowedUpdates = req.userType === 'retail' 
//       ? ['userName', 'userMobileNumber', 'userAddress', 'userPassword']
//       : ['clientName', 'clientMobileNum', 'clientAddress', 'clientPassword'];
    
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update));
//     if (!isValidOperation) {
//       return res.status(400).json({ error: 'Invalid updates!' });
//     }

//     let userToUpdate;
//     if (req.userType === 'retail') {
//       userToUpdate = await RetailCustomer.findById(id || req.user._id);
//     } else {
//       userToUpdate = await WholesaleClient.findById(id || req.user._id);
//     }

//     if (!userToUpdate) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Apply updates (you can consider resetting all fields if full replacement is needed)
//     updates.forEach(update => {
//       userToUpdate[update] = req.body[update];
//     });

//     await userToUpdate.save();

//     const response = {
//       success: true,
//       user: {
//         id: userToUpdate._id,
//         name: userToUpdate.userName || userToUpdate.clientName,
//         email: userToUpdate.userEmail || userToUpdate.clientEmail,
//         type: req.userType === 'retail' ? 'retail' : 'wholesale'
//       }
//     };

//     res.json(response);
//   } catch (err) {
//     res.status(400).json({ 
//       success: false,
//       error: err.message 
//     });
//   }
// };


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await WholesaleClient.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// Delete User/Client
export const deleteUser = async (req, res) => {
  try {
    if (req.userType === 'retail') {
      await RetailCustomer.findByIdAndDelete(req.user._id);
    } else {
      await WholesaleClient.findByIdAndDelete(req.user._id);
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get User/Client Profile
export const getProfile = async (req, res) => {
  try {
    let user;
    if (req.userType === 'retail') {
      user = await RetailCustomer.findById(req.user._id)
        .select('-userPassword -__v');
    } else {
      user = await WholesaleClient.findById(req.user._id)
        .select('-clientPassword -__v');
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      ...user.toObject(),
      type: req.userType
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get All Retail Users (Admin Only)
export const getAllRetailUsers = async (req, res) => {
  try {
    // Check if admin (you should implement admin role checking)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const users = await RetailCustomer.find({})
      .select('-userPassword -__v')
      .sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Wholesale Clients (Admin Only)
export const getAllWholesaleClients = async (req, res) => {
  try {
    // Check if admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const clients = await WholesaleClient.find({})
      .select('-clientPassword -__v')
      .sort({ createdAt: -1 });

    res.json({
      count: clients.length,
      clients
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};