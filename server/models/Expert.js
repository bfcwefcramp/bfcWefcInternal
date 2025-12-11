const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String },
    expertise: [{ type: String }],
    projectsData: [{ // Detail of what they worked on
        title: String,
        description: String,
        date: Date
    }],
    contact: { type: String },
    profileImage: { type: String } // URL or path
});

module.exports = mongoose.model('Expert', ExpertSchema);
