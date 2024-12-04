const express = require("express");
const sequelize = require("./src/db/db"); // import sequelize instance
const User = require("./src/model/users"); // import User model
const cors = require('cors');
require('dotenv').config();

const {register, login, authenticateToken} = require("./src/controllers/auth");
const auth = require('./src/routers/auth');
const update = require('./src/routers/updateUser')

const app = express();
app.use(cors());
app.use(express.json());

// sync models with DB
async function syncDatabase() {
    try {
        // await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        console.log("DB synced");
    } catch (error) {
        console.error("Error syncing DB: ", error);
    }
}
// syncDatabase();

app.use('/', auth);
app.use('/', update);

app.get("/protected", authenticateToken, (req, res) => {
    res.json({ status: "success", message: "You are authenticated!" });
});

app.listen(process.env.PORT || 5001, () => {
    console.log(`App is listening on: ${process.env.PORT || 3000}`);
});