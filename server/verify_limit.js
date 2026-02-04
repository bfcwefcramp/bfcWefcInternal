const axios = require('axios');

async function checkStats() {
    try {
        console.log('Fetching stats...');
        const res = await axios.get('http://localhost:5001/api/master/stats');
        console.log(`Events List Length: ${res.data.eventsList.length}`);

        // Count just to be sure
        console.log('--- Breakdown ---');
        console.log(res.data.breakdown);
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

checkStats();
