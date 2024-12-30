const CustomError = require('./CustomError');

const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};

module.exports = errorHandler;