const User = require("../model/users"); // import User model
const bcrypt = require("bcrypt");

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

        const user = await User.create({
            email: email,
            hashed_password: hashed_password,
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            user: { email: user.email, hashed_password: user.hashed_password }, // Exclude the password from the response
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

module.exports = register;
