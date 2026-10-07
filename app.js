// app.js
//Import required modules
//Import the express module to create an Express application
//Import the database connection configuration to connect to the MongoDB database
//Create an instance of the Express application
//Use middleware to parse JSON request bodies
//Use the user route for handling user-related requests


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Config/databaseConfig");

const customerRoute = require("./Routes/customerRoute");
const accountRoute = require("./Routes/accountRoute");
const transactionRoute = require("./Routes/transactionRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/customers", customerRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/transactions", transactionRoute);

// Fallback error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
