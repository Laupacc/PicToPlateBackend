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
    email: {
        type: String,
        default: '',
        required: false
    },
    token: {
        type: String,
        required: true
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        dateAdded: {
            type: Date,
            default: Date.now,
            required: true
        }
    }],
    favourites: {
        type: Array,
        required: false
    }
});

const User = mongoose.model('users', userSchema);

module.exports = User;

