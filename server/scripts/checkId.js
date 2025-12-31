
const mongoose = require('mongoose');
const Expert = require('../models/Expert');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const checkId = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const id = '69413696a5608ffd725efeb9';
        console.log(`Checking ID: ${id}`);
        const expert = await Expert.findById(id);
        if (expert) {
            console.log('FOUND:', expert.name);
        } else {
            console.log('NOT FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkId();
