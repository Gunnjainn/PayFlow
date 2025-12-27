const { Router } = require("express");
const { AuthorizedUser } = require("../middleware");
const { Account, User, TransactionRecord } = require("../db");
const mongoose = require("mongoose");

const accountRouter = Router();

const z = require('zod');

// Transfer validation schema
const transferSchema = z.object({
    amount: z.number().positive().min(0.01, 'Amount must be at least 0.01').max(100000, 'Amount cannot exceed 100000'),
    to: z.string().min(1, 'Receiver ID is required')
});




accountRouter.get('/balance' , AuthorizedUser , async(req ,res)=>{
    try {
        const {userId} = req;

        const UserAccount = await Account.findOne({userId : userId });

        if(!UserAccount){
            return res.status(404).json({
                message: 'Account not found'
            });
        }

        return res.json({
            balance : UserAccount.balance
        });
    } catch (error) {
        console.error('Balance fetch error:', error);
        return res.status(500).json({
            message: 'Failed to fetch balance'
        });
    }
})

// Transaction history endpoint
accountRouter.get('/transactions', AuthorizedUser, async(req, res) => {
    try {
        const {userId} = req;
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const transactions = await TransactionRecord.find({
            $or: [
                { from: userId },
                { to: userId }
            ]
        })
        .populate('from', 'firstName lastName username')
        .populate('to', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

        const formattedTransactions = transactions.map(t => ({
            id: t._id,
            from: {
                id: t.from._id,
                name: `${t.from.firstName} ${t.from.lastName}`,
                email: t.from.username
            },
            to: {
                id: t.to._id,
                name: `${t.to.firstName} ${t.to.lastName}`,
                email: t.to.username
            },
            amount: t.amount,
            type: t.from._id.toString() === userId.toString() ? 'sent' : 'received',
            date: t.createdAt || t._id.getTimestamp()
        }));

        return res.json({
            transactions: formattedTransactions,
            count: formattedTransactions.length
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        return res.status(500).json({
            message: 'Failed to fetch transaction history'
        });
    }
})


accountRouter.post('/transfer' , AuthorizedUser , async(req ,res)=>{
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        // Validate input
        const {success, data, error} = transferSchema.safeParse(req.body);
        if(!success){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                message: 'Invalid transfer data',
                errors: error.errors
            });
        }

        const {amount, to} = data;

        // Prevent self-transfer
        if(req.userId.toString() === to){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                message: 'Cannot transfer to yourself'
            });
        }

        // Check if user has sufficient balance (using session)
        const fromAccount = await Account.findOne({
            userId : req.userId
        }).session(session);

        if(!fromAccount){
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({
                message : 'Account not found'
            });
        }

        if(fromAccount.balance < amount){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                message : 'Insufficient balance'
            });
        }

        // Check if receiver exists (using session)
        const toAccount = await Account.findOne({
            userId : to
        }).session(session);

        if(!toAccount){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({
                message : 'Invalid receiver'
            });
        }

        // Perform atomic updates (using session)
        await Account.updateOne({
            userId: req.userId
        }, {
            $inc : {
                balance : -amount
            }
        }).session(session);

        await Account.updateOne({
            userId: to
        }, {
            $inc : {
                balance : amount
            }
        }).session(session);

        // Create transaction record (using session)
        const record = await TransactionRecord.create([{
            from : req.userId,
            to : to,
            amount : amount
        }], { session });

        await session.commitTransaction();
        await session.endSession();
        
        return res.json({
            message : 'Transfer Successful',
            TxnId : record[0]._id,
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.error('Transfer error:', error);
        return res.status(500).json({
            message: 'Transfer failed. Please try again.'
        });
    }
})


module.exports = {
    accountRouter
}