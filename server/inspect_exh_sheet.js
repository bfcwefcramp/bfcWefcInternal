const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);

// Find the exact sheet name matching "Event_Exh"
const sheetName = workbook.SheetNames.find(n => n.includes('Event_Exh'));
console.log("Found Sheet:", sheetName);

if (sheetName) {
    const sheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
    console.log("HEADERS:", headers);

    // Preview first few rows
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1, 4);
    console.log("SAMPLE ROWS:", JSON.stringify(rows, null, 2));
} else {
    console.log("Sheet not found!");
}
