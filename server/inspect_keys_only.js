const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const data = XLSX.utils.sheet_to_json(sheet, { limit: 1 });

if (data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log('\n--- SEARCHING FOR ASSISTANCE KEY ---');
    const assistanceKey = keys.find(k => k.toLowerCase().includes('assistance'));
    console.log(`Found Key: "${assistanceKey}"`);
    console.log(`Value: "${data[0][assistanceKey]}"`);
    console.log('--- DONE ---');
} else {
    console.log('No data found');
}
