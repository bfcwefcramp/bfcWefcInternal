const mongoose = require('mongoose');
const Expert = require('./models/Expert');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        const experts = await Expert.find({});
        console.log(`Checking ${experts.length} experts for MoMs...`);

        let totalMoms = 0;
        for (const e of experts) {
            console.log(`Expert: ${e.name} - MoMs: ${e.moms.length}`);
            totalMoms += e.moms.length;
            if (e.moms.length > 0) {
                console.log(`  Sample: ${e.moms[0].date.toISOString().split('T')[0]} - ${e.moms[0].eventName}`);
            }
        }
        console.log(`Total MoMs across all experts: ${totalMoms}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
