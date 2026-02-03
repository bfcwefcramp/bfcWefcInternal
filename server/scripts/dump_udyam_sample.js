const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dumpSample = () => {
    try {
        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Compiled Udyam Registration Data - BFC Team.xlsx');
        const workbook = XLSX.readFile(filePath);
        const detailedSheetName = workbook.SheetNames[1]; // Index 1
        const sheet = workbook.Sheets[detailedSheetName];

        // Get rows 0 to 5
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 6);

        let output = `SHEET: ${detailedSheetName}\n\n`;
        rows.forEach((row, i) => {
            output += `ROW ${i}: ${JSON.stringify(row)}\n`;
        });

        fs.writeFileSync('debug_udyam_sample.txt', output);
        console.log("Dumped sample to debug_udyam_sample.txt");

    } catch (err) {
        console.error(err);
    }
};

dumpSample();
