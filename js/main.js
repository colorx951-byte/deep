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

  function productCard(p){return `<article class="product-card"><a class="card-media-link" href="category.html?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.title)}"><div class="card-media"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"><span class="card-badge" aria-hidden="true">${esc(p.icon||'•')}</span></div></a><div class="card-body"><div><h3>${esc(p.title)}</h3><p>${esc(p.short)}</p></div><a class="card-link" href="category.html?id=${encodeURIComponent(p.id)}">Enquire Now <span>→</span></a></div></article>`}

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
    h.innerHTML=`<span class="eyebrow dark">PRODUCT CATEGORY</span><h1>${esc(p.title)}</h1><p>${esc(p.short)}</p><a class="btn btn-primary" href="contact.html?product=${encodeURIComponent(p.title)}#enquiry">Enquire Now →</a>`;
    g.innerHTML=`<article class="category-feature"><div class="category-feature-media"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="category-feature-copy"><span class="eyebrow dark">CATEGORY SCOPE</span><h2>What this category can include</h2><div class="detail-list">${p.details.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p><strong>Common enquiry details:</strong> ${esc(p.enquiry)}</p></div></article><div class="related-wrap"><div class="section-head"><div><span class="eyebrow dark">EXPLORE MORE</span><h2>Related Product Categories</h2></div><a class="btn btn-outline-red" href="products.html">View All Products →</a></div><div class="product-grid">${S.products.items.filter(x=>x.id!==p.id).slice(0,6).map(productCard).join('')}</div></div>`;
  }

  function productDetail(){
    const id=getParam('id')||S.products.items[0]?.id, p=S.products.items.find(x=>x.id===id), el=qs('#product-detail');
    if(!p){el.innerHTML='<div class="empty-state">Product category not found.</div>';return}
    document.title=`${p.title} | Deep Enterprises`;
    el.innerHTML=`<div class="detail-breadcrumb"><a href="products.html">Products</a><span>→</span><span>${esc(p.title)}</span></div><div class="detail-shell"><div class="detail-image"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div><div class="detail-copy"><div class="detail-topline"><span class="detail-icon">${esc(p.icon)}</span><span class="eyebrow dark">FIRE & SAFETY CATEGORY</span></div><h1>${esc(p.title)}</h1><p>${esc(p.short)}</p><h3>Product scope</h3><div class="detail-list">${p.details.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p><strong>Common enquiry details:</strong> ${esc(p.enquiry)}</p><div class="detail-enquiry"><h3>Interested in this category?</h3><p>Share product, quantity, specification, application or BOQ details and our team can respond with availability and quotation information.</p><div class="detail-actions"><a class="btn btn-white" href="contact.html?product=${encodeURIComponent(p.title)}#enquiry">Get Price & Availability →</a><a class="btn btn-ghost" href="products.html">Back to Products</a></div></div></div></div>`;
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

  header();footer();
  ({home,products,category,product:productDetail,services,about,contact:enquiry,faq,legal:()=>{},admin}[page]||(()=>{}))();
  if(page==='contact')faq();
  if(page==='home') document.documentElement.classList.add('page-home');
})();
