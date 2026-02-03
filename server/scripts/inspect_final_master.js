const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
console.log("Reading file:", filePath);

try {
    const workbook = XLSX.readFile(filePath);
    console.log("Sheet Names:", workbook.SheetNames);

    workbook.SheetNames.forEach((sheetName, idx) => {
        if (idx > 5) return; // Limit to first few sheets
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Sheet: ${sheetName} ---`);
        if (data.length > 0) {
            console.log("Row 0:", JSON.stringify(data[0]));
            if (data.length > 1) console.log("Row 1:", JSON.stringify(data[1]));
        } else {
            console.log("Empty Sheet");
        }
    });

} catch (err) {
    console.error("Error reading file:", err.message);
}
