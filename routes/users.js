var express = require('express');
var router = express.Router();

require('../models/connection');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const uniqid = require('uniqid');
const nodemailer = require('nodemailer');


const User = require('../models/users');
const Recipe = require('../models/recipes');


// Route to sign up a new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (username.length < 6) {
      res.status(400).json({ message: 'Username must be at least 6 characters long' });
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'This username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'This email already exists' });
      }
    }

    else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const token = uid2(64);
      const newUser = new User({
        username,
        email,
        password: hash,
        token,
        ingredients: [],
        favourites: [],
        avatar: ''
      });
      await newUser.save();
      res.json({ username, token });
      console.log(`User ${username} signed up successfully`);
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
        console.log(`User ${user.username} logged in successfully`);
      }
      else {
        res.status(401).json({ result: false, message: 'There seems to be an issue with your username or password' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Route to update the user's username
router.put('/updateUsername', async (req, res) => {
  try {
    const { token, newUsername } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'This username already exists' });
    }
    user.username = newUsername;
    await user.save();
    res.json({ message: 'Username updated successfully', username: newUsername });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to update the user's password
router.put('/updatePassword', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    user.password = hash;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to update the user's email
router.put('/updateEmail', async (req, res) => {
  try {
    const { token, newEmail } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'This email already exists' });
    }
    user.email = newEmail;
    await user.save();
    res.json({ message: 'Email updated successfully', email: newEmail });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// Route to get user information
router.get('/userInformation/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token }).populate('favourites');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
    }
    else {
      console.log(`User found: ${user.username}`);
      res.json(user)
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Route if user forgets password, send email with nodemailer
router.post('/forgotPassword', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({ message: 'This email does not exist' });
    }
    else {
      const newPassword = uniqid();
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      user.password = hash;
      await user.save();

      require('dotenv').config();
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },

      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your new password',
        text: `Your new password is: ${newPassword}`
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).json({ message: 'An error occurred while sending the email' });
        } else {
          console.log('Email sent: ' + info.response);
          res.json({ message: 'Email sent successfully' });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Add avatar to user's profile
router.post('/addAvatar/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const avatar = req.body.avatar;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar not provided' });
    }
    user.avatar = avatar;
    await user.save();
    res.json({ message: 'Avatar added successfully', avatar: avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add newly loaded recipe to the Recipe collection
router.post('/addRecipeToCollection', async (req, res) => {
  try {
    const recipeData = req.body.recipe;
    // Check if the recipe already exists in the database
    let recipe = await Recipe.findOne({ id: recipeData.id });
    // If the recipe does not exist, save it to the database
    if (!recipe) {
      recipe = new Recipe({
        id: recipeData.id,
        title: recipeData.title,
        additionalData: recipeData
      });
      await recipe.save();
      console.log(`Recipe ${recipeData.id} saved to the database`);
    } else {
      // If the recipe already exists, log it
      console.log(`Recipe ${recipeData.id} already exists in the database`);
    }
    res.json({ message: `Recipe ${recipeData.id} successfully added to the database` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a recipe to the user's favourites
router.post('/addFavourite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const recipeData = req.body.recipe;

    if (!recipeData) {
      return res.status(400).json({ message: 'No recipe data provided' });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    let recipe;

    if (recipeData.analyzedInstructions) {
      // If the full recipe data is provided, save it
      recipe = new Recipe({
        id: recipeData.id,
        title: recipeData.title,
        additionalData: recipeData,
      });
      await recipe.save();
      console.log(`Recipe ${recipeData.id} saved to the database`);
    } else {
      // If only the ID is provided, retrieve the existing recipe
      recipe = await Recipe.findOne({ id: recipeData.id });
      if (!recipe) {
        return res.status(400).json({ message: 'Recipe not found in the database' });
      }
    }

    if (user.favourites.includes(recipe._id)) {
      return res.status(400).json({ message: 'Recipe is already in favourites' });
    }

    user.favourites.push(recipe._id);
    await user.save();

    await user.populate('favourites');
    console.log(`Recipe ${recipeData.id} added to favourites`);
    res.json({ favourites: user.favourites });
  } catch (err) {
    console.error('Error adding recipe to favourites:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to check if a recipe exists in the database
router.get('/checkExistence/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findOne({ id: recipeId });

    if (recipe) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking recipe existence:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Route to remove a recipe from the user's favorites
router.delete('/removeFavourite/:token/:recipeId', async (req, res) => {
  try {
    const { token, recipeId } = req.params;

    console.log(`Removing recipe ${recipeId} from favourites for token ${token}`);

    // Find the user by token
    const user = await User.findOne({ token: token });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if the recipe exists
    const recipe = await Recipe.findOne({ id: recipeId });
    if (!recipe) {
      console.log(`Recipe ${recipeId} not found in the database`);
      return res.status(400).json({ message: 'Recipe not found in the database' });
    }

    // Check if the recipe is in the user's favourites
    if (!user.favourites.includes(recipe._id)) {
      console.log('Recipe is not in favourites');
      return res.status(400).json({ message: 'Recipe is not in favourites' });
    }

    // Remove the recipe's ObjectId from the user's favourites
    user.favourites = user.favourites.filter(favourite => !favourite.equals(recipe._id));
    await user.save();

    console.log(`Recipe ${recipeId} removed from favourites`);
    res.json({ favourites: user.favourites });
  } catch (err) {
    console.error('Error removing recipe from favourites:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// fetch user's favourites
router.get('/fetchFavourites/:token', async (req, res) => {
  try {
    const { token } = req.params;

    console.log(`Fetching favourites for user with token ${token}`);

    // Find the user by token
    const user = await User.findOne({ token: token }).populate('favourites');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    // Populate the favourites with recipe details
    const favourites = await Recipe.find({ _id: { $in: user.favourites } });

    console.log('Fetched favourites:', favourites.map(favourite => favourite.id));
    res.json({ favourites });
  } catch (err) {
    console.error('Error fetching favourites:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Add ingredient to user's collection
router.post('/addIngredient/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
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
        // Add the new ingredient to the user's collection
        user.ingredients.push(newIngredient);
        // Add the new ingredient to the list of added ingredients
        addedIngredients.push(newIngredient);
      }
    }

    await user.save();

    // Respond with the added ingredients
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
      return res.status(401).json({ message: 'User not found' });
    }

    const { ingredient } = req.body;

    if (!ingredient) {
      return res.status(400).json({ message: 'No ingredient provided' });
    }

    // Remove the ingredient from the user's collection
    user.ingredients = user.ingredients.filter(ing => !ingredient.includes(ing.name));
    await user.save();
    res.json({ ingredients: `${ingredient} removed successfully` });
    console.log(`${ingredient} removed successfully`);

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
      return res.status(401).json({ message: 'User not found' });
    }
    const ingredients = user.ingredients;
    res.json({ ingredients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
);

// Route to fetch all recipes from the database, not used in the app
router.get('/fetchAllRecipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to fetch a recipe by id from database to display on the recipe page
router.get('/fetchRecipe/:recipeId', async (req, res) => {
  try {
    const recipeId = req.params.recipeId;

    const recipe = await Recipe.findOne({ id: recipeId });
    console.log(`Fetching recipe ${recipeId}`);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not in database' });
    }
    console.log("Recipe found")
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to delete user's account
router.delete('/deleteAccount/:token', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });
    console.log(`Deleting account for user ${user.username}`);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    await User.deleteOne({ token });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
