const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    imageUri: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
});

const Recipe = mongoose.model('recipes', recipeSchema);

module.exports = Recipe;

