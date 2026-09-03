const Product = require('../models/productModel');
// import {Product} from '../models/productModel.js'

// create product -- Admin
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
exports.getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json({success: true, products});
}