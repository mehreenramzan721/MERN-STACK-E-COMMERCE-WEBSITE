const app = require('./app');
const connectDB = require('./config/database');
const dotenv = require('dotenv');

// handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1);
});

// cast error:  mongo db incomplete id error
if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
}


//config:
dotenv.config({ path: 'backend/config/config.env' });

// db connection 
// make sure that this will be called after the config.env file is loaded
connectDB();

// setting up server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port https://localhost:${process.env.PORT}`);

})

// unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1);
    });
});