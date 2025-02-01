const express = require('express');
const { signup, signin, sendConfirmationEmail, checkConfirmationStatus, confirmEmail } = require("../controllers/AuthController.js")

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

// for verifying
router.post("/confirmation/send", sendConfirmationEmail);
router.get("/confirmation/status", checkConfirmationStatus);
router.post("/confirmation/confirm", confirmEmail)

module.exports = router;