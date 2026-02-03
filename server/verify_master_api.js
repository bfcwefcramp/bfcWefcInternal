const axios = require('axios');

const checkAPI = async () => {
    try {
        const res = await axios.get('http://localhost:5001/api/master/expert/Sanket');
        console.log('API Response Status:', res.status);
        console.log('Data Preview:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('API Error:', err.message);
    }
};

checkAPI();
