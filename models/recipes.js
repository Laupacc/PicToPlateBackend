const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    additionalData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

