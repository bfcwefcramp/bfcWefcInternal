const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log("SHEET_LIST_START");
    console.log(JSON.stringify(workbook.SheetNames, null, 2));
    console.log("SHEET_LIST_END");

} catch (err) {
    console.error("Error reading file:", err.message);
}
