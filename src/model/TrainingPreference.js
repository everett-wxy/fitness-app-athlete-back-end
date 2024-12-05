const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const User  = require("./User");

const TrainingPreference = sequelize.define("training_preference", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    training_goal: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    training_days_per_week: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
    training_time_per_session: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    starting_fitness_level: {
        type: DataTypes.STRING,
    },
});

module.exports = TrainingPreference;
