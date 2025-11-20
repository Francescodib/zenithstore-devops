// Mock data for ZenithStore e-commerce

const products = [
  {
    id: 1,
    name: "Premium Leather Wallet",
    category: "Accessories",
    price: 89.99,
    stock: 45,
    description: "Handcrafted Italian leather wallet"
  },
  {
    id: 2,
    name: "Luxury Watch",
    category: "Watches",
    price: 1299.99,
    stock: 12,
    description: "Swiss automatic chronograph"
  },
  {
    id: 3,
    name: "Designer Sunglasses",
    category: "Accessories",
    price: 249.99,
    stock: 30,
    description: "UV400 polarized lenses"
  },
  {
    id: 4,
    name: "Premium Backpack",
    category: "Bags",
    price: 179.99,
    stock: 25,
    description: "Water-resistant laptop backpack"
  },
  {
    id: 5,
    name: "Wireless Earbuds Pro",
    category: "Electronics",
    price: 299.99,
    stock: 60,
    description: "Active noise cancellation"
  },
  {
    id: 6,
    name: "Silk Tie Collection",
    category: "Accessories",
    price: 69.99,
    stock: 100,
    description: "Set of 3 premium silk ties"
  }
];

const carts = new Map();
const orders = [];
let orderIdCounter = 1000;

function getNextOrderId() {
  return ++orderIdCounter;
}

module.exports = {
  products,
  carts,
  orders,
  getNextOrderId
};
