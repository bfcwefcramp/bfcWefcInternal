
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../excelData/MSMEs Visitor Log.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[1];

    fs.writeFileSync('headers.txt', headers.join('\n'));
    console.log('Headers written to headers.txt');

} catch (err) {
    console.error('Error:', err);
}
