const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connected to database");
    } catch (error) {
        console.error("Unable to connect", error);
    }
}

testConnection();
module.exports = sequelize;
