/**
 * Paystack Configuration
 * Handles Paystack API initialization and helper functions
 */

import paystack from 'paystack';

// Lazy initialization of Paystack client
let paystackClient: ReturnType<typeof paystack> | null = null;

interface PaymentData {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const getPaystackClient = (): ReturnType<typeof paystack> => {
  if (!paystackClient) {
    let secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!secretKey) {
      console.error('[Paystack] ERROR: PAYSTACK_SECRET_KEY is not set!');
      throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables. Please add it to your .env file.');
    }
    
    // Trim whitespace
    secretKey = secretKey.trim();
    
    if (secretKey.length === 0) {
      console.error('[Paystack] ERROR: PAYSTACK_SECRET_KEY is empty!');
      throw new Error('PAYSTACK_SECRET_KEY is empty. Please check your .env file.');
    }
    
    paystackClient = paystack(secretKey);
  }
  return paystackClient;
};

/**
 * Initialize Paystack Transaction
 * @param paymentData - Payment details
 * @returns Paystack response
 */
const initializeTransaction = async (paymentData: PaymentData): Promise<PaystackResponse> => {
  try {
    const paystack = getPaystackClient();
    const response = await paystack.transaction.initialize(paymentData);
    return response as PaystackResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Paystack] Error initializing transaction:', errorMessage);
    
    // Provide more helpful error messages
    if (errorMessage.includes('Authorization')) {
      throw new Error('Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.');
    }
    throw error;
  }
};

/**
 * Verify Paystack Transaction
 * @param reference - Transaction reference
 * @returns Paystack response
 */
const verifyTransaction = async (reference: string): Promise<PaystackResponse> => {
  try {
    const paystack = getPaystackClient();
    const response = await paystack.transaction.verify(reference);
    return response as PaystackResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Authorization')) {
      throw new Error('Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.');
    }
    throw error;
  }
};

/**
 * Create Paystack Refund
 * @param transaction - Transaction reference or ID
 * @param amount - Amount to refund (optional, full refund if not provided)
 * @returns Paystack response
 */
const createRefund = async (transaction: string, amount: number | null = null): Promise<PaystackResponse> => {
  try {
    const paystack = getPaystackClient();
    const refundData: { transaction: string; amount?: number } = {
      transaction,
      ...(amount && { amount: amount * 100 }) // Convert to kobo
    };
    const response = await paystack.refund.create(refundData);
    return response as PaystackResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Authorization')) {
      throw new Error('Paystack secret key is invalid or not set. Please check PAYSTACK_SECRET_KEY in your .env file.');
    }
    throw error;
  }
};

export {
  getPaystackClient,
  initializeTransaction,
  verifyTransaction,
  createRefund
};

export type { PaymentData, PaystackResponse };
