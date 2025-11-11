const express = require("express");
const path = require("path");
const abaRoutes = require("./aba");




// const router = express.Router();
const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images) from public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
// Mock product data
const products = [
  {
    id: 1,
    name: "Laptop",
    price: 999,
    category: "Electronics",
    image: "/images/laptop.png",
  },
  {
    id: 2,
    name: "IPhone 16 Pro",
    price: 1199,
    category: "Electronics",
    image: "/images/smartphone.avif",
  },
  {
    id: 3,
    name: "T-Shirt",
    price: 25,
    description:
      "Made from a soft, breathable cotton blend (or specify material, e.g., 100% ring-spun cotton) that feels great against the skin, offering all-day wearability.",
    category: "Clothing",
    image: "/images/tshirt.webp",
  },
  {
    id: 4,
    name: "Coffee Mug",
    price: 15,
    category: "Home",
    image: "/images/mug.webp",
  },
  {
    id: 5,
    name: "Headphones",
    price: 199,
    category: "Electronics",
    image: "/images/headphone1.png",
  },
  {
    id: 6,
    name: "Running Shoes",
    description:
      "Made from a soft, breathable cotton blend (or specify material, e.g., 100% ring-spun cotton) that feels great against the skin, offering all-day wearability.",
    price: 120,
    category: "Clothing",
    image: "/images/rnshoes.webp",
  },
  {
    id: 7,
    name: "Backpack",
    price: 80,
    category: "Accessories",
    image: "/images/backpack1.png",
  },
  {
    id: 8,
    name: "Cannon GX7 Mark III",
    price: 250,
    category: "Electronics",
    image: "/images/cannongx7markiii.webp",
  },
  {
    id: 9,
    name: "Smart Watch",
    price: 299,
    category: "Electronics",
    image: "/images/smartwatch.png",
  },
  {
    id: 10,
    name: "Sunglasses",
    price: 75,
    category: "Accessories",
    image: "/images/sunglasses.png",
  },
  {
    id: 11,
    name: "Bluetooth Speaker",
    price: 150,
    category: "Electronics",
    image: "/images/speaker.png",
  },
  {
    id: 12,
    name: "Denim Jeans",
    price: 60,
    category: "Clothing",
    image: "/images/denimjean.webp",
  },
  {
    id: 13,
    name: "Myntra Watch",
    price: 200,
    category: "Accessories",
    image: "/images/wristwatch.jpg",
  },
  {
    id: 14,
    name: "Cannon Digital Camera",
    price: 450,
    category: "Electronics",
    image: "/images/degitalcamera.png",
  },
  {
    id: 15,
    name: "Pure Leather Wallet",
    price: 40,
    category: "Accessories",
    image: "/images/leatherwallet.webp",
  },
  {
    id: 16,
    name: "Office Chair",
    price: 180,
    category: "Home",
    image: "/images/officechair.png",
  },
  {
    id: 17,
    name: "Electric Kettle",
    price: 10,
    category: "Home",
    image: "/images/electrickettle.png",
  },
  {
    id: 18,
    name: "Denim Jecket",
    price: 130,
    category: "Clothing",
    image: "/images/denimjecket.avif",
  },
  {
    id: 19,
    name: "Colgate Toothpaste",
    price: 5,
    category: "Home",
    image: "/images/colgate.png",
  }
];

// Routes - Serve HTML pages directly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "products.html"));
});

app.get("/products/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "product-detail.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cart.html"));
});

app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "checkout.html"));
});

// API endpoints to serve product data (JSON)
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// aba sandbox routes
app.use("/api", abaRoutes);

// 404 page - must be last route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
  console.log(`🛒 E-commerce server running at http://localhost:${PORT}`);
});

