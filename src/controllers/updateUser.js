const pool = require("../db/db"); // Import pg pool instance

const updateUser = async (req, res) => {
    const { firstName, lastName, dob, gender } = req.body;
    const userId = req.decoded.userId;

    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.rows[0];

        const updatedUser = await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2, date_of_birth = $3, gender = $4 WHERE id = $5 RETURNING*",
            [
                firstName || user.first_name,
                lastName || user.last_name,
                dob || user.date_of_birth,
                gender || user.gender,
                userId,
            ]
        );

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

const createPhysicalMeasurement = async (req, res) => {
    try {
        const { weight, height } = req.body;
        const userId = req.decoded.userId;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        await pool.query(
            "INSERT INTO physical_measurements (user_id, weight, height) VALUES ($1, $2, $3)",
            [userId, weight, height]
        );

        return res.status(201).json({
            message: "User physcial measurement created successfully",
        });
    } catch (error) {
        console.error("Error creating physical measurement: ", error);
        res.status(500).json({
            status: "error",
            message: "Error creating physical measurement",
            error: error.message,
        });
    }
};

const createTrainingPreference = async (req, res) => {
    try {
        const {
            trainingGoal,
            availableDaysToTrain,
            availableTimetoTrain,
            startingFitnessLevel,
        } = req.body;
        const userId = req.decoded.userId;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingPreferenceResult = await pool.query(
            "SELECT * FROM training_preferences WHERE user_id = $1",
            [userId]
        );

        if (existingPreferenceResult.rowCount > 0) {
            await pool.query(
                "UPDATE training_preferences SET training_goal = $1, training_days_per_week = $2, training_time_per_session = $3, starting_fitness_level = $4 WHERE user_id = $5",
                [
                    trainingGoal ||
                        existingPreferenceResult.rows[0].training_goal,
                    availableDaysToTrain ||
                        existingPreferenceResult.rows[0].training_days_per_week,
                    availableTimetoTrain ||
                        existingPreferenceResult.rows[0]
                            .training_time_per_session,
                    startingFitnessLevel ||
                        existingPreferenceResult.rows[0].starting_fitness_level,
                    userId,
                ]
            );

            return res.status(200).json({
                message: "User preference updated successfully",
            });
        } else {
            await pool.query(
                "INSERT INTO training_preferences (user_id, training_goal, training_days_per_week, training_time_per_session, starting_fitness_level) VALUES ($1, $2, $3, $4, $5)",
                [
                    userId,
                    trainingGoal,
                    availableDaysToTrain,
                    availableTimetoTrain,
                    startingFitnessLevel,
                ]
            );

            return res.status(201).json({
                message: "User preference created successfully",
            });
        }
    } catch (error) {
        console.error("Error creating training preferences: ", error);
        res.status(500).json({
            status: "error",
            message: "Error creating training preferences",
            error: error.message,
        });
    }
};

const updateAccessToEquipements = async (req, res) => {
    try {
        const { accessToEquipmentLevel } = req.body;
        const userId = req.decoded.userId;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const matchingEquipmentsResult = await pool.query(
            "SELECT * FROM equipment_access WHERE access_category_name = $1",
            [accessToEquipmentLevel]
        );

        if (matchingEquipmentsResult.rowCount === 0) {
            return res.status(404).json({
                error: "No match found for equipment with current access level",
            });
        }

        const userAccessToEquipment = matchingEquipmentsResult.rows.map(
            (equipment) => ({
                user_id: userId,
                equipment_name: equipment.equipment_name,
            })
        );

        for (let equipment of userAccessToEquipment) {
            await pool.query(
                "INSERT INTO user_equipment (user_id, equipment_name) VALUES ($1, $2) ON CONFLICT (user_id, equipment_name) DO NOTHING",
                [equipment.user_id, equipment.equipment_name]
            );
        }

        res.status(200).json({
            status: "success",
            message: "User equipment access updated successfully",
        });
    } catch (error) {
        console.error("Error updating user equipment access: ", error);
        res.status(500).json({
            status: "error",
            message: "Error updating user equipment access",
            error: error.message,
        });
    }
};
module.exports = {
    updateUser,
    createPhysicalMeasurement,
    createTrainingPreference,
    updateAccessToEquipements,
};
