const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['MASTER SHEET'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Print Header (Row 0) cleanly
    console.log("Headers:");
    data[0].forEach((h, i) => console.log(`${i}: ${h}`));

    // Print Row 1 cleanly
    console.log("\nRow 1 Data:");
    if (data[1]) {
        data[1].forEach((v, i) => console.log(`${i}: ${v}`));
    }

} catch (err) {
    console.error("Error:", err.message);
}
