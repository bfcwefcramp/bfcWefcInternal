const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const headers = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 1 })[0];

console.log('--- HEADER INDEXES ---');
headers.forEach((h, i) => {
    if (h && h.toString().toLowerCase().includes('assistance')) {
        console.log(`Index ${i}: "${h}"`);
    }
});
console.log('Total Columns:', headers.length);
