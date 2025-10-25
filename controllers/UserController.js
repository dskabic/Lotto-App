const User = require('../models/User');

async function createUser(sub, email, name, picture, nickname, email_verified, updated_at) {
    try {
        const existingUser = await User.findUser(sub);
        if (existingUser.rows.length === 0) {
            await User.createUser(nickname, name, picture, updated_at, email, email_verified, sub);
        }
        return;
    } catch (error) {
        console.error("Error creating user:", error);
        return;
    }
}
module.exports = {
    createUser
};