const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importUdyamData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Fetch Experts for matching (to normalize name)
        const experts = await Expert.find({});
        const expertMap = {};
        experts.forEach(e => {
            if (!e.name) return;
            expertMap[e.name.toLowerCase()] = e.name;
            const parts = e.name.trim().split(' ');
            if (parts.length > 0) expertMap[parts[0].toLowerCase()] = e.name;
        });

        const findExpert = (text) => {
            if (!text) return null;
            const lower = text.trim().toLowerCase();
            if (expertMap[lower]) return expertMap[lower];

            for (const key of Object.keys(expertMap)) {
                if (lower.includes(key)) return expertMap[key];
            }
            return text; // Return raw text if no match (e.g. "Self")
        };

        // 2. Read Excel
        const filePath = path.join(__dirname, '../../Compiled Udyam Registration Data - BFC Team.xlsx');
        if (!fs.existsSync(filePath)) throw new Error('File not found');

        const workbook = XLSX.readFile(filePath);
        // Use the second sheet (index 1) which contains details
        const sheetName = workbook.SheetNames[1];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`Processing Sheet: ${sheetName}, Rows: ${rawData.length}`);

        // Column Mapping (0-indexed) based on inspection
        // 1: Assigned Expert
        // 2: Name of Entrepreneur
        // 3: Business Name
        // 4: Org Type
        // 5: Gender
        // 7: Mobile
        // 14: Address
        // 15: District
        // 16: Taluka
        // 19: Udyam No
        // 20: Date of Reg
        // 22: Remarks

        const recordsToInsert = [];
        let importedCount = 0;

        // Skip Headers (Rows 0 and 1)
        for (let i = 2; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length < 2) continue;

            const expertRaw = (row[1] || '').toString();
            const expertName = findExpert(expertRaw);

            // Date Conversion
            let dateVal = row[20];
            let parsedDate = new Date();
            if (dateVal) {
                if (typeof dateVal === 'number') {
                    parsedDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                } else {
                    const d = new Date(dateVal);
                    if (!isNaN(d.getTime())) parsedDate = d;
                }
            }

            recordsToInsert.push({
                expertName: expertName || 'Unassigned',
                name: row[2] || '', // Visitor Name
                businessName: row[3] || '',
                enterpriseType: row[4] || '',
                gender: row[5] || '',
                contactNumber: row[7] || '',
                mobile: row[7] || '',
                address: row[14] || '',
                district: row[15] || '',
                taluka: row[16] || '',
                udyamRegistrationNo: row[19] || '',
                date: parsedDate,
                remarks: row[22] || '',
                category: 'Udyam Registration',
                eventName: 'Udyam Drive', // Generic event name for grouping
                createdAt: new Date()
            });
            importedCount++;
        }

        // We append, not delete, assuming MasterData might have other stuff?
        // Actually user said "update dashboard... using THIS file". 
        // If we duplicate, stats go wild. 
        // Strategy: Delete records with category='Udyam Registration' first.
        await MasterRecord.deleteMany({ category: 'Udyam Registration' });
        console.log('Cleared old Udyam Registration records.');

        await MasterRecord.insertMany(recordsToInsert);
        console.log(`Successfully imported ${importedCount} Udyam records.`);

        process.exit(0);
    } catch (err) {
        console.error('Import Error:', err);
        process.exit(1);
    }
};

importUdyamData();
