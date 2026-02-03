const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const data = XLSX.utils.sheet_to_json(sheet, { limit: 1 });

if (data.length > 0) {
    const keys = Object.keys(data[0]);
    fs.writeFileSync('keys_dump.txt', JSON.stringify(keys, null, 2));
    console.log('Keys written to keys_dump.txt');
} else {
    console.log('No data found');
}
