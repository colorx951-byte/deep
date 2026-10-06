// Vercel serverless function: POST /api/enquiries
// Validates the enquiry form and emails it to the sales inbox via SMTP (Namecheap Private Email).
// Required env vars: SMTP_USER, SMTP_PASS. Optional: SMTP_HOST, SMTP_PORT, ENQUIRY_TO.
const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const TO = process.env.ENQUIRY_TO || 'admin@deepenterprises.world';
const SMTP_HOST = process.env.SMTP_HOST || 'mail.privateemail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const MAX_BODY = 20000;

// Best-effort rate limit (per warm instance). Stops casual spam bursts.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), windowMs = 10 * 60 * 1000, max = 8;
  const h = hits.get(ip) || { n: 0, t: now };
  if (now - h.t > windowMs) { h.n = 0; h.t = now; }
  h.n += 1; hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.n > max;
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function readJson(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') return Promise.resolve(JSON.parse(req.body || '{}'));
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > MAX_BODY) { reject(new Error('too-large')); req.destroy(); } });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('bad-json')); } });
    req.on('error', reject);
  });
}

// Single-line fields: strip control chars (prevents header injection in subject/reply-to).
const line = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
// Multi-line field: keep newlines, strip other control chars.
const block = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, max);
const html = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }

  // Reject cross-site submissions.
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    try { if (new URL(origin).host !== host) return send(res, 403, { error: 'Forbidden' }); }
    catch { return send(res, 403, { error: 'Forbidden' }); }
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (limited(ip)) return send(res, 429, { error: 'Too many enquiries. Please try again later or call us.' });

  let b;
  try { b = await readJson(req); } catch { return send(res, 400, { error: 'Invalid request' }); }

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (line(b.hp_check, 200)) return send(res, 201, { ok: true });

  const d = {
    name: line(b.name, 80), company: line(b.company, 100), phone: line(b.phone, 20),
    email: line(b.email, 120), product: line(b.product, 160), quantity: line(b.quantity, 40),
    city: line(b.city, 120), message: block(b.message, 2000),
  };

  for (const k of ['name', 'phone', 'product', 'message']) {
    if (!d[k]) return send(res, 400, { error: `Please fill in the ${k} field.` });
  }
  if (!/^[0-9+()\-\s]{7,20}$/.test(d.phone)) return send(res, 400, { error: 'Please enter a valid phone number.' });
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return send(res, 400, { error: 'Please enter a valid email address.' });

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[enquiries] SMTP_USER / SMTP_PASS not configured');
    return send(res, 503, { error: 'Email service not configured' });
  }

  const rows = [
    ['Name', d.name], ['Company', d.company], ['Phone', d.phone], ['Email', d.email],
    ['Product / Requirement', d.product], ['Quantity', d.quantity], ['Delivery City', d.city],
  ].filter(([, v]) => v);

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nMessage:\n${d.message}\n\n— Sent from the Deep Enterprises website enquiry form`;
  const htmlBody = `<h2 style="font-family:Arial,sans-serif;color:#b71c1c">New website enquiry</h2>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#555"><b>${html(k)}</b></td><td style="padding:6px 0">${html(v)}</td></tr>`).join('')}
</table>
<p style="font-family:Arial,sans-serif;font-size:14px"><b>Message</b><br>${html(d.message).replace(/\n/g, '<br>')}</p>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#888">Sent from the Deep Enterprises website enquiry form.</p>`;

  try {
    // Resolve via the OS resolver (dns.lookup). Nodemailer's own DNS queries can stall for
    // minutes on some networks. Keep the real hostname for TLS certificate validation.
    let address = SMTP_HOST;
    try { address = (await dns.lookup(SMTP_HOST, { family: 4 })).address; } catch { /* fall back to hostname */ }
    const transporter = nodemailer.createTransport({
      host: address, port: SMTP_PORT, secure: SMTP_PORT === 465,
      name: 'deepenterprises.world',
      tls: { servername: SMTP_HOST },
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    });
    await transporter.sendMail({
      from: `"Deep Enterprises Website" <${process.env.SMTP_USER}>`,
      to: TO,
      replyTo: d.email ? `"${d.name.replace(/"/g, '')}" <${d.email}>` : undefined,
      subject: `New enquiry: ${d.product} (${d.name})`.slice(0, 200),
      text,
      html: htmlBody,
    });
    return send(res, 201, { ok: true });
  } catch (err) {
    console.error('[enquiries] send failed:', err && err.message);
    return send(res, 502, { error: 'Could not send the enquiry right now.' });
  }
};
