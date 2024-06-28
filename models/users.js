const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: false
    },
    favourites: {
        type: Array,
        required: false
    }
});

const User = mongoose.model('users', userSchema);

module.exports = User;

