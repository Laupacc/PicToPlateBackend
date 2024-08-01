var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
require('../models/connection');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Not used in the project
router.get('/trivia', async (req, res) => {
    try {
        const response = await fetch(`https://api.spoonacular.com/food/trivia/random?apiKey=${SPOONACULAR_API_KEY}`);
        const trivia = await response.json(); // Correctly await and parse the JSON response
        res.json(trivia); // Send the trivia data as the response
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Not used in the project
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

// Not used in the project
router.get('/findByIngredients', async (req, res) => {
    const ingredients = req.query.ingredients;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&apiKey=${SPOONACULAR_API_KEY}`);
        const recipes = await response.json();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/complexSearchByIngredients', async (req, res) => {
    const { ingredients, diet, intolerances, maxReadyTime, number, offset } = req.query;
    let URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&includeIngredients=${ingredients}&number=${number}`;
    if (diet) {
        URL += `&diet=${diet}`;
    }
    if (intolerances) {
        URL += `&intolerances=${intolerances}`;
    }
    if (maxReadyTime) {
        URL += `&maxReadyTime=${maxReadyTime}`;
    }
    if (offset) {
        URL += `&offset=${offset}`;
    }
    try {
        const response = await fetch(URL);
        const recipes = await response.json();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/recipeInformation/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?addWinePairing=true&includeNutrition=true&apiKey=${SPOONACULAR_API_KEY}`);
        const recipe = await response.json();
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/analyzedInstructions/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`);
        const instructions = await response.json();
        res.json(instructions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Not used in the project
router.get('/similarRecipes/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${id}/similar?apiKey=${SPOONACULAR_API_KEY}`);
        const recipes = await response.json();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/autocompleteIngredients', async (req, res) => {
    const query = req.query.query;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=10&apiKey=${SPOONACULAR_API_KEY}`);
        const ingredients = await response.json();
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/ingredientInformation/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${SPOONACULAR_API_KEY}`);
        const ingredient = await response.json();
        res.json(ingredient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/ingredientSubstitutes/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/substitutes?apiKey=${SPOONACULAR_API_KEY}`);
        const substitutes = await response.json();
        res.json(substitutes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Not used in the project
router.get('/menuItemsInfo/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/menuItems/${id}?apiKey=${SPOONACULAR_API_KEY}`);
        const menuItems = await response.json();
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/winePairing/:food', async (req, res) => {
    const food = req.params.food;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/wine/pairing?food=${food}&apiKey=${SPOONACULAR_API_KEY}`);
        const wine = await response.json();
        res.json(wine);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Not used in the project
router.get('/wineDescription/:wine', async (req, res) => {
    const wine = req.params.wine;
    try {
        const response = await fetch(`https://api.spoonacular.com/food/wine/description?wine=${wine}&apiKey=${SPOONACULAR_API_KEY}`);
        const description = await response.json();
        res.json(description);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/convertAmount', async (req, res) => {
    const { ingredientName, sourceAmount, sourceUnit, targetUnit } = req.query;
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=${ingredientName}&sourceAmount=${sourceAmount}&sourceUnit=${sourceUnit}&targetUnit=${targetUnit}&apiKey=${SPOONACULAR_API_KEY}`);
        const convertedAmount = await response.json();
        res.json(convertedAmount);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
