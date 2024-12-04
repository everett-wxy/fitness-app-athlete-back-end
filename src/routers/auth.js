const express = require("express");
const { register, login } = require("../controllers/auth");
const router = express.Router();

router.post("/users/register", register);
router.post("/users/login", login);

module.exports = router;