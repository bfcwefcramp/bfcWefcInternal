const axios = require('axios');

async function checkStats() {
    try {
        console.log('Fetching stats...');
        const res = await axios.get('http://localhost:5001/api/master/stats');
        console.log('--- Stats Response ---');
        const b = res.data.breakdown;
        console.log(`Exhibitions: ${b.exhibitions}`);
        console.log(`Dept Visits: ${b.deptVisits}`);
        console.log(`Field Visits: ${b.fieldVisits}`);
        console.log(`Workshops:   ${b.workshops}`);
        console.log(`Events:      ${b.events}`);
        console.log('--- Event List Types ---');
        const types = {};
        res.data.eventsList.forEach(e => {
            types[e.type] = (types[e.type] || 0) + 1;
        });
        console.log(types);
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

checkStats();
