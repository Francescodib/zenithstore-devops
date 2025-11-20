const { products, carts } = require('../services/mockData');

// POST /api/cart/:userId/add - Add item to cart
const addToCart = (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid productId or quantity'
    });
  }

  const product = products.find(p => p.id === parseInt(productId));

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient stock'
    });
  }

  if (!carts.has(userId)) {
    carts.set(userId, []);
  }

  const userCart = carts.get(userId);
  const existingItem = userCart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity
    });
  }

  res.json({
    success: true,
    message: 'Item added to cart',
    data: userCart
  });
};

// GET /api/cart/:userId - Get user cart
const getCart = (req, res) => {
  const { userId } = req.params;
  const userCart = carts.get(userId) || [];

  const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.json({
    success: true,
    data: {
      userId,
      items: userCart,
      itemCount: userCart.length,
      total: total.toFixed(2)
    }
  });
};

// DELETE /api/cart/:userId/clear - Clear cart
const clearCart = (req, res) => {
  const { userId } = req.params;
  carts.delete(userId);

  res.json({
    success: true,
    message: 'Cart cleared'
  });
};

module.exports = {
  addToCart,
  getCart,
  clearCart
};
