const mongoose = require('mongoose');

// MongoDB Connection
// Using the connection string from server/index.js
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected Successfully');
    updateDesignations();
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

const updateDesignations = async () => {
    try {
        console.log('Starting designation update...');

        // 1. Update Experts with designation "General Support" (Case Insensitive just in case)
        const updateDesignationResult = await mongoose.connection.db.collection('experts').updateMany(
            { designation: { $regex: new RegExp('^General Support$', 'i') } },
            { $set: { designation: 'Business Facilitation Centre' } }
        );
        console.log(`Updated ${updateDesignationResult.modifiedCount} experts with designation 'General Support'.`);

        // 2. Update Experts having "General Support" in expertise array
        // We fetch, iterate and save to be safe with arrays
        const expertsWithTag = await mongoose.connection.db.collection('experts').find({ expertise: { $regex: new RegExp('General Support', 'i') } }).toArray();
        let tagCount = 0;

        for (const expert of expertsWithTag) {
            if (expert.expertise && Array.isArray(expert.expertise)) {
                const newExpertise = expert.expertise.map(tag =>
                    tag.match(/General Support/i) ? 'Business Facilitation Centre' : tag
                );
                // Also remove duplicates if any
                const uniqueExpertise = [...new Set(newExpertise)];

                await mongoose.connection.db.collection('experts').updateOne(
                    { _id: expert._id },
                    { $set: { expertise: uniqueExpertise } }
                );
                tagCount++;
            }
        }
        console.log(`Updated tags for ${tagCount} experts.`);

        console.log('Designation update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating designations:', err);
        process.exit(1);
    }
};
