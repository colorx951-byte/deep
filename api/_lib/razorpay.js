// Minimal server-side Razorpay client. The key secret is read from environment
// variables only and never leaves the server.
const crypto = require('crypto');

const API = 'https://api.razorpay.com/v1';
const keyId = () => process.env.RAZORPAY_KEY_ID || '';
const keySecret = () => process.env.RAZORPAY_KEY_SECRET || '';

const razorpayConfigured = () => Boolean(keyId() && keySecret());
const testMode = () => keyId().startsWith('rzp_test_');

async function rzp(method, path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${keyId()}:${keySecret()}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.description || `Razorpay HTTP ${res.status}`);
      err.status = res.status;
      err.code = data?.error?.code;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Proof that a QR id / order id was issued by this site to this browser. Lets the
// browser check status for its own payment without turning the status endpoint into
// a lookup tool for any id. The id prefix (qr_ / order_) is part of the HMAC input.
function qrToken(id) {
  return crypto.createHmac('sha256', `qr-status:${keySecret()}`).update(id).digest('hex').slice(0, 32);
}

// Razorpay Checkout signature: HMAC-SHA256("order_id|payment_id") with the key secret.
function validCheckoutSignature(orderId, paymentId, signature) {
  if (!keySecret() || !/^[a-f0-9]{64}$/.test(String(signature || ''))) return false;
  const expected = crypto.createHmac('sha256', keySecret()).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, signature);
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Razorpay webhook signature: HMAC-SHA256 of the raw body with the webhook secret.
function validWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}

module.exports = { rzp, razorpayConfigured, testMode, keyId, qrToken, safeEqual, validWebhookSignature, validCheckoutSignature };
