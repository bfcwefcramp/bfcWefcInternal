const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('./models/Expert');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const analyzeSegmentation = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const experts = await Expert.find({});

        // 1. Build Matcher
        const expertMap = {};
        experts.forEach(e => {
            if (!e.name) return;
            expertMap[e.name.toLowerCase()] = e.name;
            const parts = e.name.trim().split(' ');
            if (parts.length > 0) {
                const firstName = parts[0].toLowerCase();
                if (!expertMap[firstName] || expertMap[firstName].length > e.name.length) {
                    expertMap[firstName] = e.name;
                }
            }
        });

        // 2. Read Excel
        const filePath = path.join(__dirname, '../Final Master Database sheet.xlsx');
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }

        const workbook = XLSX.readFile(filePath);
        if (!workbook.Sheets['MASTER SHEET']) {
            console.log('Available Sheets:', workbook.SheetNames);
            throw new Error('Sheet "MASTER SHEET" not found');
        }
        const sheet = workbook.Sheets['MASTER SHEET'];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 3. Segment Data
        const segments = {
            'Unassigned': { count: 0, distinctEvents: new Set(), locations: {}, activity: {} }
        };
        // Initialize expert segments
        experts.forEach(e => {
            segments[e.name] = {
                count: 0,
                distinctEvents: new Set(), // Store event names
                locations: {}, // Taluka -> count
                participantTypes: {}, // SHG/MSME -> count
                activity: {} // Nature of business -> count
            };
        });

        // Helper to find expert
        const findExpert = (text) => {
            if (!text) return null;
            const lower = text.toLowerCase();
            for (const key of Object.keys(expertMap)) {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
                if (regex.test(lower)) return expertMap[key];
            }
            return null;
        };

        // Process Rows (Skip header)
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const remarks = (row[27] || '').toString();
            const entrepreneurName = (row[7] || '').toString();

            let matchedName = findExpert(remarks) || findExpert(entrepreneurName);

            // Bucket
            const key = matchedName || 'Unassigned';
            if (!segments[key]) segments[key] = { count: 0, distinctEvents: new Set(), locations: {}, participantTypes: {}, activity: {} };

            const seg = segments[key];
            seg.count++;

            // Track Event
            const evtName = row[2];
            if (evtName) seg.distinctEvents.add(evtName);

            // Track Location (Taluka - index 22)
            const taluka = row[22];
            if (taluka) seg.locations[taluka] = (seg.locations[taluka] || 0) + 1;

            // Track Participant Type (Index 6)
            const pType = row[6];
            if (pType) seg.participantTypes[pType] = (seg.participantTypes[pType] || 0) + 1;
        }

        // 4. Generate Report
        let output = '# Master Database Segmentation Report\n';
        output += `Total Rows Processed: ${rawData.length - 1}\n`;

        output += '\n## 1. Expert Segmentation\n';

        // Sort experts by count desc
        const sortedKeys = Object.keys(segments).sort((a, b) => segments[b].count - segments[a].count);

        sortedKeys.forEach(name => {
            const seg = segments[name];
            if (seg.count === 0) return;

            output += `\n### **${name}**`;
            output += `\n- **Total Records Linked**: ${seg.count}`;
            output += `\n- **Unique Events Covered**: ${seg.distinctEvents.size}`;

            // Top Locations
            const topLocs = Object.entries(seg.locations).sort((a, b) => b[1] - a[1]).slice(0, 3);
            const locStr = topLocs.map(l => `${l[0]} (${l[1]})`).join(', ');
            output += `\n- **Top Locations**: ${locStr || 'N/A'}`;

            // Participant Split
            const topTypes = Object.entries(seg.participantTypes).sort((a, b) => b[1] - a[1]);
            const typeStr = topTypes.map(t => `${t[0]}: ${t[1]}`).join(', ');
            output += `\n- **Beneficiaries**: ${typeStr || 'N/A'}\n`;
        });

        const fs = require('fs');
        fs.writeFileSync('expert_segmentation_analysis.md', output);
        console.log('Report generated: expert_segmentation_analysis.md');

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

analyzeSegmentation();
