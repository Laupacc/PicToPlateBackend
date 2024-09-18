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
app.use(express.json({ limit: '50mb' })); ``
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for global request count
let globalRequestCount = 0;
const GLOBAL_REQUEST_LIMIT = 1500;

// Middleware to check global request count
const globalRateLimiter = (req, res, next) => {
    if (globalRequestCount >= GLOBAL_REQUEST_LIMIT) {
        return res.status(429).json({
            message: 'Global request limit exceeded. Please try again in 24 hours.'
        });
    }
    globalRequestCount++;
    next();
};

// Rate limiter middleware
const individualLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 250, // limit each IP to 100 requests per windowMs
    message: 'You have exceeded the request limit. Please try again in 24 hours.'
});

app.use(globalRateLimiter);
app.use(individualLimiter);

// Reset global request count every 24 hours
setInterval(() => {
    globalRequestCount = 0;
}, 24 * 60 * 60 * 1000); // 24 hours

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);

module.exports = app;
