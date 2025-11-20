const express = require('express');
const router = express.Router();

const productsController = require('../controllers/products');
const cartController = require('../controllers/cart');
const ordersController = require('../controllers/orders');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Products routes
router.get('/products', productsController.getAllProducts);
router.get('/products/categories', productsController.getCategories);
router.get('/products/:id', productsController.getProductById);

// Cart routes
router.post('/cart/:userId/add', cartController.addToCart);
router.get('/cart/:userId', cartController.getCart);
router.delete('/cart/:userId/clear', cartController.clearCart);

// Orders routes
router.post('/orders/:userId', ordersController.createOrder);
router.get('/orders/:userId', ordersController.getUserOrders);
router.get('/orders/:userId/:orderId', ordersController.getOrderById);

module.exports = router;
