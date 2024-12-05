const { User } = require("../model/index"); // import User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const duplicateEmail = await User.findOne({ where: { email } });
        if (duplicateEmail) {
            return res.status(400).json({
                status: "error",
                message:
                    "There is already an account associated with this email.",
            });
        }
        const hashed_password = await bcrypt.hash(password, 10);

        const createdUser = await User.create({
            email: email,
            hashed_password: hashed_password,
        });

        const claims = { userId: createdUser.id };

        const token = jwt.sign(claims, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30d",
            jwtid: uuidv4(),
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            token,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            status: "error",
            message: "Error creating user",
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res
                .status(400)
                .json({ status: "error", msg: "Account does not exist" });
        }

        const match = await bcrypt.compare(
            req.body.password,
            user.hashed_password
        );
        if (!match) {
            return res
                .status(400)
                .json({ status: "error", msg: "Password is incorrect" });
        }
        // jwt (store data in payload/claims)
        const claims = { email: user.email };

        // create accessToken
        const accessToken = jwt.sign(claims, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
            jwtid: uuidv4(),
        });

        // create refreshToken
        const refreshToken = jwt.sign(
            claims,
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: "30d",
                jwtid: uuidv4(),
            }
        );
        // pass accessToken and refreshToken
        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "error logging in" });
    }
};


module.exports = { register, login };
