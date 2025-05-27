const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user (Admin only)
router.post('/', protect, authorize(['admin']), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: role || 'player' });
    await newUser.save();
    // Emit a socket event for new user creation
    req.app.get('io').emit('userUpdate', newUser.toObject()); // Send new user data
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only, or user updating their own profile)
router.put('/:id', protect, authorize(['admin']), async (req, res) => {
  const { username, password, role } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin can update any user, user can only update their own profile
    if (req.userRole !== 'admin' && req.userId.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    // Only admin can change roles
    if (role && req.userRole === 'admin') user.role = role;

    await user.save();
    // Emit a socket event for user update (e.g., role change)
    req.app.get('io').emit('userUpdate', user.toObject());
    res.json({ message: 'User updated successfully', user: user.toObject() });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Emit a socket event for user deletion
    req.app.get('io').emit('userDeleted', req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user (Admin only)
router.put('/:id/block', protect, authorize(['admin']), async (req, res) => {
  const { isBlocked } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBlocked = isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user: user.toObject() });
  } catch (error) {
    console.error('Block/Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rankings (sorted by bananaCount, accessible by authenticated users)
router.get('/rankings', protect, async (req, res) => {
  try {
    const rankings = await User.find({ role: 'player' }) // Only show players in rankings
      .sort({ bananaCount: -1 }) 
      .select('username bananaCount _id')
      .limit(100);
    res.json(rankings);
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single user by ID (Admin or the user themselves)
router.get('/:id', protect, authorize(['admin', "player"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Allow admin to view any user, or a user to view their own profile
    if (req.userRole === 'admin' || req.userId.toString() === req.params.id) {
      res.json(user);
    } else {
      res.status(403).json({ message: 'Forbidden: You can only view your own profile.' });
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;