const mongoose = require("mongoose");
    // The customer who INITIATED the transfer (the sender, on our bank).
    // This is what enforces "you can only see your own history" -
    // we never return a transaction whose initiator isn't the requester.

const transactionSchema = new mongoose.Schema(
    {
        initiator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        transactionId: {
            type: String,
            unique: true,
            sparse: true
        },

        idempotencyKey: {
            type: String,
            unique: true,
            sparse: true
        },

        fromAccount: {
            type: String,
            required: true
        },

        toAccount: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "SUCCESS",
                "FAILED"
            ],
            default: "PENDING"
        },

        failureReason: {
            type: String
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        completedAt: {
            type: Date
        }
    },
    { timestamps: true}
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
