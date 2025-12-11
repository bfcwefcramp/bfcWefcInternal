const mongoose = require('mongoose');

const MSMESchema = new mongoose.Schema({
  entrepreneurName: { type: String, required: true },
  businessName: { type: String, required: true },
  address: { type: String },
  businessType: { 
    type: String, 
    enum: ['Manufacturing', 'Services', 'Trading'] 
  },
  yearStarted: { type: String },
  mobile: { type: String },
  udyam: { type: Boolean, default: false },
  udyamNo: { type: String },
  gst: { type: Boolean, default: false },
  gstNo: { type: String },
  pan: { type: Boolean, default: false },
  panNo: { type: String },
  enquiryType: [{ type: String }], // Array for multiple selection
  remarks: { type: String },
  assistedExperts: { type: String }, // Can be linked to Expert model later
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MSME', MSMESchema);
