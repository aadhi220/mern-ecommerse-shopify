const express = require("express");
const {
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  addProduct,
  getProductById,
} = require("../Controllers/ProductController");
const { isAdmin, authMiddleware } = require("../Middlewares/AuthMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, addProduct);

router.get("/:id", getProductById);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);

module.exports = router;