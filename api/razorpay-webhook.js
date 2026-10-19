// POST /api/razorpay-webhook
// Razorpay calls this server-to-server when an advance is paid:
//   qr_code.credited  - computer QR flow
//   order.paid        - phone Checkout (UPI app) flow
// The signature is verified against the raw body before anything is trusted.
// On success it emails the sales inbox (and the customer, if they gave an email).
const { send, readRaw, html } = require('./_lib/http');
const { validWebhookSignature } = require('./_lib/razorpay');
const { sendMail, mailConfigured, INBOX } = require('./_lib/mail');

const handled = new Set(); // best-effort de-duplication of Razorpay retries (per warm instance)
const rupees = (paise) => `₹${(Number(paise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

async function notify({ pay, notes: n, refLabel, refId }) {
  const rows = [
    ['Amount', rupees(pay.amount)], ['Payment ID', pay.id], [refLabel, refId],
    ['Paid via', pay.vpa || pay.method || 'UPI'], ['Paid at', pay.created_at ? new Date(pay.created_at * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''],
    ['Customer', n.customer_name], ['Mobile', n.customer_phone], ['Email', n.customer_email],
    ['Product', n.product], ['Reference', n.reference],
  ].filter(([, v]) => v);
  const table = `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:5px 14px 5px 0;color:#555"><b>${html(k)}</b></td><td>${html(v)}</td></tr>`).join('')}</table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  await sendMail({
    to: process.env.PAYMENT_NOTIFY_TO || INBOX,
    subject: `Advance received ${rupees(pay.amount)} - ${n.customer_name || ''} (${n.product || 'website'})`,
    text: `Advance payment received (verified by Razorpay webhook).\n\n${text}`,
    html: `<h2 style="font-family:Arial,sans-serif;color:#15803d">Advance payment received</h2><p style="font-family:Arial,sans-serif;font-size:13px;color:#555">Verified by Razorpay webhook signature.</p>${table}`,
  });
  if (n.customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(n.customer_email)) {
    await sendMail({
      to: n.customer_email,
      subject: `Payment received - Deep Enterprises (${rupees(pay.amount)})`,
      text: `Dear ${n.customer_name || 'Customer'},\n\nWe have received your advance payment of ${rupees(pay.amount)} for ${n.product || 'your order'}.\nPayment ID: ${pay.id}\n\nOur team will contact you shortly to coordinate the order.\n\nDeep Enterprises\n+91 74590 25437`,
    }).catch((e) => console.error('[webhook] customer email failed:', e.message));
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }

  let raw;
  try { raw = await readRaw(req, 200000); } catch { return send(res, 400, { error: 'Invalid body' }); }
  if (!validWebhookSignature(raw, req.headers['x-razorpay-signature'])) {
    console.warn('[webhook] rejected: invalid signature');
    return send(res, 401, { error: 'Invalid signature' });
  }

  let evt;
  try { evt = JSON.parse(raw); } catch { return send(res, 400, { error: 'Invalid JSON' }); }

  const pay = evt.payload?.payment?.entity || {};
  let info;
  if (evt.event === 'qr_code.credited') {
    const qr = evt.payload?.qr_code?.entity || {};
    info = { pay, notes: qr.notes || {}, refLabel: 'QR ID', refId: qr.id };
  } else if (evt.event === 'order.paid') {
    const order = evt.payload?.order?.entity || {};
    // Only orders created by this website's advance-payment flow.
    if ((order.notes || {}).source !== 'website') return send(res, 200, { ok: true, ignored: 'not-website-order' });
    info = { pay, notes: order.notes || {}, refLabel: 'Order ID', refId: order.id };
  } else {
    return send(res, 200, { ok: true, ignored: evt.event });
  }

  const key = req.headers['x-razorpay-event-id'] || pay.id || info.refId;
  if (key && handled.has(key)) return send(res, 200, { ok: true, duplicate: true });
  console.log('[webhook]', evt.event, info.refId, pay.id, pay.amount, info.notes.customer_phone || '');

  if (mailConfigured()) {
    try {
      await notify(info);
    } catch (err) {
      // Non-2xx makes Razorpay retry later, so the notification is not lost.
      console.error('[webhook] notification email failed:', err.message);
      return send(res, 500, { error: 'Notification failed' });
    }
  }

  if (key) { handled.add(key); if (handled.size > 2000) handled.clear(); }
  return send(res, 200, { ok: true });
};
