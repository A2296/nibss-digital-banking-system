const express = require("express");
const { protect } = require("../Middleware/Auth");
const {
  register,
  login,
  submitKyc,
  createAccount,
} = require("../Controllers/customerController");

const router = express.Router();

router.post("/register", protect, register);
router.post("/login", protect, login);
router.post("/kyc", protect, submitKyc);
router.post("/account", protect, createAccount);

module.exports = router;
