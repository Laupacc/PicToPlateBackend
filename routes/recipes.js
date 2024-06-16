var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const { checkBody } = require('../modules/checkBody');
require('../models/connection');

const Recipe = require('../models/recipes');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

router.get('/trivia', async (req, res) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/food/trivia/random?apiKey=${SPOONACULAR_API_KEY}`);
        const trivia = await response.json(); // Correctly await and parse the JSON response
        res.json(trivia); // Send the trivia data as the response
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/joke', async (req, res) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/food/jokes/random?apiKey=${SPOONACULAR_API_KEY}`);
        const joke = await response.json();
        res.json(joke);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/randomRecipe', async (req, res) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}`);
        const recipe = await response.json();
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
