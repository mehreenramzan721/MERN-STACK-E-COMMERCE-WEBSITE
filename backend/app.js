const express = require('express');
// cookie parser
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
// middleware for error
const errorMiddleware = require('./middleware/error');

// importing the routes: 
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');

app.use('/api/v1', product);
app.use('/api/v1', user);

// middleware for error
app.use(errorMiddleware);

module.exports = app;