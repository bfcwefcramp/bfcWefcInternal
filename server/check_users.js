require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find({});
        console.log('Total Users Found:', users.length);
        console.log('Users:', users.map(u => ({ username: u.username, role: u.role })));

        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            console.log('Admin Hash:', admin.password);
        } else {
            console.log('Admin user NOT found');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
