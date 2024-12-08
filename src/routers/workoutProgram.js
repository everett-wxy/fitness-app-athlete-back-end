const express = require("express");

const { generateWorkoutProgram } = require("../controllers/workoutProgram");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/workoutProgram/create", authenticateToken, generateWorkoutProgram);

module.exports = router;
