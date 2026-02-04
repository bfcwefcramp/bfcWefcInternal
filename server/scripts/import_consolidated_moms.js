const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importConsolidated = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Expert Matching Logic
        const experts = await Expert.find({});
        const expertMap = {};
        experts.forEach(e => {
            if (!e.name) return;
            const norm = e.name.toLowerCase().trim();
            expertMap[norm] = e.name;
            const parts = norm.split(' ');
            if (parts.length > 0) expertMap[parts[0]] = e.name;
        });

        const findExpert = (text) => {
            if (!text) return null;
            const clean = text.replace(/\(BFC\)/gi, '').replace(/\(WEFC\)/gi, '').trim().toLowerCase();
            if (expertMap[clean]) return expertMap[clean];
            for (const key of Object.keys(expertMap)) {
                if (clean.includes(key) && key.length > 3) return expertMap[key];
            }
            return null;
        };

        // 2. Load Workbook
        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) throw new Error(`File not found at ${filePath}`);

        const workbook = XLSX.readFile(filePath);

        // Dynamic Sheet Finding
        const sheetExhibitions = workbook.SheetNames.find(s => s.toLowerCase().includes('event_exh'));
        const sheetDeptVisits = workbook.SheetNames.find(s => s.toLowerCase().includes('departmental'));

        if (!sheetExhibitions || !sheetDeptVisits) {
            console.error('Could not find both required sheets.');
            console.log('Available Sheets:', workbook.SheetNames);
            process.exit(1);
        }

        console.log(`Found Sheets:\n1. ${sheetExhibitions}\n2. ${sheetDeptVisits}`);

        // 3. Clear Old Data (Exhibitions, Workshops, Field Visits, Dept Visits, MoM)
        // We will overwrite these categories. We keeping 'Consultation' or others if they exist?
        // Let's be safe: delete by Source 'Excel_Import' if we had that flag, but we don't.
        // We will delete by category IN list.
        await MasterRecord.deleteMany({
            category: { $in: ['Exhibition', 'Departmental_Visit', 'Field_Visit', 'Workshop', 'MoM', 'Event', 'MoM_Event'] }
        });
        console.log('Cleared old event records.');

        const recordsToInsert = [];
        const processSheet = (sheetName, defaultCategory) => {
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Skip header (row 0)
            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length < 2) continue;

                const dateRaw = row[1];
                const eventName = (row[4] || row[3] || 'Unnamed').toString().trim();
                const venue = (row[3] || '').toString(); // Sometimes venue is col 3
                const attendeesRaw = row[6]; // Index 6 seems constant
                const agenda = row[7] || '';
                const remarks = row[8] || '';

                if (!attendeesRaw) continue;

                // --- CLASSIFICATION LOGIC ---
                // Default: Use the Sheet's Category (Exhibition or Departmental_Visit)
                let category = defaultCategory;
                const nameUpper = eventName.toUpperCase();

                // EXCEPTIONS: Field Visits (TSM & Moira)
                if (nameUpper.startsWith('TSM') || nameUpper.includes('MOIRA') || nameUpper.includes('FIELD VISIT')) {
                    category = 'Field_Visit';
                }
                // REMOVED: Workshop auto-classification (User requested to create later)
                // REMOVED: Tarang specific logic (It will default to 'Exhibition' if in that sheet, which is correct)

                // Parse Date
                let parsedDate = null;
                if (typeof dateRaw === 'number') {
                    parsedDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
                } else if (typeof dateRaw === 'string') {
                    const dStr = dateRaw.split('To')[0].trim(); // Handle "Date To Date"
                    // Try DD/MM/YYYY
                    const parts = dStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
                    if (parts) {
                        parsedDate = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
                    } else {
                        parsedDate = new Date(dStr);
                    }
                }
                if (!parsedDate || isNaN(parsedDate.getTime())) parsedDate = new Date(0); // Default invalid

                // Parse Attendees
                const attendeesList = attendeesRaw.toString().split(/[\r\n,]+/);
                const uniqueExperts = new Set();

                attendeesList.forEach(a => {
                    const exp = findExpert(a);
                    if (exp) uniqueExperts.add(exp);
                });

                if (uniqueExperts.size === 0) continue;

                uniqueExperts.forEach(expertName => {
                    recordsToInsert.push({
                        expertName,
                        eventName,
                        date: parsedDate,
                        category,
                        venue,
                        agenda,
                        remarks,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });
            }
        };

        processSheet(sheetExhibitions, 'Exhibition');
        processSheet(sheetDeptVisits, 'Departmental_Visit');

        if (recordsToInsert.length > 0) {
            await MasterRecord.insertMany(recordsToInsert);
            console.log(`Inserted ${recordsToInsert.length} records.`);
        } else {
            console.log('No records found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importConsolidated();
