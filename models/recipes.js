const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    recipeId: String,
});

const Recipe = mongoose.model('recipes', recipeSchema);

module.exports = Recipe;

