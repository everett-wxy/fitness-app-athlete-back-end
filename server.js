const express = require("express");
const cors = require("cors");
require("dotenv").config();

//import routers
const auth = require("./src/routers/auth");
const update = require("./src/routers/updateUser");
const workoutProgram = require("./src/routers/workoutProgram");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", auth);
app.use("/", update);
app.use('/', workoutProgram)

app.listen(process.env.PORT || 5001, () => {
    console.log(`App is listening on: ${process.env.PORT || 3000}`);
});
