// POST /api/enquiries
// Validates the enquiry form and emails it to the sales inbox via SMTP (Namecheap Private Email).
// Required env vars: SMTP_USER, SMTP_PASS. Optional: SMTP_HOST, SMTP_PORT, ENQUIRY_TO.
const { send, readJson, sameOrigin, clientIp, rateLimiter, line, block, html } = require('./_lib/http');
const { sendMail, mailConfigured } = require('./_lib/mail');

const limited = rateLimiter(8, 10 * 60 * 1000);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  if (limited(clientIp(req))) return send(res, 429, { error: 'Too many enquiries. Please try again later or call us.' });

  let b;
  try { b = await readJson(req); } catch { return send(res, 400, { error: 'Invalid request' }); }

  // Honeypot: bots fill the hidden field. Pretend success.
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

  if (!mailConfigured()) {
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
    await sendMail({
      replyTo: d.email ? `"${d.name.replace(/"/g, '')}" <${d.email}>` : undefined,
      subject: `New enquiry: ${d.product} (${d.name})`,
      text,
      html: htmlBody,
    });
    return send(res, 201, { ok: true });
  } catch (err) {
    console.error('[enquiries] send failed:', err && err.message);
    return send(res, 502, { error: 'Could not send the enquiry right now.' });
  }
};
