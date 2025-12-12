const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MSME = require('../models/MSME');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST: Create new MSME record
router.post('/', upload.array('photos', 5), async (req, res) => {
    console.log('POST /api/msme hit');
    try {
        const msmeData = req.body;

        // Handle photos
        if (req.files) {
            msmeData.photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Handle array fields if they come as single strings (Multer/FormData quirk)
        if (msmeData.expertName && !Array.isArray(msmeData.expertName)) {
            msmeData.expertName = [msmeData.expertName];
        }

        const newMSME = new MSME(msmeData);
        const savedMSME = await newMSME.save();
        res.status(201).json(savedMSME);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET: Get all MSME records
router.get('/', async (req, res) => {
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
        const resolved = await MSME.countDocuments({ status: 'Resolved' });
        const pending = await MSME.countDocuments({ status: 'Pending' });

        const manufacturing = await MSME.countDocuments({ sector: 'Manufacturing' });
        const services = await MSME.countDocuments({ sector: 'Service' });
        const retail = await MSME.countDocuments({ sector: 'Retail Trade' });

        res.json({
            total,
            resolved,
            pending,
            breakdown: {
                manufacturing,
                services,
                retail
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get single MSME by ID
router.get('/:id', async (req, res) => {
    try {
        const msme = await MSME.findById(req.params.id);
        if (!msme) return res.status(404).json({ message: 'MSME not found' });
        res.json(msme);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
