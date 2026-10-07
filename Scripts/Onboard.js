// Run ONCE: node scripts/onboard.js
// Registers your bank with NIBSS by Phoenix and prints the credentials
// you need to paste into NIBSS_API_KEY / NIBSS_API_SECRET in your .env.

require("dotenv").config();
const axios = require("axios");

const NAME = process.argv[2] || "Your Bank Name";
const EMAIL = process.argv[3] || "you@example.com";

async function main() {
    const baseUrl = process.env.NIBSS_BASE_URL;

    if (!baseUrl) {
        console.error("NIBSS_BASE_URL is not configured.");
        process.exit(1);
    }
    
    
    try {
        const { data } = await axios.post(`${baseUrl}/api/fintech/onboard`, {
            name: NAME,
            email: EMAIL
    });

    console.log("\nOnboarding successful. Add these to your .env file:\n");
    console.log(`NIBSS_API_KEY=${data.apiKey}`);
    console.log(`NIBSS_API_SECRET=${data.apiSecret}`);
    console.log(`\nAssigned bankCode: ${data.bankCode}`);
    console.log(`Assigned bankName: ${data.bankName}`);
} catch (err) {
    console.error("Onboarding failed:", err.response?.data || err.message);
    process.exit(1);
}
}
main();
