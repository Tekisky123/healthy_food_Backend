import express from 'express';
import { 
  registerRetail, 
  registerWholesale, 
  login,
  logout,
  updateUser,
  deleteUser,
  getProfile,
  getAllRetailUsers,
  getAllWholesaleClients
} from '../controllers/authController.js';
import { auth, retailUser, wholesaleClient } from '../middleware/auth.js';


const router = express.Router();

// Public routes
router.post('/register/retail', registerRetail);
router.post('/register/wholesale', registerWholesale);
router.post('/login', login);

// Protected routes (require authentication)
// router.post('/logout', auth, logout);
// router.get('/profile', auth, getProfile);
// router.patch('/update', auth, updateUser);
// router.delete('/delete', auth, deleteUser);

router.post('/logout',  logout);
router.get('/profile',  getProfile);
// router.patch('/update/:id', updateUser);
router.put('/retail/update/:id',auth, retailUser ,updateUser);
router.put('/wholesale/update/:id',auth,wholesaleClient, updateUser);

router.delete('/delete',  deleteUser);


// Add these admin routes
// router.get('/admin/retail-users', auth, getAllRetailUsers);
// router.get('/admin/wholesale-clients', auth, getAllWholesaleClients);

export default router;