const express = require("express");
const { protect } = require("../Middleware/Auth");
const {
  getMyAccount,
  nameEnquiry,
  getMyBalance,
} = require("../Controllers/accountController");

const router = express.Router();

router.get("/getmyaccount", protect, getMyAccount);
router.get("/getmybalance", protect, getMyBalance);
router.get("/name-enquiry/:accountNumber", protect, nameEnquiry);

module.exports = router; 
