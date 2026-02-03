const XLSX = require('xlsx');
const path = require('path');

const checkHeaders = () => {
    try {
        const filePath = path.join(__dirname, '../Compiled Udyam Registration Data - BFC Team.xlsx');
        const workbook = XLSX.readFile(filePath);

        // Check the second sheet (likely Consolidated Data)
        const sheetName = workbook.SheetNames[1];
        console.log(`Analyzing Sheet: ${sheetName}`);

        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 5 });

        const fs = require('fs');
        fs.writeFileSync('udyam_headers.json', JSON.stringify(data, null, 2));
        console.log('Headers written to udyam_headers.json');

    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkHeaders();
