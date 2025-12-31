
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../excelData/Team Contack Details.xlsx');
try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample Data:', JSON.stringify(data.slice(0, 2), null, 2));
    } else {
        console.log('No data found');
    }
} catch (error) {
    console.error('Error reading file:', error);
}
