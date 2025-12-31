const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../excelData/Weekly Work Sheet-Nov-Dec 25.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length > 0) {
        console.log('Keys in first row:', Object.keys(data[0]));
        console.log('Keys in second row:', Object.keys(data[1]));

        // Check if "Name" repeats
        const names = data.map(r => r['Name'] || r['name'] || r['Expert Name']);
        console.log('First 10 Names:', names.slice(0, 10));
    } else {
        console.log('No data found');
    }

} catch (err) {
    console.error(err.message);
}
