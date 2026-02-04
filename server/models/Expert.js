const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String },
    expertise: [{ type: String }],

    // Unified Plans & Reports Structure
    plans: [{
        month: String, // e.g., "December"
        year: Number,
        weeks: [{
            weekNumber: Number, // 1, 2, 3...
            weekLabel: String, // "1st Week", "2nd Week"
            startDate: Date,
            endDate: Date,
            plan: String, // Targeted Plan
            achievement: String, // Actual Achievement
            remarks: String, // New: Remarks
            additional: String, // New: Additional Section
            status: { type: String, default: 'Pending' }
        }],
        isCurrent: { type: Boolean, default: false }
    }],

    // Stats (Imported or Calculated)
    stats: {
        eventsAttended: { type: Number, default: 0 },
        registrationsDone: { type: Number, default: 0 },
        momsCreated: { type: Number, default: 0 }
    },

    // Minutes of Meeting / Event Participation
    moms: [{
        date: { type: Date, default: Date.now },
        eventName: String,
        location: String,
        summary: String,
        attendees: [String] // List of other experts/officials
    }],

    // Attendance Log (Manual Overrides for Calendar)
    attendanceLog: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['Present', 'Leave', 'Holiday', 'Weekend', 'Office_Work'], required: true },
        remarks: String
    }],

    contact: { type: String },
    profileImage: { type: String } // URL or path
});

module.exports = mongoose.model('Expert', ExpertSchema);
