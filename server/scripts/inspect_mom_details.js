const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    // Check specific sheets mentioned by user/previously found
    // 1. "MoMs - Event_Exhibitions" (Need to find exact name match from previous list)
    // 2. "MoMs - departmental visits"

    const sheetNames = workbook.SheetNames;
    const exhibitionSheet = sheetNames.find(s => s.toLowerCase().includes('exhibition') && s.toLowerCase().includes('mom'));
    const deptSheet = sheetNames.find(s => s.toLowerCase().includes('department') && s.toLowerCase().includes('visit'));

    console.log("Found Sheets:", { exhibitionSheet, deptSheet });

    if (exhibitionSheet) {
        console.log(`\n--- ${exhibitionSheet} ---`);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[exhibitionSheet], { header: 1 });
        // Print header and first few rows
        data.slice(0, 5).forEach((row, i) => console.log(`Row ${i}: ${JSON.stringify(row)}`));
    }

    if (deptSheet) {
        console.log(`\n--- ${deptSheet} ---`);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[deptSheet], { header: 1 });
        data.slice(0, 5).forEach((row, i) => console.log(`Row ${i}: ${JSON.stringify(row)}`));
    }

} catch (err) {
    console.error("Error:", err.message);
}
