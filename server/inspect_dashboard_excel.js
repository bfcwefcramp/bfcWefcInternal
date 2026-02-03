const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Compiled Udyam Registration Data - BFC Team.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const lastColIndex = range.e.c;

    console.log(`Reading Last Column (Index: ${lastColIndex})`);

    for (let R = 0; R <= Math.min(range.e.r, 20); ++R) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: lastColIndex })];
        console.log(`Row ${R}: ${cell ? cell.v : 'EMPTY'}`);
    }

} catch (error) {
    console.error('Error reading excel:', error);
}
