
const mongoose = require('mongoose');
const MSME = require('./models/MSME');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const checkValues = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        const sectors = await MSME.distinct('sector');
        const areas = await MSME.distinct('area');
        const types = await MSME.distinct('enterpriseType');

        console.log('Sectors:', JSON.stringify(sectors));
        console.log('Areas:', JSON.stringify(areas));
        console.log('Types:', JSON.stringify(types));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkValues();
