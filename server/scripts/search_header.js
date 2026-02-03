const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['MASTER SHEET'];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

    headers.forEach((h, i) => {
        if (h && h.toString().toLowerCase().includes('name')) {
            console.log(`Found 'name' at Index ${i}: ${h}`);
        }
    });

} catch (err) {
    console.error("Error:", err.message);
}
