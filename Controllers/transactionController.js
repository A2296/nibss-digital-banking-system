
const Account = require("../Models/Account");
const Transaction = require("../Models/Transaction");
const nibss = require("../Services/nibssService");

// POST /api/transactions/transfer
// Works for both intra-bank and inter-bank transfers.
async function initiateTransfer(req, res) {
    try {
        const { to, amount } = req.body;

        if (!to || !amount) {
            return res.status(400).json({
                message: "'to' account number and 'amount' are required"
            });
            
        }
        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }

        // Enforce that a customer can only send FROM their own account.
        // The "from" account is never taken from the request body.
        const senderAccount = await Account.findOne({
            customer: req.customer._id
        });

        if (!senderAccount) {
            return res.status(404).json({
                message: "You don't have an account yet"
            });
        }
        if (String(to) === String(senderAccount.accountNumber)) {
            return res.status(400).json({ message: "You cannot transfer to your own account" });
        }

        const result = await nibss.transfer({ 
            from: senderAccount.accountNumber, 
            to, 
            amount });
        try {
            await Transaction.create({
                initiator: req.customer._id,
                transactionId: result.transactionId,
                fromAccount: result.from,
                toAccount: result.to,
                amount: result.amount,
                status: result.status
            });
        } catch (saveErr) {
            console.error("Transfer done but record not saved:", result.transactionId, saveErr);
        }
        res.json(result);

    } catch (err) {
        const nibssMessage = err.response?.data?.message;

        res.status(err.response?.status || 400).json({
            message: nibssMessage || "Transfer failed"
        });
    }
}
//TODO: THIS LINE OF CODE IS NOT YET COMPLETE


// GET /api/transactions/:transactionId
// Only returns status if the requesting customer initiated that transaction.
async function getTransactionStatus(req, res) {
    try {
        const { transactionId } = req.params;

        const record = await Transaction.findOne({ transactionId });

        if (
            !record ||
            String(record.initiator) !== String(req.customer._id)
        ) {
            // Same 404 response whether the transaction doesn't exist
            // or belongs to another customer.
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        const data = await nibss.getTransactionStatus(transactionId);

        record.status = data.status;
        await record.save();

        res.json(data);

    } catch (err) {
        const nibssMessage = err.response?.data?.message;

        res.status(err.response?.status || 400).json({
            message: nibssMessage || "Status check failed"
        });
    }
}


// GET /api/transactions/history
// Returns only the transactions initiated by the logged-in customer.
async function getMyHistory(req, res) {
    try {
        const history = await Transaction.find({
            initiator: req.customer._id
        }).sort({ createdAt: -1 });

        res.json({ history });

    } catch (err) {
        res.status(500).json({
            message: "Failed to retrieve transaction history"
        });
    }
}


module.exports = {
    initiateTransfer: initiateTransfer,
    getTransactionStatus: getTransactionStatus,
    getMyHistory: getMyHistory
}
