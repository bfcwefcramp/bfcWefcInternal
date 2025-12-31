const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../excelData/Weekly Work Sheet-Nov-Dec 25.xlsx');
console.log(`Reading file: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
    console.log('Headers List:', JSON.stringify(headers));

    // Get first 20 rows of data to check for multiple entries per person
    const data = XLSX.utils.sheet_to_json(sheet).slice(0, 20);
    console.log('Sample Data:', JSON.stringify(data, null, 2));

} catch (err) {
    console.error('Error reading Excel:', err.message);
}
