const express = require("express");

const { generateWorkoutProgram, getWorkoutProgram, updateSessionDetailsRepsWeight, updateSessionDetailsAddSet, updateSessionDetailsDeleteSet } = require("../controllers/workoutProgram");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/workoutProgram/create", authenticateToken, generateWorkoutProgram);
router.get('/workoutProgram', authenticateToken, getWorkoutProgram)
router.patch('/session-details/patch', authenticateToken, updateSessionDetailsRepsWeight)
router.post('/session-details/addSets', authenticateToken, updateSessionDetailsAddSet)
router.delete('/session-details/delete', authenticateToken, updateSessionDetailsDeleteSet)

module.exports = router;
