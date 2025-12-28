const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    suspendUser,
    unsuspendUser,
    getSuspendedUsers,
    deleteUser,
    getSuspendedUsersCount
} = require("../controllers/adminUserController");

// All routes require admin authentication
router.get("/", protect, admin, getAllUsers);
router.post("/", protect, admin, createUser);
router.get("/suspended", protect, admin, getSuspendedUsers);
router.get("/suspended/count", protect, admin, getSuspendedUsersCount);
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.put("/:id/suspend", protect, admin, suspendUser);
router.put("/:id/unsuspend", protect, admin, unsuspendUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;

