const catchAsyncError = require("./catchAsyncError");
const User =require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

//check if the user is authenticated 

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {

    const { token } = req.cookies

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401))
    }

    const decoded = jwt.verify(token, "secret_this_should_be_longer")
    req.user = await User.findById(decoded.id);
    console.log(req.user);
    next()
})

// Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(req);
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to acccess this resource`, 403))
        }
        next()
    }
}