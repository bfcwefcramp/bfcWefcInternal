const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['MASTER SHEET'];

    // Get headers (Row 0)
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 1 })[0];

    console.log('--- HEADERS LIST ---');
    headers.forEach((h, i) => console.log(`${i}: ${h}`));

} catch (error) {
    console.error('Error reading excel:', error);
}
