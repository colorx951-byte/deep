// Shared validation for advance payments (used by both the QR flow and the Checkout flow),
// so the two flows can never accept different inputs.
const { line } = require('./http');

const MIN_INR = Number(process.env.PAY_MIN_INR || 200);
const MAX_INR = Number(process.env.PAY_MAX_INR || 100000);

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

// Returns { error } or { data: { name, phone, email, product, reference, paise } }.
function parsePayment(b) {
  if (line(b.hp_check, 200)) return { error: 'Invalid request' }; // bot honeypot
  const name = line(b.name, 80);
  const phone = toMobile(b.phone);
  const email = line(b.email, 120);
  const product = line(b.product, 120);
  const reference = line(b.reference, 40);
  const paise = toPaise(b.amount);

  if (name.length < 2) return { error: 'Please enter your name.' };
  if (!phone) return { error: 'Please enter a valid 10-digit mobile number.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (!product) return { error: 'Please choose a product.' };
  if (paise === null) return { error: 'Please enter a valid amount, e.g. 2500 or 2500.50.' };
  if (paise < MIN_INR * 100) return { error: `Minimum advance amount is ₹${MIN_INR.toLocaleString('en-IN')}.` };
  if (paise > MAX_INR * 100) return { error: `Maximum advance amount is ₹${MAX_INR.toLocaleString('en-IN')} per payment.` };
  return { data: { name, phone, email, product, reference, paise } };
}

// Stored on the QR / order, shown next to the payment in the Razorpay dashboard.
const paymentNotes = (d) => ({
  purpose: 'Advance order',
  customer_name: d.name,
  customer_phone: d.phone,
  customer_email: d.email,
  product: d.product,
  reference: d.reference,
  source: 'website',
});

module.exports = { toPaise, toMobile, parsePayment, paymentNotes };
