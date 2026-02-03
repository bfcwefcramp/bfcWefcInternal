const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dumpMoMs = () => {
    try {
        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);

        const sheetsToDump = [
            'MoMs - Event_Exhibitions',
            ' MoMs - departmental visits' // Note leading space found in list
        ];

        const dump = {};

        sheetsToDump.forEach(name => {
            const sheet = workbook.Sheets[name];
            if (sheet) {
                dump[name] = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 10 });
            } else {
                dump[name] = 'NOT FOUND';
            }
        });

        fs.writeFileSync('mom_dump.json', JSON.stringify(dump, null, 2));
        console.log('Dumped MoM sheets to mom_dump.json');

    } catch (err) {
        console.error(err);
    }
};

dumpMoMs();
