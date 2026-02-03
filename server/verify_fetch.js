const checkAPI = async () => {
    try {
        console.log('Fetching stats for Sanket...');
        const res = await fetch('http://localhost:5001/api/master/expert/Sanket');
        if (!res.ok) {
            console.error('API Error Status:', res.status);
            const text = await res.text();
            console.error('Body:', text);
            return;
        }
        const data = await res.json();
        console.log('API Response Status:', res.status);
        console.log('Data Preview:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
};

checkAPI();
