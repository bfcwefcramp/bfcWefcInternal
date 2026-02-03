const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['Dashboard'];

    // Convert to array of arrays to preserve layout
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("DASHBOARD_CONTENT_START");
    data.slice(0, 30).forEach((row, idx) => {
        console.log(`Row ${idx}: ${JSON.stringify(row)}`);
    });
    console.log("DASHBOARD_CONTENT_END");

} catch (err) {
    console.error("Error:", err.message);
}
