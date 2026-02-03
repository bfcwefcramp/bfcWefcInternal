const mongoose = require('mongoose');
require('dotenv').config();

const MasterRecordSchema = new mongoose.Schema({ category: String }, { strict: false });
const MasterRecord = mongoose.model('MasterRecord', MasterRecordSchema, 'master_records');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bfc-wefc');
        console.log("Connected to MongoDB");

        const categories = await MasterRecord.distinct('category');
        console.log("Distinct Categories:", categories);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
