const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const checkSheets = () => {
    try {
        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) {
            console.error('File not found');
            return;
        }
        const workbook = XLSX.readFile(filePath);
        console.log('--- SHEET NAMES ---');
        console.log(workbook.SheetNames);

        // Also sample the first few rows of "MASTER SHEET" again to be sure
        const sheet = workbook.Sheets['MASTER SHEET'];
        if (sheet) {
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 5 });
            console.log('\n--- MASTER SHEET HEADERS (Row 0) ---');
            console.log(JSON.stringify(data[0]));
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkSheets();
