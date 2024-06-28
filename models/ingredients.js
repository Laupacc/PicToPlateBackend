const mongoose = require('mongoose');

const ingredientsSchema = new mongoose.Schema({
    ingredientsId: String,
});

const Ingredients = mongoose.model('ingredients', ingredientsSchema);

module.exports = Ingredients;

