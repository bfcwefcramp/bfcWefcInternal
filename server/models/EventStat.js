const mongoose = require('mongoose');

const EventStatSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        unique: true // Prevent duplicate entries for same event
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String, // e.g., 'Event', 'Meeting', 'Walk-in' (though Walk-ins are usually separate)
        default: 'Event'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EventStat', EventStatSchema);
