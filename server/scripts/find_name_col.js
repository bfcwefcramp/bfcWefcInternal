const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['MASTER SHEET'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Print Headers 5 to 20
    console.log("Headers 5-20:");
    for (let i = 5; i <= 20; i++) {
        console.log(`${i}: ${data[0][i]}`);
    }

} catch (err) {
    console.error("Error:", err.message);
}
