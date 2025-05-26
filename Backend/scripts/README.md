# Test Data Setup Scripts

This folder contains scripts to generate test data for development and testing purposes.

## Setup Tournament with 64 Users

### Prerequisites

Make sure you have the required dependencies installed in the Backend folder:

```bash
cd Backend
npm install mongodb bcrypt
```

### Usage

1. **Generate 64 test users and create tournament:**
```bash
cd Backend
node scripts/setup-tournament-with-64-users.js
```

2. **Clean up test data:**
```bash
cd Backend
node scripts/setup-tournament-with-64-users.js --cleanup
```

### Configuration

Update the database connection settings in the script:

```javascript
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'musikmadness'; // Update with your actual database name
```

### What the script creates:

#### 64 Test Users
- **Usernames:** `testuser01` through `testuser64`
- **Email:** `testuser1@example.com` through `testuser64@example.com`
- **Password:** `password123` (for all users)
- **Complete user profiles** with bio, stats, socials, etc.
- **First 10 users** are marked as creators (`isCreator: true`)

#### Tournament
- **Name:** "64-Player Music Madness Championship"
- **All 64 users** as participants
- **First user** (`testuser01`) as tournament creator
- **Complete tournament structure** following your database schema

### Test Login Credentials

You can log in with any of these accounts:
- **Username:** `testuser01`, `testuser02`, ..., `testuser64`
- **Password:** `password123`

### Database Structure

The script follows your exact database structure:

**Users:**
- `_id`, `username`, `email`, `password` (hashed)
- `bio`, `location`, `website`
- `genres` (empty array), `socials` object
- `stats` object with tournament statistics
- `isCreator`, `followers`, `following` arrays
- `createdAt`, `updatedAt`, `__v`

**Tournament:**
- `_id`, `name`, `game`, `startDate`, `endDate`
- `maxPlayers`, `description`, `creator`
- `participants` array (all 64 user IDs)
- `status`, `rules`, `language`
- `createdAt`, `updatedAt`, `__v`

### Notes

- The script will update user statistics automatically
- Tournament is set to start tomorrow and run for 2 weeks
- All test data can be easily cleaned up using the `--cleanup` flag
- Profile pictures and cover images are not included (can be added separately if needed)
