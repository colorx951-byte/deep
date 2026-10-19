// Local preview server that mirrors the Vercel deployment:
// static files from the project root + the same /api functions in ./api.
// Run: node serve.js   (reads SMTP settings from .env if present)
const http = require('http');
const fs = require('fs');
const path = require('path');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env, fine */ }

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const API = {
  '/api/enquiries': require('./api/enquiries'),
  '/api/health': require('./api/health'),
  '/api/pay-qr': require('./api/pay-qr'),
  '/api/pay-status': require('./api/pay-status'),
  '/api/pay-order': require('./api/pay-order'),
  '/api/pay-verify': require('./api/pay-verify'),
  '/api/razorpay-webhook': require('./api/razorpay-webhook'),
};
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon',
};
// Same files Vercel won't publish (see .vercelignore).
const BLOCKED = new Set(['.env', '.env.example', '.git', '.vscode', '.vercel', 'node_modules', 'api',
  'fire_images', 'serve.js', 'package.json', 'package-lock.json', 'vercel.json', 'README.md', 'QA_FINAL.md',
  '.gitignore', '.vercelignore', 'Deep_Enterprises_Final_Website_Content_FINAL.docx']);

// Apply the same site-wide security headers as vercel.json, so CSP issues show up locally.
let SITE_HEADERS = [];
try {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  SITE_HEADERS = (v.headers || []).find((h) => h.source === '/(.*)')?.headers || [];
} catch { /* no vercel.json */ }
// HSTS is meaningless on http://localhost and would be sticky in the browser.
SITE_HEADERS = SITE_HEADERS.filter((h) => h.key.toLowerCase() !== 'strict-transport-security');

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

http.createServer((req, res) => {
  for (const h of SITE_HEADERS) res.setHeader(h.key, h.value);
  let urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0]); } catch { return notFound(res); }
  if (API[urlPath]) return API[urlPath](req, res);

  const rel = path.normalize(urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, ''));
  const first = rel.split(path.sep)[0];
  if (rel.startsWith('..') || path.isAbsolute(rel) || BLOCKED.has(first)) return notFound(res);
  if (first === 'data' && rel !== path.join('data', 'site.js')) return notFound(res);

  const file = path.join(ROOT, rel);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return notFound(res);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, () => console.log(`Deep Enterprises preview at http://localhost:${PORT}`));
