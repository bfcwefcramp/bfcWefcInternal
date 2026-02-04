const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const Expert = require('../models/Expert');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const debugSanket = async () => {
    try {
        const logFile = path.join(__dirname, '../../sanket_debug_log.txt');
        const log = (msg) => {
            console.log(msg);
            try { fs.appendFileSync(logFile, msg + '\n'); } catch (e) { }
        };

        // Clear log file
        try { fs.writeFileSync(logFile, '--- Debugging Sanket ---\n'); } catch (e) { }

        await mongoose.connect(MONGODB_URI);
        log('MongoDB Connected');

        // 1. Get exact Expert Name from DB
        const expert = await Expert.findOne({ name: { $regex: /Sanket/i } });
        log('--- DB Record ---');
        log('Found Expert in DB: ' + (expert ? expert.name : 'NOT FOUND'));

        if (!expert) {
            log("CRITICAL: Expert 'Sanket' not found in DB. Import will definitely fail.");
            process.exit(0);
        }

        // 2. Setup Matcher (Mirroring import script)
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

        // 3. Scan Excel
        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        log('Reading file: ' + filePath);

        if (!fs.existsSync(filePath)) {
            log('FILE NOT FOUND!');
            process.exit(1);
        }

        const workbook = XLSX.readFile(filePath);

        const scanSheet = (sheetName) => {
            if (!workbook.Sheets[sheetName]) {
                log(`Sheet ${sheetName} not found.`);
                return;
            }
            log(`\nScanning Sheet: ${sheetName}`);
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            let matchCount = 0;
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 5) continue;

                const attendees = row[6]; // Index 6
                if (!attendees) continue;

                if (attendees.toString().toLowerCase().includes('sanket')) {
                    matchCount++;
                    const parts = attendees.toString().split(/[\r\n,]+/);
                    log(`[Row ${i + 1}] Event: ${row[4] || row[3] || 'Unknown'} | Attendees: ${attendees}`);

                    // Test matching for each part
                    parts.forEach(p => {
                        if (p.toLowerCase().includes('sanket')) {
                            const matched = findExpert(p);
                            log(`    -> Parsing '${p.trim()}': ${matched ? '✅ MATCH: ' + matched : '❌ FAILED'}`);
                        }
                    });
                }
            }
            log(`Total mentions of 'Sanket' in ${sheetName}: ${matchCount}`);
        };

        scanSheet('MoMs - Event_Exhibitions');
        scanSheet(' MoMs - departmental visits');

        process.exit(0);

    } catch (err) {
        console.error(err);
        try { fs.appendFileSync(path.join(__dirname, '../../sanket_debug_log.txt'), 'ERROR: ' + err.message); } catch (e) { }
        process.exit(1);
    }
};

debugSanket();
