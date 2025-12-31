const mongoose = require('mongoose');
const Expert = require('../models/Expert');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            const result = await Expert.updateMany({}, { $set: { weeklyReports: [] } });
            console.log(`Cleared weeklyReports for ${result.modifiedCount} experts.`);
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    })
    .catch(err => console.error(err));
