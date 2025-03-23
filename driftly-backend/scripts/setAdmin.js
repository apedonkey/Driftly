const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const setUserAsAdmin = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Set user as admin
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${email} is now an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting user as admin:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setUserAsAdmin(email); 