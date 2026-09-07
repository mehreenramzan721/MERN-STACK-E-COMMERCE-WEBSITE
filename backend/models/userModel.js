const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxLength: [30, 'Your name cannot exceed 30 characters'],
        minLength: [4, 'Your name must be at least 4 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Your password must be at least 6 characters long'],
        select: false, // this means that when we query the user, the password field will not be returned by default
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }

    },
    role: {
        type: String,
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})

// it will become an event
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// JWT token
userSchema.methods.getJWTToken = function () {
    // this jwt secret is our secret key that we will use to sign the token. It should be kept secret and not shared with anyone. We will store it in our .env file.
    // in case it leaks then anyone having the key will access our application and can do anything they want.
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
    // this. password is the hashed password stored in the database,
    //  and enteredPassword is the password entered by the user during login.
    //  The bcrypt.compare function will hash the enteredPassword and compare it with the hashed password stored in the database. If they match, it will return true, otherwise false.
}

// generating password reset token
userSchema.methods.getResetPasswordToken = function () {
    // generating token 
    // we are using crypto module to generate a random token. The randomBytes function generates a buffer of random bytes, and we convert it to a hex string using the toString('hex') method.
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hashing and add to userSchema
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};
module.exports = mongoose.model('User', userSchema);