/**
 * Paystack Configuration
 * Handles Paystack API initialization and helper functions
 */

// Lazy initialization of Paystack client
let paystackClient = null;

const getPaystackClient = () => {
    if (!paystackClient) {
        let secretKey = process.env.PAYSTACK_SECRET_KEY;
        
        if (!secretKey) {
            console.error("[Paystack] ERROR: PAYSTACK_SECRET_KEY is not set!");
            throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables. Please add it to your .env file.");
        }
        
        // Trim whitespace
        secretKey = secretKey.trim();
        
        if (secretKey.length === 0) {
            console.error("[Paystack] ERROR: PAYSTACK_SECRET_KEY is empty!");
            throw new Error("PAYSTACK_SECRET_KEY is empty. Please check your .env file.");
        }
        
        paystackClient = require("paystack")(secretKey);
    }
    return paystackClient;
};

/**
 * Initialize Paystack Transaction
 * @param {Object} paymentData - Payment details
 * @returns {Promise} Paystack response
 */
const initializeTransaction = async (paymentData) => {
    try {
        const paystack = getPaystackClient();
        const response = await paystack.transaction.initialize(paymentData);
        return response;
    } catch (error) {
        console.error("[Paystack] Error initializing transaction:", error.message);
        
        // Provide more helpful error messages
        if (error.message && error.message.includes("Authorization")) {
            throw new Error("Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.");
        }
        throw error;
    }
};

/**
 * Verify Paystack Transaction
 * @param {String} reference - Transaction reference
 * @returns {Promise} Paystack response
 */
const verifyTransaction = async (reference) => {
    try {
        const paystack = getPaystackClient();
        const response = await paystack.transaction.verify(reference);
        return response;
    } catch (error) {
        if (error.message && error.message.includes("Authorization")) {
            throw new Error("Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.");
        }
        throw error;
    }
};

/**
 * Create Paystack Refund
 * @param {String} transaction - Transaction reference or ID
 * @param {Number} amount - Amount to refund (optional, full refund if not provided)
 * @returns {Promise} Paystack response
 */
const createRefund = async (transaction, amount = null) => {
    try {
        const paystack = getPaystackClient();
        const refundData = {
            transaction,
            ...(amount && { amount: amount * 100 }) // Convert to kobo
        };
        const response = await paystack.refund.create(refundData);
        return response;
    } catch (error) {
        if (error.message && error.message.includes("Authorization")) {
            throw new Error("Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.");
        }
        throw error;
    }
};

module.exports = {
    getPaystackClient,
    initializeTransaction,
    verifyTransaction,
    createRefund
};

