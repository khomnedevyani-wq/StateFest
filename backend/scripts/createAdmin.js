const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment config
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const connectDB = require('../config/db');

const createAdminAndDemoUser = async () => {
  try {
    await connectDB();

    console.log('[Setup] Initializing Administrator and Demo Student accounts...');

    // 1. Admin Account
    const adminEmail = 'admin@statefest.in';
    const adminPasswordRaw = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPasswordRaw, salt);

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      adminUser.passwordHash = adminPasswordHash;
      adminUser.role = 'admin';
      await adminUser.save();
      console.log(`[Setup] Existing Admin account updated: ${adminEmail}`);
    } else {
      adminUser = await User.create({
        name: 'StateFest Administrator',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        phone: '9820012345',
        college: 'State Directorate of Technical Education (DTE), Mumbai',
        course: 'System Administration',
        academicYear: 'Final Year',
        role: 'admin'
      });
      console.log(`[Setup] New Admin account created: ${adminEmail}`);
    }

    // 2. Demo Student Account
    const studentEmail = 'student@demo.com';
    const studentPasswordRaw = 'Pass@123';
    const studentPasswordHash = await bcrypt.hash(studentPasswordRaw, salt);

    let studentUser = await User.findOne({ email: studentEmail });
    if (studentUser) {
      studentUser.passwordHash = studentPasswordHash;
      studentUser.role = 'student';
      await studentUser.save();
      console.log(`[Setup] Existing Demo Student account updated: ${studentEmail}`);
    } else {
      studentUser = await User.create({
        name: 'Aarav Deshmukh',
        email: studentEmail,
        passwordHash: studentPasswordHash,
        phone: '9833112233',
        college: 'VJTI Mumbai',
        course: 'BSc Information Technology',
        academicYear: 'Third Year (TY)',
        role: 'student'
      });
      console.log(`[Setup] New Demo Student account created: ${studentEmail}`);
    }

    console.log('=======================================================');
    console.log(' Credentials Ready for Demonstration & Viva:');
    console.log(' ---------------------------------------------------');
    console.log(` Administrator:`);
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPasswordRaw}`);
    console.log(`   Role:     admin`);
    console.log(' ---------------------------------------------------');
    console.log(` Demo Student:`);
    console.log(`   Email:    ${studentEmail}`);
    console.log(`   Password: ${studentPasswordRaw}`);
    console.log(`   Role:     student`);
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Setup] Error creating accounts: ${error.message}`);
    process.exit(1);
  }
};

createAdminAndDemoUser();
