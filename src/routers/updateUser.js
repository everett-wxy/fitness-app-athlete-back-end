const express = require("express");
const {
    updateUser,
    createUserPhysicalMeasurement,
    createUserTrainingPreferences,
} = require("../controllers/updateUser");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// router 
router.patch("/update/user", authenticateToken, updateUser);

router.post(
    "/update/measurement",
    authenticateToken,
    createUserPhysicalMeasurement
);
router.post(
    "/update/preferences",
    authenticateToken,
    createUserTrainingPreferences
);

module.exports = router;
