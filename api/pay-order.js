// POST /api/pay-order
// Creates a Razorpay Order for an advance payment (used on phones with Razorpay Checkout,
// which shows the UPI app list). The amount is fixed here on the server; the browser only
// receives the order id, the amount and the PUBLIC key id (which cannot move money).
const { send, readJson, sameOrigin, clientIp, rateLimiter } = require('./_lib/http');
const { rzp, razorpayConfigured, testMode, keyId, qrToken } = require('./_lib/razorpay');
const { parsePayment, paymentNotes } = require('./_lib/validate');

const ipLimited = rateLimiter(20, 10 * 60 * 1000);
const phoneLimited = rateLimiter(5, 10 * 60 * 1000);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  let b;
  try { b = await readJson(req); } catch { return send(res, 400, { error: 'Invalid request' }); }
  const { error, data: d } = parsePayment(b);
  if (error) return send(res, 400, { error });

  if (!razorpayConfigured()) {
    console.error('[pay-order] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured');
    return send(res, 503, { error: 'Online payment is not available right now. Please call us.' });
  }
  if (ipLimited(clientIp(req)) || phoneLimited(d.phone)) {
    res.setHeader('Retry-After', '120');
    return send(res, 429, { error: 'Too many payment attempts. Please wait a few minutes or call us.' });
  }

  try {
    const order = await rzp('POST', '/orders', {
      amount: d.paise,
      currency: 'INR',
      receipt: `web-${Date.now().toString(36)}-${d.phone.slice(-4)}`,
      notes: paymentNotes(d),
    });
    if (!order?.id || order.amount !== d.paise) throw new Error('Unexpected Razorpay response');
    return send(res, 201, {
      orderId: order.id,
      token: qrToken(order.id),
      key: keyId(),
      amount: order.amount,
      description: `Advance payment - ${d.product}`.slice(0, 250),
      prefill: { name: d.name, contact: `+91${d.phone}`, email: d.email },
      test: testMode(),
    });
  } catch (err) {
    console.error('[pay-order] create failed:', err.status || '', err.code || '', err.message);
    return send(res, 502, { error: 'Could not start the payment right now. Please try again or call us.' });
  }
};
