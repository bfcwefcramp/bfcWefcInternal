const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

try {
    const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
    const workbook = XLSX.readFile(filePath);

    const list = workbook.SheetNames.join('\n');
    fs.writeFileSync('sheet_list.txt', list);
    console.log('Success');
} catch (err) {
    console.error(err);
}
