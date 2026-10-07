const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../Models/Customer");
const Account = require("../Models/Account");
const nibss = require("../Services/nibssService");

function signToken(customer) {
  return jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// POST /api/customers/register
async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "firstName, lastName, email and password are required" });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A customer with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
    });

    const token = signToken(customer);
    res.status(201).json({
      message: "Registered successfully. Submit your BVN or NIN next to get verified.",
      token,
      customer: sanitize(customer),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

// POST /api/customers/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: (email || "").toLowerCase() });
    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password || "", customer.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(customer);
    res.json({ token, customer: sanitize(customer) });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// POST /api/customers/kyc
// Registers the customer's BVN or NIN with NIBSS, then marks them verified.
// This must succeed before account creation is allowed.
async function submitKyc(req, res) {
  try {
    const { kycType, kycID, dob, phone } = req.body;
    if (!["bvn", "nin"].includes((kycType || "").toLowerCase())) {
      return res.status(400).json({ message: "kycType must be 'bvn' or 'nin'" });
    }
    if (!kycID || !dob) {
      return res.status(400).json({ message: "kycID and dob are required" });
    }

    const customer = req.customer;
    const type = kycType.toLowerCase();

    if (type === "bvn") {
      if (!phone) {
        return res.status(400).json({ message: "phone is required to register a BVN" });
      }
      await nibss.insertBvn({
        bvn: kycID,
        firstName: customer.firstName,
        lastName: customer.lastName,
        dob,
        phone,
      });
    } else {
      await nibss.insertNin({
        nin: kycID,
        firstName: customer.firstName,
        lastName: customer.lastName,
        dob,
      });
    }

    customer.kycType = type;
    customer.kycID = kycID;
    customer.dob = dob;
    customer.kycVerified = true;
    await customer.save();

    res.json({ message: `${type.toUpperCase()} registered and verified`, customer: sanitize(customer) });
  } catch (err) {
    const nibssMessage = err.response?.data?.message;
    res.status(400).json({ message: nibssMessage || "KYC submission failed", error: err.message });
  }
}

// POST /api/customers/account
// Creates the customer's single bank account via NIBSS, after KYC is verified.
async function createAccount(req, res) {
  try {
    const customer = req.customer;

    if (!customer.kycVerified) {
      return res.status(403).json({ message: "Complete BVN/NIN verification before creating an account" });
    }
    if (customer.hasAccount) {
      return res.status(409).json({ message: "This customer already has an account" });
    }

    const result = await nibss.createAccount({
      kycType: customer.kycType,
      kycID: customer.kycID,
      dob: customer.dob,
    });

    const account = await Account.create({
      customer: customer._id,
      accountNumber: result.accountNumber,
      bankCode: result.bankCode,
      bankName: result.bankName,
      lastKnownBalance: result.balance,
    });

    customer.hasAccount = true;
    await customer.save();

    res.status(201).json({ message: "Account created successfully", account });
  } catch (err) {
    const nibssMessage = err.response?.data?.message;
    res.status(400).json({ message: nibssMessage || "Account creation failed", error: err.message });
  }
}

function sanitize(customer) {
  const { passwordHash, ...rest } = customer.toObject();
  return rest;
}

module.exports = { register, login, submitKyc, createAccount };
