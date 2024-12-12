const express = require("express");
const {
    updateUser,
    createPhysicalMeasurement,
    createTrainingPreference,
    updateAccessToEquipements,
    getUser,
} = require("../controllers/updateUser");
const { authenticateToken, authoriseAdmin } = require("../middleware/auth");
const router = express.Router();

// router
router.patch("/update/user", authenticateToken, updateUser);

router.post(
    "/update/measurement",
    authenticateToken,
    createPhysicalMeasurement
);
router.post("/update/preferences", authenticateToken, createTrainingPreference);

router.post(
    "/update/accessToEquipments",
    authenticateToken,
    updateAccessToEquipements
);

router.get("/users", authenticateToken, authoriseAdmin,getUser);

module.exports = router;
