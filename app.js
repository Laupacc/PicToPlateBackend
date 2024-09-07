require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const helmet = require('helmet');

require("./models/connection");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');

const app = express();
app.use(cors());
app.use(helmet());

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiter middleware
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this user, please try again later.'
});

// app.use(limiter);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);

module.exports = app;
