const Account = require("../Models/Account");
const nibss = require("../Services/nibssService");

// GET /api/accounts/me
async function getMyAccount(req, res) {
  const account = await Account.findOne({ customer: req.customer._id });
  if (!account) {
    return res.status(404).json({ message: "No account found for this customer" });
  }
  res.json({ account });
}

// GET /api/accounts/name-enquiry/:accountNumber
// A customer can look up ANY recipient's name (needed before sending money to them).
async function nameEnquiry(req, res) {
  try {
    const data = await nibss.nameEnquiry(req.params.accountNumber);
    res.json(data);
  } catch (err) {
    const nibssMessage = err.response?.data?.message;
    res.status(err.response?.status || 400).json({ message: nibssMessage || "Name enquiry failed" });
  }
}

// GET /api/accounts/balance
// Only ever checks the CALLER's own account - never accepts an arbitrary
// account number here, to keep balance data isolated per customer.
async function getMyBalance(req, res) {
  try {
    const account = await Account.findOne({ customer: req.customer._id });
    if (!account) {
      return res.status(404).json({ message: "No account found for this customer" });
    }
    const data = await nibss.getBalance(account.accountNumber);
    account.lastKnownBalance = data.balance;
    await account.save();
    res.json(data);
  } catch (err) {
    const nibssMessage = err.response?.data?.message;
    res.status(err.response?.status || 400).json({ message: nibssMessage || "Balance check failed" });
  }
}

module.exports = { getMyAccount, nameEnquiry, getMyBalance };
