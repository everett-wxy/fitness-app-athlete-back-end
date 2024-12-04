const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
        return res
            .status(400)
            .json({ status: "error", message: "Token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.decoded = decoded;
        next();

    } catch (error) {
        console.error("Authorisation failed: ", error.message);
        return res.status(403).json({
            status: "error",
            msg: "Not authorised: " + error.message,
        });
    }
};

module.exports = { authenticateToken };
