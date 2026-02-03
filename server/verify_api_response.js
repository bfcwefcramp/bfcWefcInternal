const http = require('http');

const url = 'http://127.0.0.1:5001/api/master/stats';

const req = http.get(url, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode !== 200) {
                console.log("Error Response:", JSON.stringify(json, null, 2));
            } else {
                console.log("Total:", json.total);
                console.log("Organizations:", JSON.stringify(json.organizations));
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Data:", data.slice(0, 500));
        }
    });
});
req.on('error', (err) => console.error("Request Error:", err));
req.end();
