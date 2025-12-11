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

module.exports = router;
