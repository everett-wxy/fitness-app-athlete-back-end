const express = require("express");
const {
    updateUser,
    createPhysicalMeasurement,
    createTrainingPreference,
} = require("../controllers/updateUser");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// router 
router.patch("/update/user", authenticateToken, updateUser);

router.post(
    "/update/measurement",
    authenticateToken,
    createPhysicalMeasurement
);
router.post(
    "/update/preferences",
    authenticateToken,
    createTrainingPreference
);

module.exports = router;
