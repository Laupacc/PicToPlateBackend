const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        required: true
    },
});

const Ingredient = mongoose.model('ingredients', ingredientSchema);

module.exports = Ingredient;

