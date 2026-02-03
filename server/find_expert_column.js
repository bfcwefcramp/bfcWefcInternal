const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 300 });

const knownExperts = ['sanket'];

console.log('--- SEARCHING FOR EXPERTS ---');
data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
        if (cell && typeof cell === 'string') {
            const val = cell.toLowerCase();
            if (knownExperts.some(e => val.includes(e))) {
                console.log(`Row ${rowIndex}, Column ${colIndex}: "${cell}"`);
            }
        }
    });
});
console.log('--- DONE ---');
