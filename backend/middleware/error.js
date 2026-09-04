const errorHandler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.errorMessage = err.errorMessage || 'Internal Server Error';

    res.status(err.statusCode).json({
        success: false,
        errorMessage: err.errorMessage,
    });
}