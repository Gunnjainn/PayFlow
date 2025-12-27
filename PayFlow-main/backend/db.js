const mongoose = require('mongoose');
const { string } = require('zod');



const UserSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
        trim: true
    },
    lastName : {
        type: String,
        required: true,
        trim: true
    },
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password : {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for faster lookups
UserSchema.index({ username: 1 }, { unique: true });

const AccountSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique: true
    },
    balance :{
        type : Number ,
        required : true,
        min: 0,
        default: 0
    } 

}, { timestamps: true });

// Index for faster lookups
AccountSchema.index({ userId: 1 }, { unique: true });

const TransactionRecordSchema = new mongoose.Schema({
    from : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    to : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    amount : {
        type : Number,
        required: true,
        min: 0.01
    }

}, { timestamps: true });

// Indexes for faster queries
TransactionRecordSchema.index({ from: 1, createdAt: -1 });
TransactionRecordSchema.index({ to: 1, createdAt: -1 });


const User = mongoose.model('User', UserSchema);
const Account = mongoose.model('Account' ,AccountSchema);
const TransactionRecord= mongoose.model('TransactionRecord', TransactionRecordSchema);

module.exports={
    User,Account,TransactionRecord
}

