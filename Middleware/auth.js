const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['authorization'];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "A Token is Required for Authentication!."
            });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Token is not valid, please enter a valid Token!"
                });
            }
            req.user = decoded;
            next();
        });

    } catch (error) {
        console.error("Getting error for veryfying jwt token:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Sarver error...."
        })
    }
}

module.exports = { verifyToken };