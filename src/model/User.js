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

module.exports = User;
