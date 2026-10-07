const axios = require("axios");

// This manages the single JWT your BACKEND (the fintech) uses to call
// protected NIBSS by Phoenix endpoints. It is separate from the JWT you
// issue to your own bank customers (see middleware/auth.js).
//
// The NIBSS token expires after 1 hour, so we cache it and re-login
// automatically whenever it's missing or close to expiry.

let cachedToken = null;
let cachedExpiryMs = 0;

const SAFETY_MARGIN_MS = 60 * 1000; // refresh 60s before actual expiry

async function loginToNibss() {
  const baseUrl = process.env.NIBSS_BASE_URL;
  const apiKey = process.env.NIBSS_API_KEY;
  const apiSecret = process.env.NIBSS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "NIBSS_API_KEY / NIBSS_API_SECRET are not set. Run the onboarding script first (see scripts/onboard.js) and copy the returned apiKey/apiSecret into your .env file."
    );
  }

  const response = await axios.post(`${baseUrl}/api/auth/token`, {
    apiKey,
    apiSecret,
  });

  const { token, fintech } = response.data;

  cachedToken = token;
  // Decode the JWT payload to read the real "exp" claim instead of assuming 1h,
  // so we stay correct even if NIBSS changes the token lifetime.
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString("utf8")
  );
  cachedExpiryMs = payload.exp * 1000;

  console.log(
    `NIBSS token refreshed for ${fintech.bankName} (${fintech.name}), expires ${new Date(
      cachedExpiryMs
    ).toISOString()}`
  );

  return cachedToken;
}

async function getNibssToken() {
  const now = Date.now();
  if (!cachedToken || now >= cachedExpiryMs - SAFETY_MARGIN_MS) {
    return loginToNibss();
  }
  return cachedToken;
}

module.exports = { getNibssToken };
