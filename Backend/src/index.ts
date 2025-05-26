import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tournamentRoutes from './routes/TournamentRoutes';
import matchupRoutes from './routes/matchup.routes';
import trackRoutes from './routes/track.routes';
import debugRoutes from './routes/debug.routes';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Use an env var for frontend URL in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/matchups', matchupRoutes);
  app.use('/api/tracks', trackRoutes);

  // Conditional Debug routes - ensure DEBUG_ROUTES env var is set to 'true' to enable
  if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_ROUTES === 'true') {
    app.use('/api/debug', debugRoutes);
  }
} catch (error) {
  console.error('Error applying API routes:', error);
  // This catch might not effectively catch errors from app.use if a module is undefined,
  // as that error happens at module load time or when Express tries to invoke it.
}

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Global error handler (optional, but good practice)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).send('Something broke!');
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access it at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit process with failure code
  }
};

// Initialize server start
startServer();

export default app; // Optional: export app for testing or other purposes 