import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Load environment variables first
dotenv.config();

// Import R2 logging utility
import { logR2Status, isR2Configured } from './config/r2';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tournamentRoutes from './routes/tournamentRoutes';
import matchupRoutes from './routes/matchup.routes';
import trackRoutes from './routes/track.routes';
import debugRoutes from './routes/debug.routes';
import submissionRoutes from './routes/submissionRoutes';

// Initialize express app
const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

const productionOrigins = [
  'https://musikmadnessfrontend.onrender.com',
  'https://musikmadness-frontend.onrender.com', // Keep old one for safety
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
];

app.use(cors({
  origin: NODE_ENV === 'development' ? allowedOrigins : productionOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '60mb' })); // Increase limit for large audio files
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Use morgan only in development for cleaner production logs
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/matchups', matchupRoutes);
  app.use('/api/tracks', trackRoutes);
  app.use('/api/submissions', submissionRoutes);

  // Conditional Debug routes - ensure DEBUG_ROUTES env var is set to 'true' to enable
  if (NODE_ENV !== 'production' && process.env.DEBUG_ROUTES === 'true') {
    app.use('/api/debug', debugRoutes);
  }
} catch (error) {
  console.error('Error applying API routes:', error);
}

// Serve static files from the React app build directory
const frontendDistPath = path.join(__dirname, '../../Frontend/dist');
app.use(express.static(frontendDistPath));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Musikmadness backend is running' });
});

// Enhanced health check route
app.get('/health', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: NODE_ENV,
    r2Configured: isR2Configured,
    baseUrl,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `${baseUrl}/health`,
      tournaments: `${baseUrl}/api/tournaments`,
      submissions: `${baseUrl}/api/submissions`,
    }
  });
});

// Development route to check R2 status
if (NODE_ENV === 'development') {
  app.get('/dev/r2-status', (req: Request, res: Response) => {
    res.json({
      r2Configured: isR2Configured,
      environment: NODE_ENV,
      envVars: {
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? '✅ Set' : '❌ Missing',
        R2_PUBLIC_URL: process.env.R2_PUBLIC_URL ? '✅ Set' : '⚠️ Optional',
      }
    });
  });
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err.stack);
  
  if (NODE_ENV === 'development') {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Log R2 status for development
    logR2Status();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Access it at http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      
      if (NODE_ENV === 'development') {
        console.log(`🔧 Dev R2 status: http://localhost:${PORT}/dev/r2-status`);
        
        if (!isR2Configured) {
          console.log('\n📝 To enable R2 file storage:');
          console.log('   1. Set up a Cloudflare R2 bucket');
          console.log('   2. Add R2 environment variables to .env file');
          console.log('   3. See Backend/R2_SETUP.md for detailed instructions');
          console.log('   4. Files will be stored locally until R2 is configured\n');
        } else {
          console.log('\n✅ R2 is configured and ready for file uploads!\n');
        }
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Initialize server start
startServer();

export default app; 