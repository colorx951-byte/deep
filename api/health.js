// GET /api/health — simple uptime check. Reports whether email is configured (never the values).
module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ok: true, email: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS), time: new Date().toISOString() }));
};
