
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('../models/Expert');

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const seedExperts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        const filePath = path.join(__dirname, '../../excelData/Team Contack Details.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log(`Found ${data.length} records in Excel`);

        // Clear existing experts
        await Expert.deleteMany({});
        console.log('Cleared existing experts');

        // Map and Insert
        const expertsToInsert = data.map(item => ({
            name: item['Name'],
            designation: item['Designation'] || 'Consultant',
            contact: item['Company Email ID'] || '',
            expertise: ['General Support'],
            profileImage: '' // Placeholder
        })).filter(e => e.name); // Filter out empty rows if any

        await Expert.insertMany(expertsToInsert);
        console.log(`Inserted ${expertsToInsert.length} experts`);

        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedExperts();
