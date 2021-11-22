const User=require("../models/User");

const ErrorHandler=require("../utils/errorHandler");

const catchAsyncError=require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto= require("crypto");

exports.registerUser = catchAsyncError(async (req, res, next) => {

    

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id : "products/wmoa49q9e70ze9xtcra2",
            url : "https://res.cloudinary.com/bookit/image/upload/v1606293153/products/wmoa49q9e70ze9xtcra2.jpg"

        }
    })

    sendToken(user, 200, res)

})

//Login user
exports.loginUser=catchAsyncError(async (req,res,next)=>{
    const {email,password}=req.body;
    console.log(req.body);

    //check if email and password is entered by the user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email and password',400));  
    }
    //find user in db
    const user=await User.findOne({email}).select('+password');

    if(!user){
     return next(new ErrorHandler('Please enter valid email and password',401));

    }

    //check if password is correct or not
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Please enter valid email and password',401));
    }

    sendToken(user,200,res);
})

//logout user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

//forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user=await User.findOne({email:req.body.email});

    if(!user){
      return next(new ErrorHandler('User not found with this email',404));
    }

    const resetToken=user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    //create reset password url
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message=`Your password reset token is as follows ${resetUrl} `;
    try{
        await sendEmail({
            email:user.email,
            subject:'ShopIT password recovery',
            message

        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email}`
        })

    }catch(err){
user.resetPasswordToken=undefined;
user.restPasswordExpire=undefined;
await user.save({validateBeforeSave:false});
return next(new ErrorHandler(err.message,500));
    }
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})


//get currently logged in user
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})


//update/change password
exports.updatePassword= catchAsyncError(async (req, res, next) => {
    const user= await User.findById(req.user.id).select('+password');

    //check previous user Password
    const isMatched= await user.comparePassword(req.body.oldPassword);
    if(!isMatched){
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password=req.body.password;
    await user.save();
    sendToken(user, 200, res);
})


//update profile
exports.updateProfile= catchAsyncError(async (req, res, next) => {
    const newUserData={
        name:req.body.name,
        email:req.body.email
    }

    //update avatar

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
        user
    })
})

//Admin Routes

//Get all users
exports.allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//Get user details
exports.getUserDetails=catchAsyncError(async (req, res, next) => {
    const user= await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not found with id : ${req.params.id}`));

    }
    res.status(200).json({
        success: true,
        user
    })
})

//update user
exports.updateUser= catchAsyncError(async (req, res, next) => {
    const newUserData={
        name:req.body.name,
        email:req.body.email, 
        role:req.body.role
    }



    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success: true,
        user
    })
})


// Delete user   =>   /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    // Remove avatar from cloudinary
  
    await user.remove();

    res.status(200).json({
        success: true,
    })
})