const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'transfer'],
        required: true,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        enum: ['razorpay', 'card', 'UPI', 'netbanking', 'wallet'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
;


const advancedWalletSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0.0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        transactionHistory: [transactionSchema],
    },
    {
        timestamps: true,
    }
);

advancedWalletSchema.pre('save', async function (next) {
    if (this.balance < 0) {
        const error = new Error('Balance cannot be negative.');
        return next(error);
    }
    next();
});

advancedWalletSchema.methods.addTransaction = async function (amount, type, transactionId, source) {
    try {
        if (this.status === 'inactive' || this.status === 'suspended') {
            throw new Error('Wallet is not active');
        }

        let newBalance = this.balance;
        if (type === 'deposit') {
            newBalance += amount;
        } else if (type === 'withdrawal') {
            if (amount > this.balance) {
                throw new Error('Insufficient balance');
            }
            newBalance -= amount;
        }

        this.balance = newBalance;

        const transaction = {
            transactionId,
            amount,
            type,
            balanceAfter:newBalance,
            source,
            createdAt: new Date(),
        };

        this.transactionHistory.push(transaction);
        await this.save();
        return transaction;
    } catch (error) {
        throw error;
    }
};

advancedWalletSchema.methods.getTransactions = function () {
    return this.transactionHistory;
};

const AdvancedWallet = mongoose.model('Wallet', advancedWalletSchema);

module.exports = AdvancedWallet;
