const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const config = require('./config/index');
const User = require('./models/user');

const seedAdmin = async () => {
  try {
    console.log('🌱 Connecting to database...');
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.CONNECTION_STRING || process.env.CONNECTION_STRING);
    console.log('✅ Connected to MongoDB');

    const adminUsername = 'umar';
    const adminPasswordPlain = 'umar214365';
    const adminEmail = 'mrumar4722@gmail.com';
    const adminName = 'Muhammad Umar';

    const hashedPassword = await bcrypt.hash(adminPasswordPlain, 10);

    let admin = await User.findOne({ 
      $or: [{ username: adminUsername }, { email: adminEmail }] 
    });

    if (admin) {
      console.log(`ℹ️ User '${adminUsername}' already exists. Updating credentials & role to admin...`);
      admin.username = adminUsername;
      admin.name = adminName;
      admin.email = adminEmail;
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('🎉 Admin user updated successfully!');
    } else {
      console.log(`🚀 Creating new admin user '${adminUsername}'...`);
      admin = new User({
        name: adminName,
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('🎉 Admin user created successfully!');
    }

    console.log('-------------------------------------------');
    console.log('👑 Admin Credentials:');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPasswordPlain}`);
    console.log(`   Role:     admin`);
    console.log('-------------------------------------------');

    await mongoose.disconnect();
    console.log('✅ Disconnected from database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during admin seeding:', error);
    process.exit(1);
  }
};

seedAdmin();
