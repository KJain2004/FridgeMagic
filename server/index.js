const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const chefRoutes = require('./routes/chef');

const app = express();

const allowedOrigins = ['http://localhost:5173'];
if (process.env.CLIENT_ORIGIN) {
  allowedOrigins.push(new URL(process.env.CLIENT_ORIGIN).origin);
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/chef', chefRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Chef is cooking!' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
