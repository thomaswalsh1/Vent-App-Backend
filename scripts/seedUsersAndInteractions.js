const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

dotenv.config();

async function seedUsersAndInteractions() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.DATABASE_URL);

    // Clear test data
    await User.deleteMany({ isTestUser: true });
    await Post.deleteMany({ isTestPost: true });
    await Like.deleteMany({ isTestLike: true });

    const usersToCreate = 50;
    const users = [];
    const posts = [];
    const specificPostId = new mongoose.Types.ObjectId(); // ID for a specific post to be liked

    // Step 1: Create Users
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

    // Step 2: Create Posts for Each User
    for (const user of createdUsers) {
      const postCount = faker.number.int({ min: 1, max: 5 }); // Each user makes 1-5 posts

      for (let i = 0; i < postCount; i++) {
        posts.push({
          content: faker.lorem.paragraph({min: 25, max: 30}),
          userId: user._id,
          isTestPost: true,
          createdAt: new Date(),
        });
      }
    }

    // Add a specific post for testing purposes
    posts.push({
      _id: specificPostId,
      content: "This is the specific post to be liked by everyone.",
      userId: createdUsers[0]._id,
      isTestPost: true,
      createdAt: new Date(),
    });

    const createdPosts = await Post.insertMany(posts);
    console.log(`${createdPosts.length} test posts created`);

    // Step 3: Like Other Users’ Posts
    const likes = [];
    for (const user of createdUsers) {
      const postsToLike = faker.helpers.arrayElements(createdPosts, faker.number.int({ min: 5, max: 10 })); // Like 5-10 posts

      for (const post of postsToLike) {
        likes.push({
          userId: user._id,
          postId: post._id,
          isTestLike: true,
          createdAt: new Date(),
        });
      }
    }

    // Step 4: Like the Specific Post
    for (const user of createdUsers) {
      likes.push({
        userId: user._id,
        postId: specificPostId,
        isTestLike: true,
        createdAt: new Date(),
      });
    }

    await Like.insertMany(likes);
    console.log(`${likes.length} test likes created`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding users and interactions:', error);
    process.exit(1);
  }
}

// Only run if script is called directly
if (require.main === module) {
  seedUsersAndInteractions();
}

module.exports = seedUsersAndInteractions;
