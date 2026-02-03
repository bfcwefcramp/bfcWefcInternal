const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const analyzeUdyam = () => {
    try {
        const filePath = path.join(__dirname, '../Compiled Udyam Registration Data - BFC Team.xlsx');
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return;
        }

        const workbook = XLSX.readFile(filePath);
        console.log('Sheets:', workbook.SheetNames);

        workbook.SheetNames.forEach(name => {
            const sheet = workbook.Sheets[name];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 10 });
            console.log(`\n--- First 5 rows of sheet: ${name} ---`);
            data.slice(0, 5).forEach((row, i) => console.log(JSON.stringify(row)));
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
};

analyzeUdyam();
