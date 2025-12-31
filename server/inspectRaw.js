const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../excelData/Weekly Work Sheet-Nov-Dec 25.xlsx');
console.log('Reading:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Read as 2D array (header: 1)
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('Total Rows:', rows.length);
    // Inspect first 5 rows to identify "November" or "December" headers
    for (let i = 0; i < 5; i++) {
        console.log(`Row ${i}:`, JSON.stringify(rows[i]));
    }

    // Check for a specific expert to see their data row
    const expertRow = rows.find(r => r && (r.includes('Sanket') || r.includes('Sanket Dalal')));
    if (expertRow) {
        console.log('Sanket Row:', JSON.stringify(expertRow));
    }

} catch (err) {
    console.error('Error:', err.message);
}
