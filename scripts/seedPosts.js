const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');

dotenv.config();

async function seedPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);

    // Find all test users
    const users = await User.find({ isTestUser: true });

    await Post.deleteMany({ isTestPost: true });

    // Track total posts created
    let totalPostsCreated = 0;

    // Generate 3-5 posts for each user
    for (const user of users) {
      const userPosts = Array.from(
        { length: faker.number.int({ min: 3, max: 5 }) },
        () => ({
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs({ min:1, max:27 }),
          author: user.username,
          userId: user._id,
          isTestPost: true
        })
      );

      // Insert posts and get their IDs
      const createdPosts = await Post.insertMany(userPosts);
      const postIds = createdPosts.map((post) => post._id);

      // Update the user's posts array
      await User.findByIdAndUpdate(
        user._id,
        { $push: { posts: { $each: postIds } } },
        { new: true }
      );

      totalPostsCreated += createdPosts.length;
    }

    console.log(`Created ${totalPostsCreated} posts for test users`);

    // Close connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
}

// Only run if script is called directly
if (require.main === module) {
  seedPosts();
}

module.exports = seedPosts;