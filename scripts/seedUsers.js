// backend/scripts/seedUsers.js
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config();

async function seedUsers() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.DATABASE_URL);

    // Clear Test Users
    await User.deleteMany({ isTestUser: true });

    const usersToCreate = 50;
    const users = [];

    for (let i = 0; i < usersToCreate; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestUser123!', salt);

      users.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        isTestUser: true,
      });
    }

    const createdUsers = await User.insertMany(users);

    console.log(`${createdUsers.length} test users created`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Only run if script is called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;