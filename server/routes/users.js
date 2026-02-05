const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all users (Sudo Admin Only)
router.get('/', protect, authorize('sudo_admin'), async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new user (Sudo Admin Only)
router.post('/', protect, authorize('sudo_admin'), async (req, res) => {
    try {
        const { username, password, role, expertId } = req.body;

        // Check fileds
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Please provide username, password and role' });
        }

        // Check existing
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
            expertId: expertId || undefined
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: { username, role, expertId } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Delete user (Sudo Admin Only)
router.delete('/:id', protect, authorize('sudo_admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
