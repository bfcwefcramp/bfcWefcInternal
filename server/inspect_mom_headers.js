const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);

['MoMs - Event_Exhibitions', ' MoMs - departmental visits'].forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length > 0) {
            console.log('Headers (Row 0):');
            jsonData[0].forEach((col, idx) => console.log(`[${idx}] ${col}`));
            console.log('\nSample Data (Row 1):');
            if (jsonData[1]) {
                jsonData[1].forEach((col, idx) => console.log(`[${idx}] ${col}`));
            }
        }
    } else {
        console.log(`Sheet not found: ${sheetName}`);
    }
});
