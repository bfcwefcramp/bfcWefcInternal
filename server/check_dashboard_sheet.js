const XLSX = require('xlsx');
const path = require('path');

const checkDashboard = () => {
    try {
        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets['Dashboard'];
        if (!sheet) {
            console.log('Dashboard sheet empty or not found');
            return;
        }

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Dashboard Sheet Rows: ${data.length}`);

        console.log('--- SAMPLE ROWS (Top 20) ---');
        data.slice(0, 20).forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkDashboard();
