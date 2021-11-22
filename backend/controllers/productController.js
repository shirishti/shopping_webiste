const Product =require("../models/product");
console.log(Product);
const catchAsyncError=require("../middlewares/catchAsyncError");
const ErrorHandler=require("../utils/errorHandler");
const APIFeatures=require("../utils/apiFeatures");


//Create new product -->DOMAIN/api/v1/products/new
exports.newProduct=catchAsyncError (async (req,res,next)=>{
    req.body.user=req.user.id;
    console.log(req.body);
    const product=await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
})

exports.getProducts=catchAsyncError (async (req,res,next)=>{
    const resPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()

    let products = await apiFeatures.query;
  



    res.status(200).json({
        success: true,
        products
    })

})

exports.getSingleProduct=catchAsyncError (async (req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
      return next(new ErrorHandler('Product not found',404))
    }else{
    res.status(200).json({
        success:true,
        product
    })}
})

exports.updateProduct=catchAsyncError (async (req,res,next)=>{
    let product=await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }
    product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});
   
     
    res.status(200).json({
            success:true,
            product
        }) 
    

})

exports.deleteProduct=catchAsyncError (async (req,res,next)=>{
    let product=await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }

    product=await Product.findByIdAndRemove(req.params.id,req.body);
    res.status(200).json({
        success:true,
       message:"Deleted the product"
    }) 
})

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

exports.getProductReviews=catchAsyncError (async (req,res,next)=>{
    const product=await Product.findById(req.query.id);
    console.log(req.query);
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    console.log(product);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})