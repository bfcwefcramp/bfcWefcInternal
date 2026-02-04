const XLSX = require('xlsx');
const path = require('path');
const mongoose = require('mongoose');
const Expert = require('./models/Expert');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const analyze = async () => {
    await mongoose.connect(MONGODB_URI);
    const experts = await Expert.find({});
    const expertMap = {};
    experts.forEach(e => {
        if (e.name) expertMap[e.name.toLowerCase()] = true;
    });

    // Helper from import script
    const findExpert = (text) => {
        if (!text) return false;
        const clean = text.replace(/\(BFC\)/gi, '').replace(/\(WEFC\)/gi, '').trim().toLowerCase();
        if (expertMap[clean]) return true;
        for (const key of Object.keys(expertMap)) {
            if (clean.includes(key) || key.includes(clean)) return true;
        }
        for (const e of experts) {
            if (clean.includes(e.name.toLowerCase())) return true;
        }
        return false;
    };

    const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
    const workbook = XLSX.readFile(filePath);

    const sheets = [
        { name: 'MoMs - Event_Exhibitions', label: 'Exhibitions' },
        { name: ' MoMs - departmental visits', label: 'Visits' }
    ];

    let totalEvents = 0;
    let totalMatchedRecords = 0;
    let totalAttendeesListed = 0;

    console.log('--- Detailed Count Analysis ---');

    for (const config of sheets) {
        const sheet = workbook.Sheets[config.name];
        if (!sheet) continue;
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const validRows = rows.slice(1).filter(r => r && (r[1] || r[3] || r[4]));

        let sheetMatches = 0;
        let sheetAttendees = 0;

        validRows.forEach(row => {
            const attendeesRaw = row[6];
            if (attendeesRaw) {
                const list = attendeesRaw.toString().split(/[\r\n,]+/).map(s => s.trim()).filter(s => s);
                sheetAttendees += list.length;
                list.forEach(a => {
                    if (findExpert(a)) sheetMatches++;
                });
            }
        });

        console.log(`Sheet: ${config.name}`);
        console.log(`  Events (Rows): ${validRows.length}`);
        console.log(`  Total Attendees listed: ${sheetAttendees}`);
        console.log(`  Matched Expert DB Records: ${sheetMatches}`);

        totalEvents += validRows.length;
        totalAttendeesListed += sheetAttendees;
        totalMatchedRecords += sheetMatches;
    }

    console.log('--------------------------------');
    console.log(`Total Events: ${totalEvents}`);
    console.log(`Total Matched Database Records: ${totalMatchedRecords}`);

    process.exit(0);
};

analyze();
