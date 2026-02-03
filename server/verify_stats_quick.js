const axios = require('axios');

async function check() {
    try {
        const res = await axios.get('http://127.0.0.1:5001/api/master/stats');
        console.log("Status:", res.status);
        console.log("Breakdown:", JSON.stringify(res.data.breakdown, null, 2));
        console.log("Events List Length:", res.data.eventsList ? res.data.eventsList.length : 0);
        if (res.data.eventsList && res.data.eventsList.length > 0) {
            console.log("Sample Event:", JSON.stringify(res.data.eventsList[0], null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error("Data:", e.response.data);
    }
}
check();
