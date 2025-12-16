
const mongoose = require('mongoose');
const MSME = require('./models/MSME');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const checkData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        const total = await MSME.countDocuments();
        const north = await MSME.countDocuments({ area: 'North Goa' });
        const south = await MSME.countDocuments({ area: 'South Goa' });
        const unknown = await MSME.countDocuments({ area: 'Unknown' });

        console.log(`Total: ${total}`);
        console.log(`North: ${north}`);
        console.log(`South: ${south}`);
        console.log(`Unknown: ${unknown}`);

        // Check sample addresses for unknown
        if (unknown > 0) {
            const unknownSamples = await MSME.find({ area: 'Unknown' }).limit(5);
            console.log('Sample Addresses for Unknown Area:');
            unknownSamples.forEach(m => console.log(`- ${m.address}`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
