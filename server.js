const express = require("express");
const cors = require("cors");
require("dotenv").config();

//import routers
const auth = require("./src/routers/auth");
const update = require("./src/routers/updateUser");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", auth);
app.use("/", update);

app.listen(process.env.PORT || 5001, () => {
    console.log(`App is listening on: ${process.env.PORT || 3000}`);
});
