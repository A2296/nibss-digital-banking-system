const axios = require("axios");
const { getNibssToken } = require("../Config/nibssAuth");

const baseUrl = () => process.env.NIBSS_BASE_URL;

// Every protected call goes through this helper so the Bearer token is
// always fresh (Config/nibssAuth.js refreshes it automatically).
async function authedRequest(method, path, data) {
  const token = await getNibssToken();
  return axios({
    method,
    url: `${baseUrl()}${path}`,
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Identity ---------------------------------------------------------

async function insertBvn({ bvn, firstName, lastName, dob, phone }) {
  const { data } = await authedRequest("post", "/api/insertBvn", {
    bvn,
    firstName,
    lastName,
    dob,
    phone,
  });
  return data;
}

async function insertNin({ nin, firstName, lastName, dob }) {
  const { data } = await authedRequest("post", "/api/insertNin", {
    nin,
    firstName,
    lastName,
    dob,
  });
  return data;
}

async function validateBvn(bvn) {
  const { data } = await authedRequest("post", "/api/validateBvn", { bvn });
  return data;
}

async function validateNin(nin) {
  const { data } = await authedRequest("post", "/api/validateNin", { nin });
  return data;
}

// --- Accounts -----------------------------------------------------------

async function createAccount({ kycType, kycID, dob }) {
  const { data } = await authedRequest("post", "/api/account/create", {
    kycType,
    kycID,
    dob,
  });
  return data;
}

async function nameEnquiry(accountNumber) {
  const { data } = await authedRequest(
    "get",
    `/api/account/name-enquiry/${accountNumber}`
  );
  return data;
}

async function getBalance(accountNumber) {
  const { data } = await authedRequest(
    "get",
    `/api/account/balance/${accountNumber}`
  );
  return data;
}

// --- Transactions ---------------------------------------------------------

async function transfer({ from, to, amount }) {
  const { data } = await authedRequest("post", "/api/transfer", {
    from,
    to,
    amount: String(amount),
  });
  return data;
}

async function getTransactionStatus(transactionId) {
  const { data } = await authedRequest(
    "get",
    `/api/transaction/${transactionId}`
  );
  return data;
}

module.exports = {
  insertBvn,
  insertNin,
  validateBvn,
  validateNin,
  createAccount,
  nameEnquiry,
  getBalance,
  transfer,
  getTransactionStatus,
};
