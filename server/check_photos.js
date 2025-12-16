
const mongoose = require('mongoose');
const MSME = require('./models/MSME');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const checkPhotos = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const msmes = await MSME.find({ photos: { $exists: true, $ne: '' } }).limit(5);

        console.log(`Found ${msmes.length} records with photos text.`);
        msmes.forEach(m => {
            console.log(`Name: ${m.visitorName}, Photo Data: '${m.photos}'`);
        });

        if (msmes.length === 0) {
            console.log("No records found with non-empty 'photos' field.");
            // Check a random record to see if the field exists at all
            const any = await MSME.findOne();
            console.log('Sample Record:', any);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPhotos();
