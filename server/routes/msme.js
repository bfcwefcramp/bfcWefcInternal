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

        // Handle expertName array -> string
        if (Array.isArray(msmeData.expertName)) {
            msmeData.expertName = msmeData.expertName.join(', ');
        }

        // Handle photos
        if (req.files) {
            msmeData.photos = req.files.map(file => `/uploads/${file.filename}`).join(',');
        }

        const newMSME = new MSME(msmeData);
        const savedMSME = await newMSME.save();
        res.status(201).json(savedMSME);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET: Get all MSME records with Filtering
router.get('/', async (req, res) => {
    try {
        const { area, sector, enterpriseType, status, search, startDate, endDate } = req.query;
        let query = {};

        if (area) query.area = area;
        if (sector) query.sector = sector;
        if (status) query.status = status;
        if (enterpriseType) query.enterpriseType = enterpriseType;

        if (startDate || endDate) {
            query.dateOfVisit = {};
            if (startDate) query.dateOfVisit.$gte = new Date(startDate);
            if (endDate) query.dateOfVisit.$lte = new Date(endDate);
        }

        // Simple search on business name or visitor name
        if (search) {
            query.$or = [
                { businessName: { $regex: search, $options: 'i' } },
                { visitorName: { $regex: search, $options: 'i' } }
            ];
        }

        const msmes = await MSME.find(query).sort({ dateOfVisit: -1 });
        res.json(msmes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Stats for dashboard (Enhanced)
router.get('/stats', async (req, res) => {
    try {
        const total = await MSME.countDocuments();
        const resolved = await MSME.countDocuments({ status: { $regex: 'Resolved', $options: 'i' } }); // Case insensitive check
        const pending = await MSME.countDocuments({ status: { $regex: 'Pending', $options: 'i' } });

        // Area Stats
        const northGoa = await MSME.countDocuments({ area: 'North Goa' });
        const southGoa = await MSME.countDocuments({ area: 'South Goa' });
        const unknownArea = await MSME.countDocuments({ area: 'Unknown' });

        // Sector Stats (Custom Logic for Overlap)
        const manufacturing = await MSME.countDocuments({ sector: { $regex: 'Manufacturing', $options: 'i' } });
        const service = await MSME.countDocuments({ sector: { $regex: 'Service', $options: 'i' } });
        const trading = await MSME.countDocuments({
            $or: [
                { sector: { $regex: 'Trading', $options: 'i' } },
                { sector: { $regex: 'Retail', $options: 'i' } }
            ]
        });

        // Others: Not Manuf, Service, or Trading
        const others = await MSME.countDocuments({
            $and: [
                { sector: { $not: { $regex: 'Manufacturing', $options: 'i' } } },
                { sector: { $not: { $regex: 'Service', $options: 'i' } } },
                { sector: { $not: { $regex: 'Trading', $options: 'i' } } },
                { sector: { $not: { $regex: 'Retail', $options: 'i' } } }
            ]
        });

        const sectorStats = [
            { name: 'Manufacturing', value: manufacturing },
            { name: 'Service', value: service },
            { name: 'Trading', value: trading },
            { name: 'Others', value: others }
        ];

        // Raw Sector Stats (As per user request for Dashboard Bar Chart)
        const sectorRawAggregation = await MSME.aggregate([
            { $group: { _id: "$sector", count: { $sum: 1 } } }
        ]);
        const sectorStatsRaw = sectorRawAggregation.map(s => ({
            name: s._id || 'Unspecified',
            value: s.count
        }));

        res.json({
            total,
            resolved,
            pending,
            area: [
                { name: 'North Goa', value: northGoa },
                { name: 'South Goa', value: southGoa },
                { name: 'Unknown', value: unknownArea } // Optional to show
            ],
            sector: sectorStats,
            sectorRaw: sectorStatsRaw
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

// POST: Upload photos for existing MSME
router.post('/:id/photos', upload.array('photos', 5), async (req, res) => {
    try {
        const msme = await MSME.findById(req.params.id);
        if (!msme) return res.status(404).json({ message: 'MSME not found' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const newPhotos = req.files.map(file => `/uploads/${file.filename}`);

        // Append or Replace? User probably wants to add.
        // If current photos is a string (from Excel), convert to array or comma-sep
        // Actually my schema has photos as String (comma sep?) or Array?
        // Let's check Schema... Schema says photos: { type: String }
        // So I should append to comma separated string.

        let currentPhotos = msme.photos || '';
        const newPhotosStr = newPhotos.join(',');

        if (currentPhotos) {
            msme.photos = `${currentPhotos},${newPhotosStr}`;
        } else {
            msme.photos = newPhotosStr;
        }

        await msme.save();
        res.json(msme);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update MSME details
router.put('/:id', async (req, res) => {
    try {
        const msme = await MSME.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!msme) return res.status(404).json({ message: 'MSME not found' });
        res.json(msme);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Delete a photo
router.delete('/:id/photos', async (req, res) => {
    try {
        const { photoUrl } = req.body;
        const msme = await MSME.findById(req.params.id);
        if (!msme) return res.status(404).json({ message: 'MSME not found' });

        if (!msme.photos) return res.status(400).json({ message: 'No photos to delete' });

        let photos = msme.photos.split(',');
        // Remove the photoUrl
        photos = photos.filter(p => p.trim() !== photoUrl.trim());

        msme.photos = photos.join(',');
        await msme.save();

        // Optional: Delete from filesystem if needed (skipping for now to avoid complexity)

        res.json(msme);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Delete MSME record
router.delete('/:id', async (req, res) => {
    try {
        const msme = await MSME.findByIdAndDelete(req.params.id);
        if (!msme) return res.status(404).json({ message: 'MSME not found' });
        res.json({ message: 'MSME deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
