const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['MASTER SHEET'];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total Records: ${data.length}`);

// Fields to analyze for distribution
const fieldsToAnalyze = [
    'BFC/WEFC',
    'Event Name',
    'Participant Type',
    'Type of Organization',
    'Gender',
    'Social Category',
    'District',
    'Taluka/Block',
    'Nature Of Business/Activity Type', // Manufacturing/Service
    'Main Product/Activity', // Cluster potential?
];

const analysis = {};

fieldsToAnalyze.forEach(field => {
    analysis[field] = {};
});

data.forEach(row => {
    fieldsToAnalyze.forEach(field => {
        let val = row[field];
        if (val) {
            val = val.toString().trim(); // Normalize
            analysis[field][val] = (analysis[field][val] || 0) + 1;
        }
    });
});

const fs = require('fs');

let output = `Total Records: ${data.length}\n`;

output += '\n--- ANALYSIS RESULT ---';
Object.keys(analysis).forEach(field => {
    output += `\n\nField: ${field}`;
    const counts = analysis[field];
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    sorted.slice(0, 15).forEach(([val, count]) => {
        output += `\n  ${val}: ${count}`;
    });
    if (sorted.length > 15) output += `\n  ... and ${sorted.length - 15} more`;
});

// Check for financial columns availability
let turnoverCount = 0;
let investmentCount = 0;
let employmentCount = 0;

data.forEach(row => {
    if (row['Annual Turnover']) turnoverCount++;
    if (row['Investment']) investmentCount++;
    if (row['Number of Employees']) employmentCount++;
});

output += '\n\n--- DATA COMPLETENESS ---';
output += `\nRecords with Turnover: ${turnoverCount}`;
output += `\nRecords with Investment: ${investmentCount}`;
output += `\nRecords with Employment: ${employmentCount}`;

fs.writeFileSync('analysis_output.txt', output);
console.log('Analysis written to analysis_output.txt');
