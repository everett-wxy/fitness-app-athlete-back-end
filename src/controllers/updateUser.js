const {
    User,
    PhysicalMeasurement,
    TrainingPreference,
    UserEquipment,
    EquipmentAccess,
} = require("../model/index");

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

const createPhysicalMeasurement = async (req, res) => {
    try {
        const { weight, height } = req.body;
        const userId = req.decoded.userId;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        await PhysicalMeasurement.create({
            user_id: userId,
            weight,
            height,
        });

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

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const existingPreference = await TrainingPreference.findByPk(userId);

        if (existingPreference) {
            // If preference exists, update it
            await existingPreference.update({
                training_goal: trainingGoal || existingPreference.training_goal,
                training_days_per_week:
                    availableDaysToTrain ||
                    existingPreference.training_days_per_week,
                training_time_per_session:
                    availableTimetoTrain ||
                    existingPreference.training_time_per_session,
                starting_fitness_level:
                    startingFitnessLevel ||
                    existingPreference.starting_fitness_level,
            });

            return res.status(200).json({
                message: "User preference updated successfully",
            });
        } else {
            await TrainingPreference.create({
                user_id: userId,
                training_goal: trainingGoal,
                training_days_per_week: availableDaysToTrain,
                training_time_per_session: availableTimetoTrain,
                starting_fitness_level: startingFitnessLevel,
            });

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

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }

        const matchingEquipments = await EquipmentAccess.findAll({
            where: {
                access_category_name: accessToEquipmentLevel,
            },
            raw: true,
        });

        if (!matchingEquipments) {
            return res.status(404).json({
                error: "There's no match to equipment with current access",
            });
        }

        const userAccessToEquipment = matchingEquipments.map((equipment) => ({
            user_id: userId,
            equipment_name: equipment.equipment_name,
        }));

        await UserEquipment.bulkCreate(userAccessToEquipment, {
            ignoreDuplicates: true,
        });

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
