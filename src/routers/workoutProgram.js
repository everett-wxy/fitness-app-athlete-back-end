const express = require("express");

const { generateWorkoutProgram, getWorkoutProgram } = require("../controllers/workoutProgram");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/workoutProgram/create", authenticateToken, generateWorkoutProgram);
router.get('/workoutProgram', authenticateToken, getWorkoutProgram)

module.exports = router;
