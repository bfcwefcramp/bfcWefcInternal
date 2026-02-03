const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    // Inspect MASTER SHEET
    const masterSheet = workbook.Sheets['MASTER SHEET'];
    if (masterSheet) {
        console.log('\n--- MASTER SHEET ---');
        const masterData = XLSX.utils.sheet_to_json(masterSheet, { limit: 5 });
        console.log('Sample Data:', JSON.stringify(masterData, null, 2));
    } else {
        console.log('MASTER SHEET not found');
    }

    // Inspect Agenda (for MOMs?)
    const agendaSheet = workbook.Sheets['Agenda'];
    if (agendaSheet) {
        console.log('\n--- Agenda ---');
        const agendaData = XLSX.utils.sheet_to_json(agendaSheet, { limit: 5 });
        console.log('Sample Data:', JSON.stringify(agendaData, null, 2));
    }
} catch (error) {
    console.error('Error reading excel:', error);
}
