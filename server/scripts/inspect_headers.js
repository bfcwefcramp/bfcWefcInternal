const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    // Master Sheet
    const masterSheet = workbook.Sheets['MASTER SHEET'];
    const masterHeaders = XLSX.utils.sheet_to_json(masterSheet, { header: 1 })[0]; // Assuming row 0 is header
    console.log("MASTER_SHEET_HEADERS:", JSON.stringify(masterHeaders));

    // Find MoM Sheet
    const momSheetName = workbook.SheetNames.find(n => n.includes('MoM'));
    if (momSheetName) {
        const momSheet = workbook.Sheets[momSheetName];
        const momHeaders = XLSX.utils.sheet_to_json(momSheet, { header: 1 })[0];
        console.log(`MOM_SHEET_HEADERS (${momSheetName}):`, JSON.stringify(momHeaders));
    }

} catch (err) {
    console.error("Error:", err.message);
}
