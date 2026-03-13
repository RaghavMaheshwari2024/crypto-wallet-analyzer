// src/index.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import walletRoutes from './routes/wallet.routes.js';

dotenv.config();

const app = express();

// Middleware to read JSON body

app.use(express.json());

// Routes

app.use('/api/wallet', walletRoutes);

// MongoDB connection
const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI is not set. Skipping MongoDB connection.');
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
    console.log('Server is running on port', PORT);
});                                                         