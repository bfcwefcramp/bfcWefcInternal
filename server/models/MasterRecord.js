const mongoose = require('mongoose');

const MasterRecordSchema = new mongoose.Schema({
    sNo: { type: String }, // S. No.
    particular: { type: String }, // Particular
    eventName: { type: String }, // Event Name
    organization: { type: String }, // BFC/WEFC
    date: { type: Date }, // Date of Visit/ Event
    name: { type: String }, // Name of Visitor
    designation: { type: String }, // Designation
    contactNumber: { type: String }, // Contact Number
    email: { type: String }, // E-Mail ID
    address: { type: String }, // Address
    district: { type: String }, // District
    taluka: { type: String }, // Taluka
    businessName: { type: String }, // Name of Business Unit
    udyamRegistrationNo: { type: String }, // Udyam Registration Number
    enterpriseType: { type: String }, // Type of Business (Micro, Small, Medium)
    socialCategory: { type: String }, // Social Category
    gender: { type: String }, // Gender
    sector: { type: String }, // Sector
    activityType: { type: String }, // Activity Type (Service/Manufacturing)
    annualTurnover: { type: String }, // Annual Turnover
    investment: { type: String }, // Investment
    employment: { type: String }, // Employment
    participantType: { type: String }, // Participant Type (Index 6)
    purpose: { type: String }, // Purpose of Visit
    expertName: { type: String }, // Assistance Provided by (The Expert)
    status: { type: String }, // Status
    mobile: { type: String }, // Mobile alias for contactNumber
    financialYear: { type: String }, // Financial Year
    quarter: { type: String }, // Quarter of Financial Year
    remarks: { type: String }, // Remarks/Comments

    // Custom/Inferred fields
    momLink: { type: String }, // Can be inferred from Remarks or separate Agenda sheet later
    category: { type: String, default: 'General' }, // 'Event', 'Walk-in', 'Workshop' - inferred from 'Particular' or 'Event Name'

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MasterRecord', MasterRecordSchema);
