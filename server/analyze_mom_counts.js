const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
const workbook = XLSX.readFile(filePath);

const sheets = [
    { name: 'MoMs - Event_Exhibitions', label: 'Exhibitions' },
    { name: ' MoMs - departmental visits', label: 'Visits' }
];

console.log('--- Analysis of Excel Content vs Database Records ---');

let totalRows = 0;
let totalAttendees = 0;

sheets.forEach(config => {
    const sheet = workbook.Sheets[config.name];
    if (!sheet) return;

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Filter empty rows roughly (check if date or event name exists)
    // Row 0 is header.
    const validRows = rows.slice(1).filter(r => r && (r[1] || r[3] || r[4]));

    console.log(`\nSheet: ${config.name}`);
    console.log(`Raw Rows (excluding header): ${validRows.length}`);

    let sheetAttendees = 0;
    validRows.forEach((row, idx) => {
        const attendeesRaw = row[6]; // Index 6 is 'Attended by'
        if (attendeesRaw) {
            const list = attendeesRaw.toString().split(/[\r\n,]+/).map(s => s.trim()).filter(s => s);
            // console.log(`  Row ${idx+2}: ${row[4] || row[3]} -> ${list.length} attendees (${list.join(', ')})`);
            sheetAttendees += list.length;
        }
    });

    console.log(`Total Individual Expert Records generated: ${sheetAttendees}`);
    totalRows += validRows.length;
    totalAttendees += sheetAttendees;
});

console.log('\n--- Summary ---');
console.log(`Total Unique Events (Excel Rows): ${totalRows}`);
console.log(`Total Database Records (Expert x Event): ${totalAttendees}`);
