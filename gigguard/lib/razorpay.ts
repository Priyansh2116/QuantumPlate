import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

function getClient(): Razorpay | null {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null; // keys not configured — use simulated mode
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  simulated: boolean;
}

/** Create a Razorpay order for policy payment */
export async function createPremiumOrder(
  premiumRs: number,
  workerId: string,
  notes?: Record<string, string>
): Promise<OrderResult> {
  const client = getClient();

  if (!client) {
    // Simulated mode — auto-generate order ID
    return {
      orderId: `order_sim_${Date.now()}`,
      amount: premiumRs * 100,
      currency: "INR",
      simulated: true,
    };
  }

  const order = await client.orders.create({
    amount: premiumRs * 100, // paise
    currency: "INR",
    notes: {
      workerId,
      type: "gigguard_weekly_premium",
      ...notes,
    },
  });

  return {
    orderId: order.id,
    amount: premiumRs * 100,
    currency: "INR",
    simulated: false,
  };
}

/** Verify Razorpay payment signature */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const client = getClient();
  if (!client) return true; // simulated — always pass

  const body = `${params.orderId}|${params.paymentId}`;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === params.signature;
}

/** Simulate UPI payout (no real payout API in test mode) */
export async function initiatePayout(params: {
  workerId: string;
  amount: number;
  upiId?: string;
  purpose: string;
}): Promise<{ payoutId: string; status: string; simulated: boolean }> {
  // Razorpay Payouts API requires production account — always simulate for hackathon
  return {
    payoutId: `pout_sim_${Date.now()}`,
    status: "processed",
    simulated: true,
  };
}
