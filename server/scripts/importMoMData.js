const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importMoMData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Fetch Experts for matching
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
            // Clean up name (remove (BFC), (WEFC), newlines)
            const clean = text.replace(/\(BFC\)/gi, '').replace(/\(WEFC\)/gi, '').trim().toLowerCase();
            if (expertMap[clean]) return expertMap[clean];

            for (const key of Object.keys(expertMap)) {
                if (clean.includes(key)) return expertMap[key];
            }
            return null;
        };

        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) throw new Error('File not found');

        const workbook = XLSX.readFile(filePath);
        const sheetsToProcess = [
            'MoMs - Event_Exhibitions',
            ' MoMs - departmental visits'
        ];

        let recordsToInsert = [];

        for (const sheetName of sheetsToProcess) {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                console.log(`Sheet skipped (not found): ${sheetName}`);
                continue;
            }
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log(`Processing ${sheetName}, Rows: ${rawData.length}`);

            // Start from row index 1 (skip header row 0)
            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length < 2) continue;

                // Index 6 is "Attended by (Internal)" in both sheets based on dump
                const attendeesRaw = row[6];
                if (!attendeesRaw) continue;

                // Split by newline or comma
                const attendees = attendeesRaw.toString().split(/[\r\n,]+/);

                attendees.forEach(attendee => {
                    const expertName = findExpert(attendee);
                    if (expertName) {
                        // Date is Index 1
                        let dateVal = row[1];
                        let parsedDate = new Date();
                        if (dateVal) {
                            if (typeof dateVal === 'number') {
                                parsedDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                            } else {
                                // Try parsing string "10/01/2026 To ..." - take first part
                                const dateStr = dateVal.toString().split('To')[0].trim();
                                const d = new Date(dateStr);
                                if (!isNaN(d.getTime())) parsedDate = d;
                            }
                        }

                        recordsToInsert.push({
                            expertName: expertName,
                            category: 'MoM',
                            eventName: row[4] || row[3] || 'Unnamed Event', // Name of Event or Venue
                            venue: row[3] || '',
                            date: parsedDate,
                            agenda: row[7] || '',
                            remarks: row[8] || '', // Discussion Points
                            createdAt: new Date()
                        });
                    }
                });
            }
        }

        // Clear old MoMs
        await MasterRecord.deleteMany({ category: 'MoM' });
        console.log('Cleared old MoM records.');

        if (recordsToInsert.length > 0) {
            await MasterRecord.insertMany(recordsToInsert);
            console.log(`Successfully imported ${recordsToInsert.length} MoM records.`);
        } else {
            console.log('No MoM records found to import.');
        }

        process.exit(0);

    } catch (err) {
        console.error('Import Error:', err);
        process.exit(1);
    }
};

importMoMData();
