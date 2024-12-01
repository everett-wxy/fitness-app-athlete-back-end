const express = require("express");
const sequelize = require("./src/db/db"); // import sequelize instance
const User = require("./src/model/users"); // import User model
const register = require("./src/controllers/auth");

const app = express();
const port = 3000;

app.use(express.json());

// sync models with DB
async function syncDatabase() {
    try {
        await sequelize.sync({ force: true });
        console.log("DB synced");
    } catch (error) {
        console.error("Error syncing DB: ", error);
    }
}

// syncDatabase();

app.post("/users", register);

app.listen(port, () => {
    console.log("App is listening on: ", port);
});
