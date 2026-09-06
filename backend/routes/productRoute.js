const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');

// routes:
router.route('/products').get(isAuthenticatedUser, getAllProducts);
router.route('/product/new').post(createProduct);
router.route('/product/:id').put(updateProduct);
router.route('/product/:id').delete(deleteProduct);
router.route('/product/:id').get(getProductDetails);

module.exports = router;