const mongoose = require('mongoose');
const config = require('../config/index');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
    try {
        if (!config.ADMIN_USERNAME || !config.ADMIN_PASSWORD) return;

        const existingAdmin = await User.findOne({
            $or: [{ username: config.ADMIN_USERNAME }, { email: config.ADMIN_EMAIL }]
        });

        const hashedPassword = await bcrypt.hash(config.ADMIN_PASSWORD, 10);

        if (!existingAdmin) {
            const adminUser = new User({
                name: config.ADMIN_NAME || 'Admin',
                username: config.ADMIN_USERNAME,
                email: config.ADMIN_EMAIL || 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log(`✅ Admin user "${config.ADMIN_USERNAME}" initialized successfully.`);
        } else {
            let updated = false;
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                updated = true;
            }
            const isMatch = await bcrypt.compare(config.ADMIN_PASSWORD, existingAdmin.password);
            if (!isMatch) {
                existingAdmin.password = hashedPassword;
                updated = true;
            }
            if (updated) {
                await existingAdmin.save();
                console.log(`✅ Admin user "${config.ADMIN_USERNAME}" role/password synced with .env.`);
            }
        }
    } catch (err) {
        console.error('Error checking/seeding admin user:', err.message);
    }
};

const dbConnect = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(config.CONNECTION_STRING);
        console.log("Database connected to host: " + conn.connection.host);

        // Auto seed or sync admin credentials from .env
        await seedAdminUser();
    } catch (error) {
        console.log(`Error: ${error}`);
    }
};

module.exports = dbConnect;