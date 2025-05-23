# MusikMadness Backend

This is the backend API for the MusikMadness application, a music tournament platform where users can create and participate in bracket-style tournaments to determine their favorite songs.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/musikmadness
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user profile by ID
- `PUT /api/users/profile` - Update user profile

### Tournaments
- `POST /api/tournaments` - Create a new tournament
- `GET /api/tournaments` - Get all tournaments (paginated)
- `GET /api/tournaments/:id` - Get tournament by ID
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/:id/tracks` - Add tracks to tournament

### Matchups
- `POST /api/matchups/tournaments/:tournamentId` - Create matchups for a tournament
- `GET /api/matchups/tournaments/:tournamentId` - Get all matchups for a tournament
- `GET /api/matchups/:id` - Get matchup by ID
- `POST /api/matchups/:id/vote` - Vote on a matchup
- `POST /api/matchups/tournaments/:tournamentId/rounds/:round/complete` - Complete a round

### Tracks
- `POST /api/tracks` - Create a new track
- `GET /api/tracks` - Get all tracks (paginated)
- `GET /api/tracks/:id` - Get track by ID
- `PUT /api/tracks/:id` - Update track
- `DELETE /api/tracks/:id` - Delete track

## Project Structure

```
Backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
``` 