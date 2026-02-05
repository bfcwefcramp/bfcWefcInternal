const express = require('express');
const router = express.Router();
const Expert = require('../models/Expert');

const { protect, authorize } = require('../middleware/authMiddleware');

// POST: Create new Expert (Sudo Admin Only)
router.post('/', protect, authorize('sudo_admin'), async (req, res) => {
    try {
        const newExpert = new Expert(req.body);
        const savedExpert = await newExpert.save();
        res.status(201).json(savedExpert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get all Experts
router.get('/', async (req, res) => {
    try {
        const experts = await Expert.find();
        res.json(experts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update Expert details (Protected: Admin or Owner)
// PUT: Update Expert details (Protected: Sudo Admin, Admin or Owner)
router.put('/:id', protect, async (req, res) => {
    console.log(`PUT /api/experts/${req.params.id} hit by ${req.user.username} (${req.user.role})`);

    // Check ownership or admin status
    // Sudo Admin and Admin can edit.
    if (req.user.role !== 'admin' && req.user.role !== 'sudo_admin') {
        // If not admin/sudo_admin, must be the expert themselves
        if (!req.user.expertId || req.user.expertId.toString() !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }
    }

    try {
        const updatedExpert = await Expert.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExpert) {
            console.log('Expert not found during update');
            return res.status(404).json({ message: 'Expert not found' });
        }
        console.log('Expert updated successfully');
        res.json(updatedExpert);
    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Delete Expert (Protected: Sudo Admin Only)
router.delete('/:id', protect, authorize('sudo_admin'), async (req, res) => {
    console.log(`DELETE /api/experts/${req.params.id} hit by ${req.user.username}`);
    try {
        const deletedExpert = await Expert.findByIdAndDelete(req.params.id);
        if (!deletedExpert) {
            console.log('Expert not found during delete');
            return res.status(404).json({ message: 'Expert not found' });
        }
        console.log('Expert deleted successfully');
        res.json({ message: 'Expert deleted successfully' });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
