
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const listExperts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        const experts = await Expert.find({});
        console.log(`Found ${experts.length} experts associated with this URI.`);
        experts.forEach(e => console.log(`${e._id} : ${e.name}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listExperts();
