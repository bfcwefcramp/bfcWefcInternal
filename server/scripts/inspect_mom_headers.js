const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const exhibitionSheet = sheetNames.find(s => s.toLowerCase().includes('exhibition') && s.toLowerCase().includes('mom'));
    const deptSheet = sheetNames.find(s => s.toLowerCase().includes('department') && s.toLowerCase().includes('visit'));

    const inspect = (name) => {
        if (!name) return;
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\nSHEET: ${name}`);
        // Print Row 0 (Headers)
        if (data[0]) console.log("HEADERS:", JSON.stringify(data[0]));
        // Print Row 1 (Data)
        if (data[1]) console.log("DATA_ROW_1:", JSON.stringify(data[1]));
    };

    inspect(exhibitionSheet);
    inspect(deptSheet);

} catch (err) {
    console.error("Error:", err.message);
}
