// const Product = require('../models/productModel');
import {Product} from '../models/productModel.js'

// create product:
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
exports.getAllProducts = (req, res) => {
    res.status(200).json({ message: "Route is working fine!" })
}