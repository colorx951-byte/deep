// POST /api/pay-qr
// Creates a single-use, fixed-amount, expiring Razorpay UPI QR for an advance payment.
// Used on computers. The browser never talks to Razorpay and never sees any key.
const { send, readJson, sameOrigin, clientIp, rateLimiter } = require('./_lib/http');
const { rzp, razorpayConfigured, testMode, qrToken } = require('./_lib/razorpay');
const { parsePayment, paymentNotes } = require('./_lib/validate');

const EXPIRY_MIN = Math.max(5, Number(process.env.PAY_QR_EXPIRY_MIN || 15));
// Per IP: allows several customers on one office/mobile network.
// Per mobile number: one customer can't spam QR codes by switching networks.
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
    console.error('[pay-qr] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured');
    return send(res, 503, { error: 'Online payment is not available right now. Please call us.' });
  }
  // Counted only for valid requests, so typos don't lock a customer out.
  if (ipLimited(clientIp(req)) || phoneLimited(d.phone)) {
    res.setHeader('Retry-After', '120');
    return send(res, 429, { error: 'Too many payment attempts. Please wait a few minutes or call us.' });
  }

  const closeBy = Math.floor(Date.now() / 1000) + EXPIRY_MIN * 60;
  try {
    const qr = await rzp('POST', '/payments/qr_codes', {
      type: 'upi_qr',
      name: 'Deep Enterprises',
      usage: 'single_use',
      fixed_amount: true,
      payment_amount: d.paise,
      description: `Advance payment - ${d.product}`.slice(0, 250),
      close_by: closeBy,
      notes: paymentNotes(d),
    });

    if (!qr?.id || !/^https:\/\//.test(qr.image_url || '')) throw new Error('Unexpected Razorpay response');
    return send(res, 201, {
      id: qr.id,
      token: qrToken(qr.id),
      image: qr.image_url,
      amount: d.paise,
      closeBy: qr.close_by || closeBy,
      test: testMode(),
    });
  } catch (err) {
    console.error('[pay-qr] create failed:', err.status || '', err.code || '', err.message);
    return send(res, 502, { error: 'Could not create the payment QR right now. Please try again or call us.' });
  }
};
