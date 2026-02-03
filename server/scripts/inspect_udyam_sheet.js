const XLSX = require('xlsx');
const path = require('path');

const inspect = () => {
    try {
        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Compiled Udyam Registration Data - BFC Team.xlsx');
        const workbook = XLSX.readFile(filePath);

        const detailedSheetName = workbook.SheetNames[1];
        console.log(`SHEET NAME [1]: "${detailedSheetName}"`);

        const s = workbook.Sheets[detailedSheetName];
        const rows = XLSX.utils.sheet_to_json(s, { header: 1 }).slice(0, 3);

        console.log("--- HEADER ANALYSIS ---");
        if (rows[0]) {
            console.log("ROW 0 HEADERS:");
            rows[0].forEach((val, idx) => console.log(`  [${idx}]: "${val}"`));
        }
        if (rows[1]) {
            console.log("ROW 1 HEADERS/DATA:");
            rows[1].forEach((val, idx) => console.log(`  [${idx}]: "${val}"`));
        }

    } catch (err) {
        console.error(err);
    }
};

inspect();
