const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Final Master Database sheet.xlsx');

try {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }
    const workbook = XLSX.readFile(filePath);
    console.log("ALL_SHEETS:");
    workbook.SheetNames.forEach(n => console.log(`SHEET: ${n}`));
    process.exit(0);

} catch (err) {
    console.error(err);
}
