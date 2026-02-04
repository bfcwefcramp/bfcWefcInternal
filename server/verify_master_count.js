const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await MasterRecord.countDocuments({ category: { $in: ['Exhibition', 'Departmental_Visit'] } });
        console.log(`Verified Count in MasterRecord: ${count}`);

        // Sample check
        const sample = await MasterRecord.findOne({ category: 'Exhibition' });
        if (sample) {
            console.log('Sample Record:', JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
