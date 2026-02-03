const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dumpTable = () => {
    try {
        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames.find(n => n.includes('Event_Exh'));
        const sheet = workbook.Sheets[sheetName];

        // Get first 15 rows
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 15);

        fs.writeFileSync('table_dump.txt', JSON.stringify(rows, null, 2));
        console.log("Dumped full table to table_dump.txt");

    } catch (err) {
        console.error(err);
    }
};

dumpTable();
