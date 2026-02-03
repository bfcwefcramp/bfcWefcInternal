const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dumpDashboard = () => {
    try {
        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets['Dashboard'];
        if (!sheet) return;

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        fs.writeFileSync('dashboard_dump.json', JSON.stringify(data, null, 2));
        console.log('Dashboard dumped to dashboard_dump.json');

    } catch (err) {
        console.error('Error:', err.message);
    }
};

dumpDashboard();
