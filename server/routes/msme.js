const express = require('express');
const router = express.Router();
console.log('LOADING MSME ROUTER');
const MSME = require('../models/MSME');

// POST: Create new MSME record
// POST: Create new MSME record
router.post('/', async (req, res) => {
    console.log('POST /api/msme hit');
    try {
        const newMSME = new MSME(req.body);
        const savedMSME = await newMSME.save();
        res.status(201).json(savedMSME);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get all MSME records (with optional filtering later)
// GET: Get all MSME records (with optional filtering later)
router.get('/', async (req, res) => {
    console.log('GET /api/msme hit');
    try {
        const msmes = await MSME.find().sort({ createdAt: -1 });
        res.json(msmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Stats for dashboard
router.get('/stats', async (req, res) => {
    try {
        const total = await MSME.countDocuments();
        const manufacturing = await MSME.countDocuments({ businessType: 'Manufacturing' });
        const services = await MSME.countDocuments({ businessType: 'Services' });
        const trading = await MSME.countDocuments({ businessType: 'Trading' });

        // Aggregation for enquiry types could go here

        res.json({
            total,
            breakdown: {
                manufacturing,
                services,
                trading
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
