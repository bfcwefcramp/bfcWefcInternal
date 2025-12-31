const express = require('express');
const router = express.Router();
const Expert = require('../models/Expert');

// POST: Create new Expert
router.post('/', async (req, res) => {
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

// PUT: Update Expert details
router.put('/:id', async (req, res) => {
    console.log(`PUT /api/experts/${req.params.id} hit`);
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

// DELETE: Delete Expert
router.delete('/:id', async (req, res) => {
    console.log(`DELETE /api/experts/${req.params.id} hit`);
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
