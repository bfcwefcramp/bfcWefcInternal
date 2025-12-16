
const axios = require('axios');

const test = async () => {
    try {
        console.log('Testing Stats API...');
        const statsRes = await axios.get('http://localhost:5001/api/msme/stats');
        console.log('Stats Response:', JSON.stringify(statsRes.data, null, 2));

        console.log('\nTesting Filter API (Area=North Goa)...');
        const listRes = await axios.get('http://localhost:5001/api/msme?area=North Goa');
        console.log(`Filtered Count: ${listRes.data.length}`);
        if (listRes.data.length > 0) {
            console.log('First Record Area:', listRes.data[0].area);
        }

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
};

test();
