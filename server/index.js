const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const msmeRoutes = require('./routes/msme');
const expertRoutes = require('./routes/experts');

app.use('/api/msme', msmeRoutes);
app.use('/api/experts', expertRoutes);

app.get('/', (req, res) => {
    res.send('BFC & WEFC API Running');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Debug Middleware to log all requests
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

// Debug 404
app.use((req, res) => {
    console.log(`404 Hit: ${req.originalUrl}`);
    res.status(404).json({ message: 'Route Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
