const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];

// Read as array of arrays (header: 1)
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 3 });

console.log('--- RAW ROWS ---');
data.forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row));
});
