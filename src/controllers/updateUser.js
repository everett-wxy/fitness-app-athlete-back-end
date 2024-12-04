const { User, UserPhysicalMeasurement } = require("../model/users"); // import User model

const updateUser = async (req, res) => {
    const { firstName, lastName, dob, gender } = req.body;
    const userId = req.decoded.userId;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error("user not found");
        }

        user.first_name = firstName || user.first_name;
        user.last_name = lastName || user.last_name;
        user.date_of_birth = dob || user.date_of_birth;
        user.gender = gender || user.gender;

        await user.save();

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            status: "error",
            message: "Error updating user",
            error: error.message,
        });
    }
};

const createUserPhysicalMeasurement = async (req, res) => {
    try {
        const { weight, height } = req.body;
        const userId = req.decoded.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const newPhysicalMeasurement = await UserPhysicalMeasurement.create({
            userId,
            weight,
            height,
        });

        return res.status(201).json({
            message: "User physcial measurement created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { updateUser, createUserPhysicalMeasurement };
