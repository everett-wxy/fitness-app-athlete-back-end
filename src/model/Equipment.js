const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const Equipment = sequelize.define(
    "equipment",
    {
        name: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = Equipment;