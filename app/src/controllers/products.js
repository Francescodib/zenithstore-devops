const { products } = require('../services/mockData');

// GET /api/products - Get all products
const getAllProducts = (req, res) => {
  const { category, minPrice, maxPrice } = req.query;

  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  res.json({
    success: true,
    count: filteredProducts.length,
    data: filteredProducts
  });
};

// GET /api/products/:id - Get single product
const getProductById = (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
};

// GET /api/products/categories - Get all categories
const getCategories = (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  getCategories
};
