const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/db");
const User = require("./User");
const Equipment = require("./Equipment");

const UserEquipment = sequelize.define(
    "user_equipment",
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        equipment_name: {
            type: DataTypes.STRING,
            primaryKey: true,
            references: {
                model: Equipment,
                key: "name",
            },
            onDelete: "CASCADE",
        },
    },
    {
        timestamps: false,
    }
);

module.exports = UserEquipment;