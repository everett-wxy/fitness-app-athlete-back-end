const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
    },
    last_name: {
        type: DataTypes.STRING,
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
    },
    gender: {
        type: DataTypes.STRING,
    },
    hashed_password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const UserTrainingPreference = sequelize.define("user_training_preference", {
    userId: {
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
        allowNull: false,
    },
    training_days_per_week: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    training_time_per_session: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const UserPhysicalMeasurement = sequelize.define(
    "user_physical_measurement",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true, // Surrogate key
            primaryKey: true, // Unique identifier for each row
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User, // Referencing the User model
                key: "id",
            },
            onDelete: "CASCADE", // Delete all related measurements if user is deleted
        },
        date_time: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW, // Automatically sets the current timestamp
            allowNull: false,
        },
        weight: {
            type: DataTypes.DECIMAL(5, 2), // Allows up to two decimal places
            allowNull: false,
        },
        height: {
            type: DataTypes.INTEGER, // Store height as an integer
            allowNull: false,
        },
    },
    {
        timestamps: false, // Prevent Sequelize from adding createdAt and updatedAt fields
        indexes: [
            {
                unique: true, // Ensure no duplicate rows for userId + date_time
                fields: ["userId", "date_time"],
            },
        ],
    }
);

User.hasOne(UserTrainingPreference, { foreignKey: "userId" });
UserTrainingPreference.belongsTo(User, { foreignKey: "userId" });

User.hasMany(UserPhysicalMeasurement, { foreignKey: "userId" });
UserPhysicalMeasurement.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, UserTrainingPreference, UserPhysicalMeasurement };
