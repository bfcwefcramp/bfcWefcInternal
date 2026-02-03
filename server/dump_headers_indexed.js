const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const headers = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 1 })[0];

const output = headers.map((h, i) => `Index ${i}: ${h}`).join('\n');
fs.writeFileSync('headers_indexed.txt', output);
console.log('Headers written to headers_indexed.txt');
