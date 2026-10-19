(() => {
  'use strict';
  const S = window.SITE || {};
  const page = document.body.dataset.page || 'home';
  const esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const qs = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>[...r.querySelectorAll(s)];
  const getParam = k => new URLSearchParams(location.search).get(k);

  const phoneHref = (value='') => value.replace(/[^\d+]/g,'');
  const pathName = () => location.pathname.split('/').pop() || 'index.html';

  function header(){
    const el=qs('#site-header'); if(!el) return;
    const path=pathName();
    const nav=(S.nav||[]).map(n=>`<li><a class="${path===n.href?'active':''}" href="${esc(n.href)}">${esc(n.label)}</a></li>`).join('');
    const drawer=(S.nav||[]).map(n=>`<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    el.innerHTML=`
      <div class="topbar">
        <div class="container topbar-inner">
          <span>${esc(S.company?.tagline||'Fire & Safety Products')} <span class="topbar-divider">|</span> Serving Customers Across India</span>
          <span>${S.company?.email?`<a href="mailto:${esc(S.company.email)}">${esc(S.company.email)}</a> <span class="topbar-divider">|</span> `:''}${S.company?.phone?`<a href="tel:${esc(phoneHref(S.company.phone))}">${esc(S.company.phone)}</a>`:''}</span>
        </div>
      </div>
      <header class="navbar">
        <div class="container nav-inner">
          <a class="brand" href="index.html" aria-label="${esc(S.company?.name||'Deep Enterprises')} home">
            <img src="${esc(S.company?.logo||'assets/images/brand/logo.svg')}" alt="${esc(S.company?.name||'Deep Enterprises')}" onerror="this.style.display='none'"/>
          </a>
          <nav class="desktop-nav" aria-label="Main navigation"><ul class="nav-links">${nav}</ul></nav>
          <div class="nav-actions">
            <a class="btn btn-outline-dark header-call" href="tel:${esc(phoneHref(S.company?.phone||''))}">Call Now</a>
            <a class="btn btn-primary header-quote" href="contact.html#enquiry">Get a Quote <span>→</span></a>
            <button class="mobile-toggle" type="button" aria-expanded="false" aria-controls="nav-drawer" aria-label="Open menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>
      <div class="nav-drawer" id="nav-drawer" aria-label="Mobile navigation">
        ${drawer}
        <div class="drawer-actions">
          <a class="btn btn-outline-dark" href="tel:${esc(phoneHref(S.company?.phone||''))}">Call Now</a>
          <a class="btn btn-primary" href="contact.html#enquiry">Get a Quote →</a>
        </div>
      </div>`;
    const t=qs('.mobile-toggle'), d=qs('#nav-drawer');
    const close=()=>{d?.classList.remove('open');t?.setAttribute('aria-expanded','false');t?.setAttribute('aria-label','Open menu');document.body.classList.remove('nav-open')};
    t?.addEventListener('click',()=>{const open=!d.classList.contains('open');d.classList.toggle('open',open);t.setAttribute('aria-expanded',String(open));t.setAttribute('aria-label',open?'Close menu':'Open menu');document.body.classList.toggle('nav-open',open)});
    qsa('a',d).forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  function footer(){
    const el=qs('#site-footer'); if(!el)return;
    const nav=(S.nav||[]).map(n=>`<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    el.innerHTML=`<footer class="footer"><div class="container footer-grid"><div><a class="footer-brand" href="index.html"><img src="${esc(S.company?.logo||'assets/images/brand/logo.svg')}" alt="${esc(S.company?.name||'Deep Enterprises')}"/></a><p>${esc(S.company?.tagline||'Fire Safety Solution & Store')}</p><p>${esc(S.company?.address||'')}</p><p>${esc(S.company?.reach||'')}</p></div><div><h3>Quick Links</h3><div class="footer-links">${nav}<a href="faq.html">FAQs</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms & Conditions</a><a href="disclaimer.html">Disclaimer</a></div></div><div><h3>Contact</h3><div class="footer-links">${S.company?.phone?`<a href="tel:${esc(phoneHref(S.company.phone))}">${esc(S.company.phone)}</a>`:''}${S.company?.email?`<a href="mailto:${esc(S.company.email)}">${esc(S.company.email)}</a>`:''}${S.company?.whatsapp?`<a target="_blank" rel="noopener" href="https://wa.me/${esc(S.company.whatsapp)}">WhatsApp Us</a>`:''}</div><p class="footer-meta">GSTIN: ${esc(S.company?.gstin||'')}</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(S.company?.name||'Deep Enterprises')}. All rights reserved.</span><span>Fire & Safety Solution & Store · Jhansi, Uttar Pradesh</span></div></footer>${S.company?.whatsapp?`<a class="floating-wa" href="https://wa.me/${esc(S.company.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp Deep Enterprises">⌁</a>`:''}`;
  }

  function productCard(p){return `<article class="product-card"><a class="card-media-link" href="category.html?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.title)}"><div class="card-media"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"><span class="card-badge" aria-hidden="true">${esc(p.icon||'•')}</span></div></a><div class="card-body"><div><h3>${esc(p.title)}</h3><p>${esc(p.short)}</p></div><div class="card-actions"><a class="card-link" href="category.html?id=${encodeURIComponent(p.id)}">Enquire Now <span>→</span></a><button type="button" class="card-pay" data-pay-product="${esc(p.title)}">Pay Advance</button></div></div></article>`}

  function home(){
    const p=qs('#home-products'); if(p)p.innerHTML=S.products.items.map(productCard).join('');
    const a=qs('#application-list'); if(a)a.innerHTML=(S.applications||[]).map(x=>`<span>${esc(x)}</span>`).join('');
    const hero=qs('.hero-media img'); if(hero && S.hero?.image)hero.src=S.hero.image;
  }

  function products(){
    const grid=qs('#products-grid'), search=qs('#product-search'), filter=qs('#product-filter'), count=qs('#result-count');
    if(!grid)return;
    filter.innerHTML='<option value="all">All categories</option>'+S.products.items.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
    function render(){const q=(search.value||'').trim().toLowerCase(), f=filter.value; const items=S.products.items.filter(p=>(f==='all'||p.id===f)&&(!q||`${p.title} ${p.short} ${p.details?.join(' ')||''}`.toLowerCase().includes(q)));count.textContent=`${items.length} ${items.length===1?'category':'categories'}`;grid.innerHTML=items.length?items.map(productCard).join(''):'<div class="empty-state" style="grid-column:1/-1">Can’t find the product you need? Send us your requirement.</div>'}
    search.addEventListener('input',render); filter.addEventListener('change',render); render();
  }

  function category(){
    const id=getParam('id')||getParam('category')||S.products.items[0]?.id; const p=S.products.items.find(x=>x.id===id); const h=qs('#category-header'),g=qs('#category-products');
    if(!p){h.innerHTML='<div class="empty-state">Category not found.</div>';return;}
    document.title=`${p.title} | Deep Enterprises`;
    h.innerHTML=`<span class="eyebrow dark">PRODUCT CATEGORY</span><h1>${esc(p.title)}</h1><p>${esc(p.short)}</p><div class="detail-actions"><a class="btn btn-primary" href="contact.html?product=${encodeURIComponent(p.title)}#enquiry">Enquire Now →</a><button type="button" class="btn btn-outline-red" data-pay-product="${esc(p.title)}">Pay Advance via UPI</button></div>`;
    g.innerHTML=`<article class="category-feature"><div class="category-feature-media"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="category-feature-copy"><span class="eyebrow dark">CATEGORY SCOPE</span><h2>What this category can include</h2><div class="detail-list">${p.details.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p><strong>Common enquiry details:</strong> ${esc(p.enquiry)}</p></div></article><div class="related-wrap"><div class="section-head"><div><span class="eyebrow dark">EXPLORE MORE</span><h2>Related Product Categories</h2></div><a class="btn btn-outline-red" href="products.html">View All Products →</a></div><div class="product-grid">${S.products.items.filter(x=>x.id!==p.id).slice(0,6).map(productCard).join('')}</div></div>`;
  }

  function productDetail(){
    const id=getParam('id')||S.products.items[0]?.id, p=S.products.items.find(x=>x.id===id), el=qs('#product-detail');
    if(!p){el.innerHTML='<div class="empty-state">Product category not found.</div>';return}
    document.title=`${p.title} | Deep Enterprises`;
    el.innerHTML=`<div class="detail-breadcrumb"><a href="products.html">Products</a><span>→</span><span>${esc(p.title)}</span></div><div class="detail-shell"><div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="detail-copy"><div class="detail-topline"><span class="detail-icon">${esc(p.icon)}</span><span class="eyebrow dark">FIRE & SAFETY CATEGORY</span></div><h1>${esc(p.title)}</h1><p>${esc(p.short)}</p><h3>Product scope</h3><div class="detail-list">${p.details.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p><strong>Common enquiry details:</strong> ${esc(p.enquiry)}</p><div class="detail-enquiry"><h3>Interested in this category?</h3><p>Share product, quantity, specification, application or BOQ details and our team can respond with availability and quotation information.</p><div class="detail-actions"><a class="btn btn-white" href="contact.html?product=${encodeURIComponent(p.title)}#enquiry">Get Price & Availability →</a><button type="button" class="btn btn-ghost" data-pay-product="${esc(p.title)}">Pay Advance via UPI</button><a class="btn btn-ghost" href="products.html">Back to Products</a></div></div></div></div>`;
  }

  function services(){const g=qs('#services-grid');if(!g)return;g.innerHTML=S.services.map((s,i)=>`<article class="service-card"><div class="service-number">${String(i+1).padStart(2,'0')}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('')}
  function about(){const g=qs('#about-stats'); if(!g)return; g.innerHTML=(S.stats||[]).map(x=>`<article><b>${esc(x.value)}</b><span>${esc(x.label)}</span></article>`).join('')}

  async function enquiry(){
    const form=qs('#enquiry-form'); if(!form)return;
    const status=qs('#form-status'); const product=getParam('product'); if(product && qs('#form-product')) qs('#form-product').value=product;
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!form.reportValidity()) return;
      status.className='form-status'; status.textContent='Submitting your requirement…';
      const data=Object.fromEntries(new FormData(form).entries());
      const btn=form.querySelector('button[type="submit"]'); if(btn) btn.disabled=true;
      try{
        const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),45000);
        const res=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(data),signal:ctrl.signal}).finally(()=>clearTimeout(timer));
        const out=await res.json().catch(()=>({}));
        if(!res.ok){ const e=new Error(out.error||'Request failed'); e.userFacing=res.status===400||res.status===429; throw e; }
        form.reset(); if(product && qs('#form-product')) qs('#form-product').value=product;
        status.className='form-status ok'; status.textContent=S.contact?.successMessage||'Thank you for sharing your requirement. Our team will review the details and contact you shortly.';
      }catch(err){
        // Fall back to the visitor's email app so the enquiry is never silently lost.
        const email=S.company?.email||'';
        const body=Object.entries(data).filter(([k,v])=>k!=='hp_check'&&v).map(([k,v])=>`${k}: ${v}`).join('\n');
        const mailto=email?`mailto:${email}?subject=${encodeURIComponent('Website enquiry: '+(data.product||''))}&body=${encodeURIComponent(body)}`:'';
        status.className='form-status error';
        status.innerHTML=err.userFacing?esc(err.message):`We couldn't send your enquiry online. ${mailto?`<a href="${esc(mailto)}">Email it to us</a>, `:''}call <a href="tel:${esc(phoneHref(S.company?.phone||''))}">${esc(S.company?.phone||'')}</a> or <a target="_blank" rel="noopener" href="https://wa.me/${esc(S.company?.whatsapp||'')}">WhatsApp us</a>.`;
      }finally{ if(btn) btn.disabled=false; }
    });
  }

  function faq(){const el=qs('#faq-list');if(!el)return;el.innerHTML=S.faq.map(x=>`<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>${esc(x.q)}</span><span class="faq-icon">+</span></button><div class="faq-a"><p>${esc(x.a)}</p></div></div>`).join('');qsa('.faq-q',el).forEach(b=>b.addEventListener('click',()=>{const open=b.parentElement.classList.toggle('open');b.setAttribute('aria-expanded',String(open))}))}

  async function admin(){
    const root=qs('#admin-app'); if(!root)return;
    async function check(){const r=await fetch('/api/enquiries',{credentials:'same-origin'}); if(r.ok)return r.json(); return null}
    let data=await check();
    if(!data){root.innerHTML=`<div class="contact-panel admin-login"><span class="eyebrow dark">PRIVATE ACCESS</span><h2>Sales Admin Login</h2><p>Use the server-side admin password configured in <code>ADMIN_PASSWORD</code>.</p><form id="login-form"><label>Password<input name="password" type="password" required autocomplete="current-password"></label><button class="btn btn-primary" type="submit">Login →</button><p id="login-status" class="form-status"></p></form></div>`;qs('#login-form').addEventListener('submit',async e=>{e.preventDefault();const password=new FormData(e.currentTarget).get('password');const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({password})});if(r.ok){admin()}else qs('#login-status').textContent='Invalid password.'});return}
    function draw(items){root.innerHTML=`<div class="admin-top"><div><span class="eyebrow dark">SALES PIPELINE</span><h2>Enquiries (${items.length})</h2></div><div class="admin-actions"><button class="btn btn-outline-red" id="export-csv">Export CSV</button><button class="btn btn-primary" id="logout">Logout</button></div></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Date</th><th>Customer</th><th>Requirement</th><th>Location</th><th>Status</th></tr></thead><tbody>${items.map(i=>`<tr><td>${new Date(i.createdAt).toLocaleString()}</td><td><b>${esc(i.name)}</b><br>${esc(i.phone)}${i.company?`<br>${esc(i.company)}`:''}</td><td>${esc(i.product)}${i.quantity?` × ${esc(i.quantity)}`:''}<br><span class="admin-message">${esc(i.message)}</span></td><td>${esc(i.city||'—')}</td><td><select class="status-select" data-id="${esc(i.id)}">${['New','Contacted','Qualified','Quoted','Closed','Lost'].map(s=>`<option ${i.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="5">No enquiries yet.</td></tr>'}</tbody></table></div>`;qsa('.status-select',root).forEach(s=>s.addEventListener('change',async()=>{await fetch(`/api/enquiries/${encodeURIComponent(s.dataset.id)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({status:s.value})});admin()}));qs('#logout').addEventListener('click',async()=>{await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin'});admin()});qs('#export-csv').addEventListener('click',()=>{const headers=['id','createdAt','name','company','phone','email','product','quantity','city','message','status'];const rows=[headers,...items.map(x=>headers.map(h=>String(x[h]??'')))];const csv=rows.map(r=>r.map(v=>`"${v.replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`deep-enterprises-enquiries-${Date.now()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0)})}
    draw(data.enquiries||[]);
  }

  /* ---------- Advance payment ----------
     Phones: Razorpay Checkout opens on the UPI app list (GPay, PhonePe, Paytm, BHIM…).
     Computers: a single-use, fixed-amount, expiring UPI QR.
     The server sets the amount and verifies every payment with Razorpay; the browser
     only ever gets order/QR ids and the PUBLIC key id. */
  function payments(){
    const inr = (paise) => '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 });
    const PENDING_KEY = 'de_pending_payment';
    // Convenience check only; the server enforces the real minimum (PAY_MIN_INR).
    const PAY_MIN = Number(S.payments?.minInr || 200);
    // Phone = mobile user agent, or a touch-first small screen.
    const isPhone = () => /Android|iPhone|iPod|Mobile|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820);
    let modal, dialog, lastTrigger, pollTimer, tickTimer, current = null, forceQr = false, checkoutScript = null;

    function loadCheckout(){
      if (window.Razorpay) return Promise.resolve();
      if (checkoutScript) return checkoutScript;
      checkoutScript = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.async = true;
        s.onload = () => window.Razorpay ? resolve() : reject(new Error('Checkout unavailable'));
        s.onerror = () => { checkoutScript = null; s.remove(); reject(new Error('Checkout unavailable')); };
        document.head.appendChild(s);
      });
      return checkoutScript;
    }
    const savePending = (p) => { try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...p, at: Date.now() })); } catch {} };
    const clearPending = () => { try { sessionStorage.removeItem(PENDING_KEY); } catch {} };

    function build(){
      modal = document.createElement('div');
      modal.className = 'pay-modal'; modal.hidden = true;
      modal.innerHTML = `
        <div class="pay-backdrop" data-pay-close></div>
        <div class="pay-dialog" role="dialog" aria-modal="true" aria-labelledby="pay-title" tabindex="-1">
          <button type="button" class="pay-x" data-pay-close aria-label="Close payment window">×</button>

          <div class="pay-step" data-step="form">
            <span class="eyebrow dark">ADVANCE PAYMENT</span>
            <h2 id="pay-title">Pay Advance via UPI</h2>
            <p class="pay-sub" id="pay-form-sub"></p>
            <form id="pay-form" class="enquiry-form pay-form" novalidate>
              <div class="pay-product"><small>Product</small><b id="pay-product-label"></b></div>
              <input type="hidden" name="product">
              <div class="hp-field" aria-hidden="true"><label>Leave this field empty<input name="hp_check" tabindex="-1" autocomplete="off"></label></div>
              <div class="form-row">
                <label>Full Name*<input name="name" required minlength="2" maxlength="80" autocomplete="name"></label>
                <label>Mobile Number*<input name="phone" required inputmode="tel" maxlength="16" autocomplete="tel" placeholder="10-digit mobile"></label>
              </div>
              <div class="form-row">
                <label>Email (for receipt)<input name="email" type="email" maxlength="120" autocomplete="email"></label>
                <label>Enquiry / Quote Reference<input name="reference" maxlength="40" placeholder="Optional"></label>
              </div>
              <label>Advance Amount (₹)* <small class="pay-hint">Minimum ₹${PAY_MIN.toLocaleString('en-IN')}</small><input name="amount" required inputmode="decimal" maxlength="11" placeholder="e.g. 2500" autocomplete="off"></label>
              <p class="form-status" id="pay-form-status" role="status" aria-live="polite"></p>
              <button class="btn btn-primary pay-submit" type="submit">Generate UPI QR →</button>
              <button class="pay-alt" type="button" id="pay-alt" hidden>Show a QR code instead</button>
              <small class="form-disclaimer">Payments are processed securely by Razorpay. Deep Enterprises never sees your UPI PIN or bank details.</small>
            </form>
          </div>

          <div class="pay-step" data-step="qr" hidden>
            <span class="eyebrow dark">SCAN TO PAY</span>
            <h2>Scan with any UPI app</h2>
            <p class="pay-amount" id="pay-amount"></p>
            <div class="pay-qr"><img id="pay-qr-img" alt="UPI QR code for this payment"></div>
            <p class="pay-timer">QR expires in <b id="pay-countdown">--:--</b></p>
            <p class="pay-live" id="pay-live" role="status" aria-live="polite"><span class="pay-spinner" aria-hidden="true"></span> Waiting for payment…</p>
            <p class="pay-test" id="pay-test" hidden>Test mode: no real money will be charged.</p>
            <ul class="pay-tips">
              <li>Works with Google Pay, PhonePe, Paytm, BHIM and bank UPI apps.</li>
              <li>On a phone? Take a screenshot and use your UPI app's "scan from gallery" option.</li>
              <li>Keep this window open until the payment is confirmed.</li>
            </ul>
          </div>

          <div class="pay-step pay-result" data-step="verify" hidden>
            <span class="pay-spinner pay-spinner-lg" aria-hidden="true"></span>
            <h2>Confirming Your Payment</h2>
            <p id="pay-verify-text" role="status" aria-live="polite">Checking with Razorpay. Please don't pay again or close this page.</p>
          </div>

          <div class="pay-step pay-result" data-step="done" hidden>
            <div class="pay-icon ok" aria-hidden="true">✓</div>
            <h2>Payment Received</h2>
            <p id="pay-done-text"></p>
            <p class="pay-ref">Reference: <b id="pay-done-ref"></b></p>
            <p class="pay-sub">Our team will contact you shortly to coordinate your order.</p>
            <button type="button" class="btn btn-primary" data-pay-close>Done</button>
          </div>

          <div class="pay-step pay-result" data-step="expired" hidden>
            <div class="pay-icon warn" aria-hidden="true">!</div>
            <h2 id="pay-expired-title">QR Code Expired</h2>
            <p><span id="pay-expired-text">No payment was received before the QR code expired.</span> If you already paid, don't pay again. Please call us at <a href="tel:${esc(phoneHref(S.company?.phone||''))}">${esc(S.company?.phone||'')}</a>.</p>
            <div class="detail-actions"><button type="button" class="btn btn-primary" id="pay-retry">Try Again</button><button type="button" class="btn btn-outline-red" data-pay-close>Close</button></div>
          </div>
        </div>`;
      document.body.appendChild(modal);
      dialog = qs('.pay-dialog', modal);

      qsa('[data-pay-close]', modal).forEach(b => b.addEventListener('click', close));
      qs('#pay-retry', modal).addEventListener('click', () => { setMode(); step('form'); });
      qs('#pay-form', modal).addEventListener('submit', submit);
      qs('#pay-alt', modal).addEventListener('click', () => { forceQr = !forceQr; setMode(); });
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key !== 'Tab') return;
        const f = qsa('button:not([disabled]), input:not([type="hidden"]):not([tabindex="-1"]), a[href]', dialog).filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }

    function step(name){
      qsa('.pay-step', modal).forEach(s => { s.hidden = s.dataset.step !== name; });
      const target = qs(`[data-step="${name}"]`, modal);
      const focusEl = name === 'form' ? qs('input[name="name"]', target) : qs('button, h2', target);
      if (focusEl) { if (focusEl.tagName === 'H2') focusEl.setAttribute('tabindex', '-1'); focusEl.focus(); }
    }

    function stopTimers(){ clearTimeout(pollTimer); clearInterval(tickTimer); pollTimer = tickTimer = null; }

    const useApps = () => isPhone() && !forceQr;
    function setMode(){
      const apps = useApps();
      qs('#pay-form-sub', modal).textContent = apps
        ? 'Pay the advance amount agreed with our team. Choose your UPI app (GPay, PhonePe, Paytm, BHIM…) on the next screen.'
        : 'Pay the advance amount agreed with our team. A one-time UPI QR code will be created for this payment only.';
      qs('.pay-submit', modal).textContent = apps ? 'Pay with UPI App →' : 'Generate UPI QR →';
      const alt = qs('#pay-alt', modal);
      alt.hidden = !isPhone();
      alt.textContent = forceQr ? 'Pay with a UPI app instead' : 'Show a QR code instead';
    }

    function open(product, trigger){
      if (!modal) build();
      lastTrigger = trigger;
      stopTimers(); current = null; forceQr = false; setMode();
      const form = qs('#pay-form', modal);
      form.elements.product.value = product;
      qs('#pay-product-label', modal).textContent = product;
      qs('#pay-form-status', modal).textContent = ''; qs('#pay-form-status', modal).className = 'form-status';
      modal.hidden = false; document.body.classList.add('pay-open');
      step('form');
    }

    function close(){
      if (!modal || modal.hidden) return;
      stopTimers(); current = null;
      modal.hidden = true; document.body.classList.remove('pay-open');
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    }

    async function submit(e){
      e.preventDefault();
      const form = e.currentTarget, status = qs('#pay-form-status', modal), btn = qs('.pay-submit', form);
      const data = Object.fromEntries(new FormData(form).entries());
      const amt = String(data.amount || '').replace(/[,\s₹]/g, '');
      const fail = (msg, field) => { status.className = 'form-status error'; status.textContent = msg; if (field) form.elements[field].focus(); };
      if (String(data.name || '').trim().length < 2) return fail('Please enter your name.', 'name');
      if (!/^(\+?91|0)?[6-9]\d{9}$/.test(String(data.phone || '').replace(/[\s-]/g, ''))) return fail('Please enter a valid 10-digit mobile number.', 'phone');
      if (data.email && !form.elements.email.checkValidity()) return fail('Please enter a valid email address.', 'email');
      if (!/^\d{1,7}(\.\d{1,2})?$/.test(amt) || Number(amt) <= 0) return fail('Please enter a valid amount, e.g. 2500 or 2500.50.', 'amount');
      if (Number(amt) < PAY_MIN) return fail(`Minimum advance amount is ₹${PAY_MIN.toLocaleString('en-IN')}.`, 'amount');

      if (useApps()) return startCheckout(form, { ...data, amount: amt }, status, btn, fail);

      status.className = 'form-status'; status.textContent = 'Creating a secure UPI QR…';
      btn.disabled = true;
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 30000);
        const res = await fetch('/api/pay-qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ ...data, amount: amt }), signal: ctrl.signal }).finally(() => clearTimeout(t));
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.id) throw new Error(out.error || 'Could not create the payment QR. Please try again or call us.');
        showQr(out);
      } catch (err) {
        fail(err.name === 'AbortError' ? 'The request timed out. Please try again.' : err.message);
      } finally { btn.disabled = false; }
    }

    // Phone flow: server creates the order -> Razorpay Checkout (UPI apps only) -> server verifies.
    async function startCheckout(form, data, status, btn, fail){
      status.className = 'form-status'; status.textContent = 'Starting secure payment…';
      btn.disabled = true;
      let o;
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 30000);
        const [res] = await Promise.all([
          fetch('/api/pay-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(data), signal: ctrl.signal }).finally(() => clearTimeout(t)),
          loadCheckout(),
        ]);
        o = await res.json().catch(() => ({}));
        if (!res.ok || !o.orderId) throw new Error(o.error || 'Could not start the payment. Please try again or call us.');
      } catch (err) {
        btn.disabled = false;
        if (err.message === 'Checkout unavailable') { forceQr = true; setMode(); return fail('The UPI app screen could not load. Please use the QR code option instead.'); }
        return fail(err.name === 'AbortError' ? 'The request timed out. Please try again.' : err.message);
      }

      const q = { id: o.orderId, token: o.token, amount: o.amount, kind: 'order' };
      current = q;
      savePending(q);
      let settled = false;
      const prefill = { name: o.prefill.name, contact: o.prefill.contact };
      if (o.prefill.email) prefill.email = o.prefill.email;

      const rzp = new window.Razorpay({
        key: o.key,
        order_id: o.orderId,
        amount: o.amount,
        currency: 'INR',
        name: S.company?.name || 'Deep Enterprises',
        description: o.description,
        prefill,
        readonly: { contact: true, email: Boolean(o.prefill.email), name: true },
        theme: { color: '#c92026' },
        retry: { enabled: true, max_count: 3 },
        config: {
          display: {
            // One instrument per app, so each app is shown directly on the first screen
            // (no extra "UPI" tap). A separate "UPI All" block covers any other UPI app.
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: ['google_pay', 'phonepe', 'paytm', 'bhim'].map((app) => ({ method: 'upi', flows: ['intent'], apps: [app] })),
              },
              upi_all: {
                name: 'UPI All',
                instruments: [{ method: 'upi', flows: ['intent'] }],
              },
            },
            sequence: ['block.upi', 'block.upi_all'],
            preferences: { show_default_blocks: false },
          },
        },
        handler: (resp) => { settled = true; showModal(); verify(q, resp); },
        modal: {
          ondismiss: () => {
            if (settled) return;
            showModal();
            // The customer may have paid in the UPI app and then closed the sheet: check first.
            step('verify');
            qs('#pay-verify-text', modal).textContent = 'Checking whether the payment went through…';
            (async () => {
              let st = 'unknown';
              for (let i = 0; i < 3 && st !== 'paid'; i++) {
                if (i) await new Promise((r) => setTimeout(r, 4000));
                st = await checkOnce(q);
              }
              return st;
            })().then((st) => {
              if (current !== q) return;
              if (st === 'paid') return paid(q);
              clearPending(); current = null;
              step('form');
              status.className = 'form-status error';
              status.textContent = 'Payment was not completed. You can try again, or use the QR code option. If money was debited, don\u2019t pay again; call us and we\u2019ll confirm it.';
            });
          },
        },
      });
      rzp.on('payment.failed', (resp) => {
        console.warn('Payment failed', resp?.error?.code, resp?.error?.reason);
      });
      btn.disabled = false;
      status.textContent = '';
      hideModal();
      rzp.open();
    }

    async function verify(q, resp){
      step('verify');
      qs('#pay-verify-text', modal).textContent = 'Checking with Razorpay. Please don\u2019t pay again or close this page.';
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const res = await fetch('/api/pay-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
            body: JSON.stringify({ razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature, t: q.token }) });
          const out = await res.json().catch(() => ({}));
          if (current !== q) return;
          if (out.status === 'paid') return paid(q, resp.razorpay_payment_id);
          if (res.status === 400 || res.status === 403 || out.status === 'failed') break;
        } catch { /* network: retry */ }
        await new Promise((r) => setTimeout(r, 2500));
      }
      // Not confirmed yet (e.g. capture still processing): keep checking quietly.
      qs('#pay-verify-text', modal).textContent = 'Still confirming with Razorpay… This can take a minute. Please don\u2019t pay again.';
      q.closeBy = Math.floor(Date.now() / 1000) + 10 * 60;
      poll(q, 0);
    }

    async function checkOnce(q){
      try {
        const res = await fetch(`/api/pay-status?id=${encodeURIComponent(q.id)}&t=${encodeURIComponent(q.token)}`, { credentials: 'same-origin', cache: 'no-store' });
        return (await res.json().catch(() => ({}))).status || 'unknown';
      } catch { return 'unknown'; }
    }

    // Our dialog steps aside while Razorpay's sheet is open.
    function hideModal(){ modal.hidden = true; }
    function showModal(){ modal.hidden = false; document.body.classList.add('pay-open'); }

    function showExpired(q){
      stopTimers(); clearPending();
      const order = q.kind === 'order';
      qs('#pay-expired-title', modal).textContent = order ? 'Payment Not Confirmed Yet' : 'QR Code Expired';
      qs('#pay-expired-text', modal).textContent = order
        ? 'We could not confirm this payment yet. If money was debited, it will be confirmed automatically or refunded by your bank.'
        : 'No payment was received before the QR code expired.';
      step('expired');
    }

    function showQr(q){
      current = q;
      qs('#pay-amount', modal).textContent = inr(q.amount);
      qs('#pay-qr-img', modal).src = q.image;
      qs('#pay-test', modal).hidden = !q.test;
      qs('#pay-live', modal).innerHTML = '<span class="pay-spinner" aria-hidden="true"></span> Waiting for payment…';
      step('qr');
      const cd = qs('#pay-countdown', modal);
      const tick = () => {
        const left = Math.max(0, q.closeBy - Math.floor(Date.now() / 1000));
        cd.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
      };
      tick(); tickTimer = setInterval(tick, 1000);
      poll(q, 0);
    }

    async function poll(q, misses){
      if (current !== q) return;
      let next = 4000;
      try {
        const res = await fetch(`/api/pay-status?id=${encodeURIComponent(q.id)}&t=${encodeURIComponent(q.token)}`, { credentials: 'same-origin', cache: 'no-store' });
        const out = await res.json().catch(() => ({}));
        if (current !== q) return;
        if (out.status === 'paid') return paid(q);
        if (out.status === 'expired' || out.status === 'closed') return showExpired(q);
        if (res.status === 429) {
          // Server asked us to slow down: wait, keep the normal waiting message.
          next = Math.min(30, Math.max(5, Number(res.headers.get('Retry-After')) || 15)) * 1000;
          pollTimer = setTimeout(() => poll(q, misses), next);
          return;
        }
        misses = res.ok ? 0 : misses + 1;
      } catch { misses += 1; }
      // Past expiry: one final check, then show expired.
      if (Math.floor(Date.now() / 1000) > q.closeBy + 20) return showExpired(q);
      if (misses > 2) {
        qs(q.kind === 'order' ? '#pay-verify-text' : '#pay-live', modal).textContent = 'Checking payment status… (connection issue, retrying)';
        next = 8000;
      }
      pollTimer = setTimeout(() => poll(q, misses), next);
    }

    function paid(q, paymentId){
      stopTimers(); clearPending();
      showModal();
      qs('#pay-done-text', modal).textContent = `We have received your advance payment of ${inr(q.amount)}.`;
      qs('#pay-done-ref', modal).textContent = paymentId || q.id;
      step('done');
    }

    // Phone browsers sometimes reload the page while the customer is in the UPI app.
    // If a payment was in progress in this tab, resume confirming it.
    function resumePending(){
      let p = null;
      try { p = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null'); } catch {}
      if (!p || !p.id || !p.token || Date.now() - p.at > 30 * 60 * 1000) return clearPending();
      if (!modal) build();
      setMode();
      const q = { id: p.id, token: p.token, amount: p.amount, kind: p.kind || 'order', closeBy: Math.floor(Date.now() / 1000) + 90 };
      current = q;
      showModal();
      step('verify');
      qs('#pay-verify-text', modal).textContent = 'Checking your recent payment with Razorpay… Please don\u2019t pay again.';
      poll(q, 0);
    }

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pay-product]');
      if (!b) return;
      e.preventDefault();
      open(b.dataset.payProduct, b);
    });
    resumePending();
  }

  header();footer();payments();
  ({home,products,category,product:productDetail,services,about,contact:enquiry,faq,legal:()=>{},admin}[page]||(()=>{}))();
  if(page==='contact')faq();
  if(page==='home') document.documentElement.classList.add('page-home');
})();
