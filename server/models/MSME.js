const mongoose = require('mongoose');

const MSMESchema = new mongoose.Schema({
  dateOfVisit: { type: Date, default: Date.now },
  assistedBy: { type: String, enum: ['BFC', 'WEFC'] },
  visitorName: { type: String, required: true },
  visitorCategory: {
    type: String,
    enum: ['Existing MSME', 'Aspiring MSME', 'SHG Member', 'Others']
  },
  visitorCategoryOther: { type: String }, // Populated if Category is 'Others'
  gender: { type: String, enum: ['Male', 'Female'] },
  caste: { type: String, enum: ['General', 'SC', 'ST', 'OBC'] },
  contactNumber: { type: String },
  email: { type: String },

  // Business Details
  address: { type: String }, // Business Unit Address
  businessName: { type: String }, // Name of Business Unit
  udyamRegistrationNo: { type: String },
  enterpriseType: {
    type: String,
    enum: ['Micro', 'Small', 'Medium']
  },
  sector: {
    type: String,
    enum: ['Manufacturing', 'Service', 'Retail Trade']
  },

  // Visit & Support Details
  purposeOfVisit: { type: String },
  expertName: [{ type: String }], // Array for multiple experts
  status: { type: String, enum: ['Resolved', 'Pending'], default: 'Pending' },
  supportDetails: { type: String }, // Details of support rendered
  photos: [{ type: String }], // URLs or paths to uploaded files
  followUpAction: { type: String },
  queryResolutionRequired: { type: String }, // Assistance required by Expert

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MSME', MSMESchema);
