const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const emailScheduler = require('./services/emailScheduler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  // Disable content security policy for tracking pixel
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/password'));
app.use('/api/flows', require('./routes/flows'));
app.use('/api/flows', require('./routes/flowSteps'));
app.use('/api/flows', require('./routes/contacts'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/automations', require('./routes/automations'));

// Public tracking routes - these don't use the /api prefix and don't require authentication
app.use('/tracking', require('./routes/tracking'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Driftly API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start email scheduler
emailScheduler.start();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
