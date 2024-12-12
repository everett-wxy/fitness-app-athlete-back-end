const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../db/db"); // Import pg pool instance

const register = async (req, res) => {
    try {
        const { email, password, role="user" } = req.body;

        // const duplicateEmail = await User.findOne({ where: { email } });
        const duplicateEmailResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (duplicateEmailResult.rowCount > 0) {
            return res.status(400).json({
                status: "error",
                message:
                    "There is already an account associated with this email.",
            });
        }
        const hashed_password = await bcrypt.hash(password, 10);

        const insertUserResult = await pool.query(
            "INSERT INTO users (email, hashed_password, role) VALUES ($1, $2, $3) RETURNING id",
            [email, hashed_password, role]
        );

        const userId = insertUserResult.rows[0].id;
        const userRole = insertUserResult.rows[0].role;

        console.log(insertUserResult.rows[0]);

        const claims = { userId, userRole };
        console.log('register claims: ', claims);

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
        const { email, password } = req.body;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rowCount === 0) {
            return res.status(400).json({
                status: "error",
                message: "Account does not exist",
            });
        }

        const user = userResult.rows[0];
        const role = user.role;

        const match = await bcrypt.compare(password, user.hashed_password);

        if (!match) {
            return res
                .status(400)
                .json({ status: "error", msg: "Password is incorrect" });
        }
        // jwt (store data in payload/claims)
        const claims = { email: user.email, userId: user.id, role};
        console.log('log in claims: ', claims);

        // create accessToken
        const accessToken = jwt.sign(claims, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30d",
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
