const Product = require('../models/productModel');
// import {Product} from '../models/productModel.js'
const ApiFeatures = require('../utils/apifeatures');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
// create product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    // the id of the user who is creating the product will be stored in the product document, so that we can know which user created which product. This is useful for tracking and managing products in the system.
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

// get all products -- Admin
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultsPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultsPerPage);
    const products = await apiFeature.query;
    res.status(200).json({ success: true, products });
});

// update product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        product
    })
}
)

//delete product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    })
})

// get product details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        product,
        productCount
    })
})
