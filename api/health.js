// GET /api/health: uptime check. Reports which services are configured (never the values).
const { razorpayConfigured, testMode } = require('./_lib/razorpay');
const { mailConfigured } = require('./_lib/mail');

module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    ok: true,
    email: mailConfigured(),
    payments: razorpayConfigured() ? (testMode() ? 'test' : 'live') : false,
    webhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    time: new Date().toISOString(),
  }));
};
