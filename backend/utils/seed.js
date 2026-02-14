/**
 * Database Seed Script
 * 
 * Creates initial users for the accounting system:
 * - 1 Master Admin
 * - 3 Normal Users (maximum allowed)
 * 
 * Usage: npm run seed
 * Or: node utils/seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');

// Seed data
const seedData = {
  masterAdmin: {
    name: 'Master Administrator',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'master_admin',
    isActive: true
  },
  users: [
    {
      name: 'John Doe',
      email: 'user1@example.com',
      password: 'user123',
      role: 'user',
      isActive: true
    },
    {
      name: 'Jane Smith',
      email: 'user2@example.com',
      password: 'user123',
      role: 'user',
      isActive: true
    },
    {
      name: 'Bob Johnson',
      email: 'user3@example.com',
      password: 'user123',
      role: 'user',
      isActive: true
    }
  ]
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Clear existing users
 */
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    console.log('Cleared existing users');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  }
};

/**
 * Create Master Admin
 */
const createMasterAdmin = async () => {
  try {
    const admin = await User.create(seedData.masterAdmin);
    console.log('');
    console.log('=== MASTER ADMIN ===');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${seedData.masterAdmin.password}`);
    console.log(`Role: ${admin.role}`);
    return admin;
  } catch (error) {
    console.error('Error creating Master Admin:', error.message);
    throw error;
  }
};

/**
 * Create Normal Users
 */
const createUsers = async () => {
  try {
    console.log('');
    console.log('=== USERS ===');
    
    for (const userData of seedData.users) {
      const user = await User.create(userData);
      console.log(`Created: ${user.name} (${user.email})`);
    }
    
    console.log('');
    console.log(`Created ${seedData.users.length} users successfully`);
  } catch (error) {
    console.error('Error creating users:', error.message);
    throw error;
  }
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
  try {
    console.log('========================================');
    console.log('  ACCOUNTING SYSTEM - DATABASE SEED');
    console.log('========================================');
    console.log('');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    
    // Create Master Admin
    await createMasterAdmin();
    
    // Create Users
    await createUsers();
    
    console.log('');
    console.log('========================================');
    console.log('  SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('');
    console.log('Login Credentials:');
    console.log('  Master Admin: admin@example.com / admin123');
    console.log('  User 1: user1@example.com / user123');
    console.log('  User 2: user2@example.com / user123');
    console.log('  User 3: user3@example.com / user123');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
