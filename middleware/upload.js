import multer from 'multer';
import { uploadToS3 } from '../config/s3.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter 
});

export const processImages = async (req, res, next) => {
  if (!req.files?.length) return next();
  
  try {
    const uploadPromises = req.files.map(file => uploadToS3(file));
    req.imageUrls = await Promise.all(uploadPromises);
    next();
  } catch (err) {
    next(err);
  }
};