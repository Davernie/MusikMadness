const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load .env file
const app = express();

app.use(cors());        // Allow frontend to connect
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error', err));

// Example route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));



//database testing 
const User = require('./models/users');


app.get('/api/users/usern', async (req, res) => {
  try {
    const usern = await User.findOne({ username: "leo123" });

    if (!usern) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log values for testing
    console.log("Password:", usern.password);
    console.log("Role:", usern.role);

    // Send the full user object as JSON
    res.json(usern);

  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).send("Server error");
  }
});


//insertion


username = g3p4


const User = require('./models/users');

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    console.error("❌ Insertion error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

