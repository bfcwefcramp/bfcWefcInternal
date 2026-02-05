require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expert = require('../models/Expert');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority';

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected for Seeding...');

        // 1. Create/Update Admin
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // Change this purely for initial seed

        let adminUser = await User.findOne({ username: adminUsername });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            adminUser = new User({
                username: adminUsername,
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log(`[SUCCESS] Admin created: ${adminUsername} / ${adminPassword}`);
        } else {
            console.log('[INFO] Admin already exists.');
        }

        // 1.5 Create/Update Sudo Admin
        const sudoUsername = 'sudo';
        const sudoPassword = 'sudo123';

        let sudoUser = await User.findOne({ username: sudoUsername });
        if (!sudoUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(sudoPassword, salt);

            sudoUser = new User({
                username: sudoUsername,
                password: hashedPassword,
                role: 'sudo_admin'
            });
            await sudoUser.save();
            console.log(`[SUCCESS] Sudo Admin created: ${sudoUsername} / ${sudoPassword}`);
        } else {
            console.log('[INFO] Sudo Admin already exists.');
        }

        // 2. Loop through Experts and create accounts
        const experts = await Expert.find({});
        console.log(`Found ${experts.length} experts to check/seed.`);

        for (const expert of experts) {
            // Generate a username based on name (e.g., 'John Doe' -> 'JohnDoe')
            // Remove spaces and special chars
            const cleanName = expert.name.replace(/[^a-zA-Z0-9]/g, '');
            const expertUsername = cleanName;
            const defaultPassword = 'Expert@123';

            let expertUser = await User.findOne({ expertId: expert._id });

            if (!expertUser) {
                // Check if username is taken by another user (rare conflict)
                const usernameExists = await User.findOne({ username: expertUsername });
                const finalUsername = usernameExists ? `${expertUsername}${Math.floor(Math.random() * 1000)}` : expertUsername;

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(defaultPassword, salt);

                expertUser = new User({
                    username: finalUsername,
                    password: hashedPassword,
                    role: 'expert',
                    expertId: expert._id
                });
                await expertUser.save();
                console.log(`[SUCCESS] Expert User created: ${finalUsername} / ${defaultPassword}`);
            } else {
                // console.log(`[INFO] User already exists for expert: ${expert.name}`);
            }
        }

        console.log('Seeding Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedUsers();
