const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/courses', require('./routes/Courses'));
app.use('/api/routine', require('./routes/routine'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/dashboard', require('./routes/dashboard'));


// Add these after other routes
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notices', require('./routes/notices'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Initialize scheduler
const schedulerService = require('./services/schedulerService');
schedulerService.initialize();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));