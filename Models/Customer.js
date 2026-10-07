const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, 
      required: true,
      uppercase: true},

    lastName: { type: String, 
      required: true,
      uppercase: true},

    email: { type: String, 
      required: true, 
      unique: true, 
      lowercase: true},

    phone: { type: String,
      required: true
    },

    password: { type: String, 
      required: true, 
      length: 8},

    // KYC / identity status against NIBSS
    kycType: { type: String, 
      enum: ["bvn", "nin", null], 
      default: null },

    kycID: { type: String, 
      default: null }, // the BVN or NIN number
    dob: { type: String, 
      default: null }, // YYYY-MM-DD, needed again at account creation
    kycVerified: { type: Boolean, 
      default: false },

    // enforced at the application layer: max 1 account per customer
    hasAccount: { type: Boolean, 
      default: false },
  },
  { timestamps: true }
);
//Create the model schema
const Customer  = mongoose.model("Customer", customerSchema);
module.exports = Customer; //export the Customer model for use in other parts of the application

