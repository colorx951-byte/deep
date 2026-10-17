// Sends email through Namecheap Private Email SMTP.
const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const SMTP_HOST = process.env.SMTP_HOST || 'mail.privateemail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const INBOX = process.env.ENQUIRY_TO || 'admin@deepenterprises.world';

const mailConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

async function sendMail({ to = INBOX, subject, text, html, replyTo }) {
  // Resolve via the OS resolver (dns.lookup). Nodemailer's own DNS queries can stall for
  // minutes on some networks. Keep the real hostname for TLS certificate validation.
  let address = SMTP_HOST;
  try { address = (await dns.lookup(SMTP_HOST, { family: 4 })).address; } catch { /* use hostname */ }
  const transporter = nodemailer.createTransport({
    host: address, port: SMTP_PORT, secure: SMTP_PORT === 465,
    name: 'deepenterprises.world',
    tls: { servername: SMTP_HOST },
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
  });
  return transporter.sendMail({
    from: `"Deep Enterprises" <${process.env.SMTP_USER}>`,
    to, replyTo, subject: String(subject).slice(0, 200), text, html,
  });
}

module.exports = { sendMail, mailConfigured, INBOX };
