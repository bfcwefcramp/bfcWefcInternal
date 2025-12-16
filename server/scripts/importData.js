
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MSME = require('../models/MSME');
const fs = require('fs');

// Hardcoded URI as found in index.js (Security risk noted, but using for consistency with existing app)
const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const excelPath = path.join(__dirname, '../../excelData/MSMEs Visitor Log.xlsx');

const classifyArea = (address) => {
    if (!address) return 'Unknown';
    const lower = address.toLowerCase();

    // North Goa keywords
    if (lower.includes('panaji') || lower.includes('panjim') || lower.includes('mapusa') || lower.includes('bardez') || lower.includes('tiswadi') || lower.includes('pern') || lower.includes('satari') || lower.includes('bicholim') || lower.includes('porvorim')) {
        return 'North Goa';
    }
    // South Goa keywords
    if (lower.includes('margao') || lower.includes('margaon') || lower.includes('vasco') || lower.includes('ponda') || lower.includes('salcete') || lower.includes('quepem') || lower.includes('sanguem') || lower.includes('canacona') || lower.includes('dabolim') || lower.includes('verna')) {
        return 'South Goa';
    }
    return 'Unknown';
}

const importData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await MSME.deleteMany({});
        console.log('Cleared existing MSME data');

        const workbook = XLSX.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { range: 1 }); // Header at index 1

        const msmes = rawData.map(row => {
            // Map keys based on rough matching or exact column names
            // Note: XLSX keys will be the header strings

            // Helper to safe get
            const getVal = (key) => {
                const val = row[key];
                return val ? String(val).trim() : '';
            };

            // Helper for Title Case
            const toTitleCase = (str) => {
                return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            }

            // Custom Date Parser for DD/MM/YY or DD/MM/YYYY
            const parseDate = (dateStr) => {
                if (!dateStr || typeof dateStr !== 'string') return new Date();
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    // Assume DD/MM/YY
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000; // 24 -> 2024
                    return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
                }
                return new Date(dateStr);
            };

            const rawSector = getVal('Sector (Manufacturing, Service, Retail Trade)');
            const rawType = getVal('Type of Buisness (Micro, Small, Medium)');

            return {
                serialNo: getVal('Sr. No.'),
                dateOfVisit: parseDate(getVal('Date of visit to DITC (DD/MM/YY)')),
                assistedBy: getVal('Assisted by BFC or WEFC'),
                visitorName: getVal('Name of Visitor'),
                visitorCategory: getVal('Category of visitor (Existing MSME/aspiring MSME/SHG Member/Others)'),
                visitorCategoryOther: getVal('Pls specify details if Others'),
                gender: getVal('Gender (M/F)'),
                caste: getVal('Caste (General/SC/ST/OBC)'),
                contactNumber: getVal('Contact Number'),
                email: getVal('E-Mail ID'),
                address: getVal('Address (preferably address of business unit)'),
                businessName: getVal('Name of Business Unit'),
                udyamRegistrationNo: getVal('Udyam Registration Number'),
                enterpriseType: toTitleCase(rawType),
                sector: toTitleCase(rawSector),
                purposeOfVisit: getVal('Puropose of Visit'),
                expertName: getVal('Name of BFC or WEFC Expert met'),
                supportDetails: getVal('Details of support rendered'),
                photos: getVal('Photos'),
                followUpAction: getVal('Follow up action required'),
                queryResolutionRequired: getVal('Assitance required by BFC & WEFC Expert to resolve MSME query, if any'),

                // Derived
                area: classifyArea(getVal('Address (preferably address of business unit)'))
            };
        });

        console.log(`Found ${msmes.length} records. Inserting...`);
        await MSME.insertMany(msmes);
        console.log('Data import completed successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Import failed:', err);
        process.exit(1);
    }
};

importData();
