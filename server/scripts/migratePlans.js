
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

// Use the URI from your seed script or env
const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Unset old fields
        await Expert.updateMany({}, {
            $unset: {
                weeklyPlan: "",
                weeklyReports: "",
                monthlyReports: "",
                monthlyPlan: "",
                pastWork: ""
            },
            $set: {
                plans: [] // Initialize empty plans array
            }
        });

        console.log('Cleared old data fields and initialized empty plans array.');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
