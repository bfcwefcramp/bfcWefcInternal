const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const analyze = () => {
    try {
        console.log('Starting Simple Analysis...');

        // Hardcoded experts for test
        const experts = ['Sanket', 'Pradnya', 'Tejas', 'Shubham', 'Expert'];
        const expertMap = {};
        experts.forEach(e => expertMap[e.toLowerCase()] = e);

        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) throw new Error('File not found');

        console.log('Reading Excel...');
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets['MASTER SHEET'];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Rows: ${rawData.length}`);

        const columnHits = {}; // colIndex -> count

        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            row.forEach((cell, colIndex) => {
                if (cell && typeof cell === 'string') {
                    const val = cell.toLowerCase();
                    for (const e of experts) {
                        if (val.includes(e.toLowerCase())) {
                            columnHits[colIndex] = (columnHits[colIndex] || 0) + 1;
                        }
                    }
                }
            });
        }

        console.log('--- COLUMN HITS ---');
        console.log(JSON.stringify(columnHits, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
};

analyze();
