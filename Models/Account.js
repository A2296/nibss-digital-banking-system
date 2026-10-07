const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true, // enforces one account per customer at the DB level too
    },

    accountNumber: { type: String, 
      required: true, 
      unique: true, 
      length: 10 },

    bankCode: { type: String, 
      required: true },

    bankName: { type: String, 
      required: true },

    // Local cache of balance, kept in sync after each transfer/balance check.
    // The NIBSS ledger is always the source of truth.
    lastKnownBalance: { type: Number, 
      default: 0 },
  },
  { timestamps: true }
);
//Create the Account Schema export
const Account = mongoose.model("Account", accountSchema);
module.exports = Account; //export the Account model for use in other parts of the system
