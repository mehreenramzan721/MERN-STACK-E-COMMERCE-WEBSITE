const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
// register a user 
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'this is a sample id',
            url: 'profilepicUrl',
        }
    });
    sendToken(user, 201, res)
});


// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }
    // why we use select("+password") because in userModel.js we have set select: false for password field, so it will not be returned by default when we query the user.
    //  By using select("+password"), we are explicitly asking Mongoose to include the password field in the result.
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }


    sendToken(user, 200, res);
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
    // make the value of token cookie to null and set the expiry date to current date so that it will be deleted from the browser
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })

})

// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }
    // get reset token
    const resetToken = user.getResetPasswordToken();
    // as this function is not saving the user to the database, we need to save it manually. But we don't want to validate the user again as we are only updating the resetPasswordToken and resetPasswordExpire fields, so we will pass { validateBeforeSave: false } as an option to the save() method.
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Error sending email", 500));
    }
})


exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash 
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        // we have filters in the curly brackets 
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired ", 404));

    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password not matched ", 404));

    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

