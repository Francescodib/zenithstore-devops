const { carts, orders, getNextOrderId } = require('../services/mockData');

// POST /api/orders/:userId - Create order from cart
const createOrder = (req, res) => {
  const { userId } = req.params;
  const userCart = carts.get(userId);

  if (!userCart || userCart.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty'
    });
  }

  const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = {
    orderId: getNextOrderId(),
    userId,
    items: [...userCart],
    total: parseFloat(total.toFixed(2)),
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  carts.delete(userId);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
};

// GET /api/orders/:userId - Get user orders
const getUserOrders = (req, res) => {
  const { userId } = req.params;
  const userOrders = orders.filter(o => o.userId === userId);

  res.json({
    success: true,
    count: userOrders.length,
    data: userOrders
  });
};

// GET /api/orders/:userId/:orderId - Get specific order
const getOrderById = (req, res) => {
  const { userId, orderId } = req.params;
  const order = orders.find(o =>
    o.userId === userId && o.orderId === parseInt(orderId)
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
