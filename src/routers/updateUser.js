const express = require("express");
const {
    updateUser,
    createUserPhysicalMeasurement,
} = require("../controllers/updateUser");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

router.patch("/update/user", authenticateToken, updateUser);
router.post(
    "/update/measurement",
    authenticateToken,
    createUserPhysicalMeasurement
);

module.exports = router;
