declare module 'paystack' {
  interface PaystackResponse<T = any> {
    status: boolean;
    message: string;
    data: T;
  }

  interface TransactionInitializeData {
    authorization_url: string;
    access_code: string;
    reference: string;
  }

  interface TransactionVerifyData {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    metadata?: any;
  }

  interface PaystackClient {
    transaction: {
      initialize(data: {
        email: string;
        amount: number;
        reference?: string;
        callback_url?: string;
        metadata?: any;
      }): Promise<PaystackResponse<TransactionInitializeData>>;
      
      verify(reference: string): Promise<PaystackResponse<TransactionVerifyData>>;
    };
    refund: {
      create(data: {
        transaction: string;
        amount?: number;
      }): Promise<PaystackResponse<any>>;
    };
  }

  function paystack(secretKey: string): PaystackClient;
  export = paystack;
}
