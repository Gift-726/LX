const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/addressController");

// All routes require authentication
router.get("/", protect, getAddresses);
router.get("/:id", protect, getAddressById);
router.post("/", protect, createAddress);
router.put("/:id", protect, updateAddress);
router.put("/:id/default", protect, setDefaultAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;

