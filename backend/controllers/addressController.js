/**
 * Address Controller
 * Handles user shipping addresses
 */

const mongoose = require("mongoose");
const Address = require("../models/Address");
const User = require("../models/User");

/* ============================================================
   GET ALL ADDRESSES
============================================================ */
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id })
            .sort({ isDefault: -1, createdAt: -1 });

        res.json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error("Get addresses error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   GET ADDRESS BY ID
============================================================ */
const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        res.json({
            success: true,
            address
        });

    } catch (error) {
        console.error("Get address error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   CREATE ADDRESS
============================================================ */
const createAddress = async (req, res) => {
    try {
        const { 
            title, firstname, lastname, email, phone, 
            country, region, city, address, postalCode, 
            isDefault, addressType 
        } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !email || !phone || !city || !address) {
            return res.status(400).json({
                success: false,
                message: "Firstname, lastname, email, phone, city, and address are required"
            });
        }

        // If setting as default, unset other default addresses
        if (isDefault) {
            await Address.updateMany(
                { user: req.user._id, isDefault: true },
                { isDefault: false }
            );
            
            // Update user's default address
            const newAddress = await Address.create({
                user: req.user._id,
                title: title || "",
                firstname,
                lastname,
                email,
                phone,
                country: country || "Nigeria",
                region,
                city,
                address,
                postalCode,
                isDefault: true,
                addressType: addressType || "home"
            });

            await User.findByIdAndUpdate(req.user._id, {
                defaultAddress: newAddress._id
            });

            return res.status(201).json({
                success: true,
                message: "Address created and set as default",
                address: newAddress
            });
        }

        const newAddress = await Address.create({
            user: req.user._id,
            title: title || "",
            firstname,
            lastname,
            email,
            phone,
            country: country || "Nigeria",
            region,
            city,
            address,
            postalCode,
            isDefault: false,
            addressType: addressType || "home"
        });

        res.status(201).json({
            success: true,
            message: "Address created",
            address: newAddress
        });

    } catch (error) {
        console.error("Create address error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   UPDATE ADDRESS
============================================================ */
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // If setting as default, unset other default addresses
        if (updates.isDefault === true) {
            await Address.updateMany(
                { user: req.user._id, isDefault: true, _id: { $ne: id } },
                { isDefault: false }
            );
            
            await User.findByIdAndUpdate(req.user._id, {
                defaultAddress: id
            });
        }

        Object.assign(address, updates);
        await address.save();

        res.json({
            success: true,
            message: "Address updated",
            address
        });

    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   DELETE ADDRESS
============================================================ */
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await Address.findByIdAndDelete(id);

        // If it was the default address, clear user's default
        if (address.isDefault) {
            await User.findByIdAndUpdate(req.user._id, {
                $unset: { defaultAddress: "" }
            });
        }

        res.json({
            success: true,
            message: "Address deleted"
        });

    } catch (error) {
        console.error("Delete address error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

/* ============================================================
   SET DEFAULT ADDRESS
============================================================ */
const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Unset other default addresses
        await Address.updateMany(
            { user: req.user._id, isDefault: true },
            { isDefault: false }
        );

        // Set this as default
        address.isDefault = true;
        await address.save();

        await User.findByIdAndUpdate(req.user._id, {
            defaultAddress: id
        });

        res.json({
            success: true,
            message: "Default address updated",
            address
        });

    } catch (error) {
        console.error("Set default address error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};

