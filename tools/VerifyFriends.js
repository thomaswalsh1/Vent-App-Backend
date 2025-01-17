const Follower = require("../models/Follower");
const Post = require("../models/Post");
const User = require("../models/User");

/**
 * Method to check if two users follow each other
 * @param viewerId
 * @param authorId 
 * @returns if the both users follow each other
 */
async function VerifyFriends(viewerId, authorId) {
    try {


        // Verify post is following
        const viewer = await Follower.exists({ viewerId, authorId })
        const author = await Follower.exists({ authorId, viewerId })


        // in case the user sees their own friendsOnly post
        return (viewerId === authorId) || (viewer && author)
    } catch (error) {
        console.error(error);
    }
    return false;
}
module.exports = VerifyFriends;