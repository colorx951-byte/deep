// POST /api/pay-qr
// Creates a single-use, fixed-amount, expiring Razorpay UPI QR for an advance payment.
// The browser never talks to Razorpay and never sees any key.
const { send, readJson, sameOrigin, clientIp, rateLimiter, line } = require('./_lib/http');
const { rzp, razorpayConfigured, testMode, qrToken } = require('./_lib/razorpay');

const MIN_INR = Number(process.env.PAY_MIN_INR || 1);
const MAX_INR = Number(process.env.PAY_MAX_INR || 100000);
const EXPIRY_MIN = Math.max(5, Number(process.env.PAY_QR_EXPIRY_MIN || 15));
// Per IP: allows several customers on one office/mobile network.
// Per mobile number: one customer can't spam QR codes by switching networks.
const ipLimited = rateLimiter(20, 10 * 60 * 1000);
const phoneLimited = rateLimiter(5, 10 * 60 * 1000);

// Rupees string (up to 2 decimals) -> integer paise, without floating-point errors.
function toPaise(input) {
  const s = String(input ?? '').replace(/[,\s₹]/g, '');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) return null;
  const [r, p = ''] = s.split('.');
  return Number(r) * 100 + Number(p.padEnd(2, '0'));
}

// Indian mobile number -> 10 digits, or null.
function toMobile(input) {
  let d = String(input ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });

  let b;
  try { b = await readJson(req); } catch { return send(res, 400, { error: 'Invalid request' }); }
  if (line(b.hp_check, 200)) return send(res, 400, { error: 'Invalid request' }); // bot honeypot

  const name = line(b.name, 80);
  const phone = toMobile(b.phone);
  const email = line(b.email, 120);
  const product = line(b.product, 120);
  const reference = line(b.reference, 40);
  const paise = toPaise(b.amount);

  if (name.length < 2) return send(res, 400, { error: 'Please enter your name.' });
  if (!phone) return send(res, 400, { error: 'Please enter a valid 10-digit mobile number.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
  if (!product) return send(res, 400, { error: 'Please choose a product.' });
  if (paise === null) return send(res, 400, { error: 'Please enter a valid amount, e.g. 2500 or 2500.50.' });
  if (paise < MIN_INR * 100 || paise > MAX_INR * 100) {
    return send(res, 400, { error: `Amount must be between ₹${MIN_INR.toLocaleString('en-IN')} and ₹${MAX_INR.toLocaleString('en-IN')}.` });
  }

  if (!razorpayConfigured()) {
    console.error('[pay-qr] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured');
    return send(res, 503, { error: 'Online payment is not available right now. Please call us.' });
  }
  // Counted only for valid requests, so typos don't lock a customer out.
  if (ipLimited(clientIp(req)) || phoneLimited(phone)) {
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
      payment_amount: paise,
      description: `Advance payment - ${product}`.slice(0, 250),
      close_by: closeBy,
      // Shown next to the payment in the Razorpay dashboard / monitoring system.
      notes: {
        purpose: 'Advance order',
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        product,
        reference,
        source: 'website',
      },
    });

    if (!qr?.id || !/^https:\/\//.test(qr.image_url || '')) throw new Error('Unexpected Razorpay response');
    return send(res, 201, {
      id: qr.id,
      token: qrToken(qr.id),
      image: qr.image_url,
      amount: paise,
      closeBy: qr.close_by || closeBy,
      test: testMode(),
    });
  } catch (err) {
    console.error('[pay-qr] create failed:', err.status || '', err.code || '', err.message);
    return send(res, 502, { error: 'Could not create the payment QR right now. Please try again or call us.' });
  }
};
