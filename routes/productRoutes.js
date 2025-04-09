import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { upload, processImages } from '../middleware/upload.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, upload.array('images', 5), processImages, createProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.patch('/:id', auth, upload.array('images', 5), processImages, updateProduct);
router.delete('/:id', auth, deleteProduct);

export default router;