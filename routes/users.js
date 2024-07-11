var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
require('../models/connection');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');

const User = require('../models/users');
const Ingredient = require('../models/ingredients');

// Route to sign up a new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username.length < 6) {
      res.status(400).json({ message: 'Username must be at least 6 characters long' });
    }
    else if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User
      .findOne({ username: username });
    if (user) {
      res.status(400).json({ message: 'This username already exists' });
    }
    else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const token = uid2(64);
      const newUser = new User({
        username: username,
        password: hash,
        token: token,
        ingredients: [],
        favourites: [],
      });
      await newUser.save();
      res.json({ username: username, token: token });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Route to log in an existing user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User
      .findOne({ username: username });
    if (!user) {
      res.status(401).json({ result: false, message: 'Username or password incorrect' });
    }
    else {
      if (bcrypt.compareSync(password, user.password)) {
        res.json({ result: true, username: user.username, token: user.token });
      }
      else {
        res.status(401).json({ result: false, message: 'Unauthorized' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Route to get user information
router.get('/userInformation/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User
      .findOne
      ({ token: token });
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
    }
    else {
      console.log(`User found: ${user}`);
      res.json(user)
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);


// Route to add a recipe to the user's favorites
router.post('/addFavourite/:recipeId/:token', async (req, res) => {
  try {
    const { recipeId, token } = req.params;
    console.log(`Adding recipe ${recipeId} to favorites for token ${token}`);

    // Find the user by token
    const user = await User.findOne({ token: token });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the recipe is already in the user's favourites
    if (user.favourites.includes(recipeId)) {
      console.log('Recipe is already in favourites');
      return res.status(400).json({ message: 'Recipe is already in favourites' });
    }

    // Add the recipe to the user's favourites
    user.favourites.push(recipeId);
    await user.save();
    console.log(`Recipe ${recipeId} added to favourites`);
    res.json({ favourites: user.favourites });
  } catch (err) {
    console.error('Error adding recipe to favourites:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to remove a recipe from the user's favorites
router.delete('/removeFavourite/:recipeId/:token', async (req, res) => {
  try {
    const { recipeId, token } = req.params;
    console.log(`Removing recipe ${recipeId} from favorites for token ${token}`);

    const user = await User.findOne({ token: token });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the recipe is in the user's favourites
    if (!user.favourites.includes(recipeId)) {
      console.log('Recipe is not in favourites');
      return res.status(400).json({ message: 'Recipe is not in favourites' });
    }

    // Remove the recipe from the user's favourites
    user.favourites = user.favourites.filter(favourite => favourite !== recipeId);
    await user.save();
    console.log(`Recipe ${recipeId} removed from favourites`);
    res.json({ favourites: user.favourites });
  } catch (err) {
    console.error('Error removing recipe from favourites:', err.message);
    res.status(500).json({ message: err.message });
  }
}
);

// fetch user's favourites
router.get('/fetchFavourites/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const favourites = user.favourites;
    res.json({ favourites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Add ingredients to the user's collection
// router.post('/addIngredient/:token', async (req, res) => {
//   try {
//     const token = req.params.token;
//     const user = await User.findOne({ token: token });
//     if (!user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const { ingredients } = req.body;
//     let addedIngredients = [];
//     for (let name of ingredients) {
//       const ingredientExists = user.ingredients.some(ingredient => ingredient.name === name);

//       if (!ingredientExists) {
//         user.ingredients.push({ name: name });
//         addedIngredients.push({ name: name });
//       }
//     }
//     await user.save();
//     // Respond with only the added ingredients to avoid sending back the entire collection
//     res.json({ ingredients: addedIngredients });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post('/addIngredient/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { ingredients } = req.body;

    let addedIngredients = [];

    for (let ingredient of ingredients) {
      const { name } = ingredient;

      const ingredientExists = user.ingredients.some(item => item.name === name);

      if (!ingredientExists) {
        const newIngredient = {
          name: name,
          dateAdded: new Date()
        };
        user.ingredients.push(newIngredient);
        addedIngredients.push(newIngredient);
      }
    }

    await user.save();

    // Respond with only the added ingredients to avoid sending back the entire collection
    res.json({ ingredients: addedIngredients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Remove ingredient from user's collection
router.delete('/removeIngredient/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { ingredient } = req.body;

    if (!ingredient) {
      return res.status(400).json({ message: 'No ingredient provided' });
    }
    // user.ingredients = user.ingredients.filter(ing => ing.name !== ingredient);
    // await user.save();
    // res.json({ ingredients: user.ingredients });
    user.ingredients = user.ingredients.filter(ing => !ingredient.includes(ing.name));
    await user.save();
    res.json({ ingredients: user.ingredients });

  } catch (err) {
    console.error(`Error during ingredient removal: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});


// Fetch user's ingredients from database
router.get('/fetchIngredients/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const ingredients = user.ingredients;
    res.json({ ingredients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);


module.exports = router;
