const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const AccessCategory = sequelize.define(
    "access_category",
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

module.exports = AccessCategory;