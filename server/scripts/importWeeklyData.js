const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('../models/Expert');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";
const FILE_PATH = path.join(__dirname, '../../excelData/Weekly Work Sheet-Nov-Dec 25.xlsx');

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        importData();
    })
    .catch(err => console.error(err));

async function importData() {
    try {
        const workbook = XLSX.readFile(FILE_PATH);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Read as 2D array to handle merged headers dynamically
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`Found ${rows.length} rows.`);

        if (rows.length < 3) {
            console.log("Not enough data");
            process.exit();
        }

        const monthRow = rows[0]; // Row 0 has "November", "December"
        const weekRow = rows[1];  // Row 1 has "To 21/11/..."
        const dataRows = rows.slice(2); // Data starts from Row 2

        // Map Identify Columns
        const columnMap = [];
        let currentMonth = '';

        for (let i = 0; i < weekRow.length; i++) {
            // Update current month if present in Row 0
            if (monthRow[i]) {
                const val = monthRow[i].toString().trim();
                if (['November', 'December', 'January', 'February'].some(m => val.includes(m))) {
                    currentMonth = val;
                }
            }

            const header = weekRow[i] ? weekRow[i].toString() : '';

            // Check if this is a "Week" column (contains a Date or "Week")
            if (header && (header.includes('To ') || header.includes('Week') || header.match(/\d+\/\d+/)) && !header.toLowerCase().includes('done')) {
                // Found a Plan column. The next one should be "Work Done"
                columnMap.push({
                    month: currentMonth || 'General',
                    weekLabel: header.trim(),
                    planIndex: i,
                    doneIndex: i + 1
                });
            }
        }

        console.log('Mapped Columns:', JSON.stringify(columnMap, null, 2));

        for (const row of dataRows) {
            const name = row[1]; // Column 1 is Name
            if (!name) continue;

            let expert = await Expert.findOne({
                name: { $regex: new RegExp(name.trim(), 'i') }
            });

            if (!expert) {
                console.log(`Expert not found: ${name}. Creating...`);
                expert = new Expert({
                    name: name,
                    designation: row[2] || 'Expert',
                    stats: { eventsAttended: 0, registrationsDone: 0, momsCreated: 0 }
                });
            }

            expert.weeklyReports = []; // Reset for clean import
            const pastWorkMap = new Map();

            for (const col of columnMap) {
                const plan = row[col.planIndex] ? row[col.planIndex].toString() : '';
                const done = row[col.doneIndex] ? row[col.doneIndex].toString() : '';

                if (plan || done) {
                    expert.weeklyReports.push({
                        week: `${col.month} - ${col.weekLabel}`, // e.g. "November - To 21/11/2025"
                        plan: plan,
                        achievement: done,
                        status: done ? 'Completed' : 'Pending'
                    });

                    if (done) {
                        pastWorkMap.set(done, {
                            period: `${col.month} 2025`,
                            activity: done,
                            outcome: 'Completed'
                        });
                    }
                }
            }

            // Set latest plan
            const latestPlan = expert.weeklyReports.filter(r => r.plan).pop();
            if (latestPlan) {
                expert.weeklyPlan = {
                    title: latestPlan.week,
                    description: latestPlan.plan,
                    status: latestPlan.achievement ? 'Completed' : 'Pending'
                };
            }

            expert.pastWork = Array.from(pastWorkMap.values());

            await expert.save();
            console.log(`Updated ${name}`);
        }

        console.log('Import Complete');
        process.exit();

    } catch (err) {
        console.error('Import Error:', err);
        process.exit(1);
    }
}
