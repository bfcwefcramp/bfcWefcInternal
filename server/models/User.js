const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ['sudo_admin', 'admin', 'expert'], default: 'expert' },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' } // Link to expert profile if role is expert
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
