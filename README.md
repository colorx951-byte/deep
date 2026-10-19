# Deep Enterprises — Website

This is the fire and safety website for Deep Enterprises. The pages are static HTML/CSS/JS. There is one serverless function: it emails website enquiries to **admin@deepenterprises.world** using Namecheap Private Email SMTP. The site runs on **Vercel** and deploys automatically from GitHub.

## Structure
- `*.html`: the pages (home, about, products, category, product, services, contact, FAQ, legal)
- `css/style.css`, `js/main.js`: styles and shared UI
- `data/site.js`: all company, product and contact content (edit this to change the text)
- `assets/images/`: logo, hero image and product images
- `api/enquiries.js`: `POST /api/enquiries`. It validates the form and emails it to the sales inbox
- `api/health.js`: `GET /api/health`. It reports `email: true` once SMTP is configured
- `vercel.json`: security and cache headers
- `.vercelignore`: files kept off the live site (source docx, raw photos, local server)
- `serve.js`: local preview server only (not deployed)

## Local preview
```
npm install
copy .env.example .env      (then put the real mailbox password in .env)
npm run dev                  → http://localhost:3000
```
Never commit `.env`. It is already listed in `.gitignore`.

## Deploy: GitHub → Vercel → Namecheap

1. **Push to GitHub**
   ```
   git init
   git add .
   git commit -m "Deep Enterprises website"
   git branch -M main
   git remote add origin https://github.com/<you>/deep-enterprises-website.git
   git push -u origin main
   ```
2. **Import into Vercel.** Go to vercel.com → Add New → Project → pick the repo. Set Framework Preset to **Other** and leave the build command and output directory empty. Click Deploy.
3. **Environment variables.** In Vercel go to Project → Settings → Environment Variables and add:
   | Name | Value |
   |---|---|
   | `SMTP_HOST` | `mail.privateemail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `admin@deepenterprises.world` |
   | `SMTP_PASS` | the mailbox password |
   | `ENQUIRY_TO` | `admin@deepenterprises.world` |
   Then **redeploy** so the function picks them up. To confirm, open `https://<your-site>/api/health` and check that it shows `"email": true`.
4. **Connect the domain.** In Vercel go to Project → Settings → Domains and add `deepenterprises.world` and `www.deepenterprises.world`. Vercel shows the DNS records to create. In Namecheap go to Domain List → Manage → **Advanced DNS** and add them. They are usually:
   - `A` record, host `@` → `76.76.21.21`
   - `CNAME` record, host `www` → `cname.vercel-dns.com`

   Use the exact values Vercel shows if they differ. Delete Namecheap's default parking `CNAME www` and `URL Redirect @` records if they are present. **Do not touch the MX / TXT (SPF, DKIM) records for Private Email**, or the mailbox will stop receiving mail. DNS changes can take from a few minutes up to a few hours.

## How enquiries work
- The contact form sends JSON to `/api/enquiries`. The function validates it, applies a hidden honeypot and a basic rate limit, then emails the enquiry. Replying to that email goes straight to the customer if they entered an email address.
- If sending fails (for example, SMTP is not configured yet), the visitor sees links to email, call or WhatsApp instead. The enquiry is never silently lost.

## Advance payments (UPI QR via Razorpay)
Every product card, category page and product page has a **Pay Advance** button. The customer enters their name, mobile, optional email and reference, and the agreed amount. The site then shows a **single-use, fixed-amount UPI QR that expires in 15 minutes**, created by Razorpay for that one payment. The page checks with Razorpay every few seconds and shows "Payment Received" once Razorpay confirms it.

**How the keys stay safe**
- The Razorpay Key ID, Key Secret and webhook secret exist only in environment variables (`.env` locally, Vercel settings in production). No key appears in any HTML or JS file, and no Razorpay script runs in the browser.
- The browser only calls this site's own endpoints:
  - `POST /api/pay-qr` checks the input (amount ₹1–₹1,00,000 by default, mobile number, same-site origin, rate limit), then creates the QR on the server.
  - `GET /api/pay-status` returns only pending, paid or expired, read from Razorpay. It only works for QR codes this site created, using a signed token.
  - `POST /api/razorpay-webhook` is called by Razorpay directly. Its signature is checked before anything is trusted. It then emails the sales inbox and the customer (if they gave an email).
- The customer details are stored as `notes` on each QR, so every payment in the Razorpay dashboard shows the customer name, mobile, product and reference.

**Phones: UPI app list (Razorpay Checkout)**
On phones, Pay Advance opens Razorpay Checkout on the UPI app list instead of a QR. The mobile number is filled in and locked. Customers can still choose "Show a QR code instead".
- `POST /api/pay-order` runs the same checks as the QR flow (shared `api/_lib/validate.js`). It creates a Razorpay Order on the server and returns only the order id, the amount and the **public** Key ID.
- `POST /api/pay-verify` checks the Checkout signature (HMAC of `order_id|payment_id` with the Key Secret). It then fetches the payment from Razorpay and confirms it belongs to the order, matches the amount exactly, and is captured.
- `GET /api/pay-status` also accepts order ids (same signed-token protection), so the page can resume confirming if the phone browser reloads while the customer is in the UPI app.
- The webhook handles `order.paid` for these payments (only orders created by this website).
- `vercel.json` CSP allows Razorpay's domains only (`checkout.razorpay.com`, `*.razorpay.com`) for scripts, frames and connections. `serve.js` applies the same headers locally.

**Setup**
1. In the Razorpay dashboard, make sure **QR Codes** are enabled for your account. If they aren't, ask Razorpay support to enable them.
2. Go to Account & Settings → API Keys and generate **test** keys. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`, and later to Vercel.
3. Pick any long random string for `RAZORPAY_WEBHOOK_SECRET` and add it to `.env`/Vercel.
4. After deploying, go to Razorpay → Webhooks → Add New Webhook:
   - URL: `https://www.deepenterprises.world/api/razorpay-webhook` (with `www`; Razorpay doesn't follow redirects)
   - Secret: the same `RAZORPAY_WEBHOOK_SECRET`
   - Active events: **`qr_code.credited`** and **`order.paid`**
   - Also set Payment Capture to **automatic** (Account & Settings → Capture settings).
5. Open `/api/health`. It should show `"payments": "test"` (or `"live"`) and `"webhook": true`.
6. When testing is done, swap in the `rzp_live_...` keys on Vercel, update the webhook in live mode, and redeploy.

Optional limits: `PAY_MIN_INR`, `PAY_MAX_INR` (many banks cap a single UPI payment at ₹1,00,000) and `PAY_QR_EXPIRY_MIN`.

## Notes
- The old admin dashboard (`admin.html`) is **not deployed**. It stored enquiries in a local JSON file, and Vercel's serverless filesystem doesn't keep files. On Vercel, the `admin@deepenterprises.world` inbox is the enquiry record. If you need a dashboard, it would need a database (for example Vercel Postgres or Supabase).
- The legal pages are still drafts and should be reviewed before launch.
