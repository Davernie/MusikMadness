const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log('📁 Multer received file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    cb(null, true);
  }
});

// Simple auth middleware for testing
const simpleAuth = (req, res, next) => {
  console.log('🔑 Auth check - Authorization header:', req.header('Authorization') ? 'Present' : 'Missing');
  req.user = { userId: 'test-user-id' }; // Mock user for testing
  next();
};

// Debug endpoints
app.post('/api/users/profile-picture', 
  simpleAuth,
  (req, res, next) => {
    console.log('🚀 Profile picture endpoint hit');
    console.log('📋 Headers:', req.headers);
    next();
  },
  upload.single('profileImage'),
  (req, res) => {
    console.log('✅ Profile picture upload successful');
    console.log('📁 File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size
    } : 'No file');
    
    res.json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: 'http://localhost:3001/test-profile-image.jpg'
    });
  }
);

app.post('/api/users/cover-image', 
  simpleAuth,
  (req, res, next) => {
    console.log('🚀 Cover image endpoint hit');
    console.log('📋 Headers:', req.headers);
    next();
  },
  upload.single('coverImage'),
  (req, res) => {
    console.log('✅ Cover image upload successful');
    console.log('📁 File:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size
    } : 'No file');
    
    res.json({
      message: 'Cover image uploaded successfully',
      coverImageUrl: 'http://localhost:3001/test-cover-image.jpg'
    });
  }
);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: `Unexpected field: ${error.field}. Expected field names are 'profileImage' or 'coverImage'`,
        error: error.message,
        code: error.code,
        field: error.field
      });
    }
  }
  res.status(500).json({ message: error.message });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔧 Debug server running on http://localhost:${PORT}`);
  console.log('🎯 Test endpoints:');
  console.log('   POST http://localhost:3001/api/users/profile-picture');
  console.log('   POST http://localhost:3001/api/users/cover-image');
  console.log('💡 Expected field names: profileImage, coverImage');
});
