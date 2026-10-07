// Transaction Routes
// This is where we define the routes for transaction-related operations, such as initiating transfers, checking transaction status, and retrieving transaction history for the authenticated user.
// We use the requireAuth middleware to ensure that only authenticated users can access these routes.

const express = require("express");
const { protect } = require("../Middleware/Auth");
const {
  initiateTransfer,
  getTransactionStatus,
  getMyHistory,
} = require("../Controllers/transactionController");

// Create a new router instance
const router = express.Router();

router.post("/transfer", protect, initiateTransfer);
router.get("/history", protect, getMyHistory);
router.get("/transaction/:Id", protect, getTransactionStatus);

module.exports = router;
