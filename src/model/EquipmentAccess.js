const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const Equipment = require("./Equipment");
const AccessCategory = require("./AccessCategory");

const EquipmentAccess = sequelize.define(
    "equipment_access",
    {
        equipment_name: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: {
                model: Equipment,
                key: "name",
            },
            onDelete: "CASCADE",
        },
        access_category_name: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: {
                model: AccessCategory,
                key: "name",
            },
            onDelete: "CASCADE",
        },
    },
    {
        timestamps: false,
    }
);

module.exports = EquipmentAccess;
