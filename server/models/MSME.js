const mongoose = require('mongoose');

const MSMESchema = new mongoose.Schema({
  // From Excel
  serialNo: { type: String }, // Sr. No.
  dateOfVisit: { type: Date, default: Date.now }, // Date of visit to DITC
  assistedBy: { type: String }, // Assisted by BFC or WEFC
  visitorName: { type: String }, // Name of Visitor
  visitorCategory: { type: String }, // Category of visitor
  visitorCategoryOther: { type: String }, // Pls specify details if Others
  gender: { type: String }, // Gender (M/F)
  caste: { type: String }, // Caste (General/SC/ST/OBC)
  contactNumber: { type: String }, // Contact Number
  email: { type: String }, // E-Mail ID
  address: { type: String }, // Address
  businessName: { type: String }, // Name of Business Unit
  udyamRegistrationNo: { type: String }, // Udyam Registration Number
  enterpriseType: { type: String }, // Type of Buisness (Micro, Small, Medium)
  sector: { type: String }, // Sector (Manufacturing, Service, Retail Trade)
  purposeOfVisit: { type: String }, // Puropose of Visit
  expertName: { type: String }, // Name of BFC or WEFC Expert met
  status: { type: String, default: 'Pending' }, // Not explicitly in Excel, but needed for UI. Defaulting.
  supportDetails: { type: String }, // Details of support rendered
  photos: { type: String }, // Photos (assuming string URL or path)
  followUpAction: { type: String }, // Follow up action required
  queryResolutionRequired: { type: String }, // Assitance required...

  // New / Derived Fields
  area: { type: String, enum: ['North Goa', 'South Goa', 'Unknown'], default: 'Unknown' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MSME', MSMESchema);
