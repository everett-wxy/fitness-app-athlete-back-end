const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const User = require("./User");

const PhysicalMeasurement = sequelize.define(
    "physical_measurement",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true, // Surrogate key
            primaryKey: true, // Unique identifier for each row
        },
        user_id: {
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
                fields: ["user_id", "date_time"],
            },
        ],
    }
);

module.exports = PhysicalMeasurement;
