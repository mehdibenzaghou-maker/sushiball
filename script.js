/* ═══ SUSHIBALL — script.js v4 ═══ */
window.RESTOS = {
  "Dely Ibrahim": "213541007676",
  "Sidi Yahia": "213541007575"
};
function initNav(){
  const nav=document.querySelector('nav');
  if(nav)window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>30),{passive:true});
  const page=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a,.mob-nav a').forEach(a=>{if((a.getAttribute('href')||'')===page)a.classList.add('active');});
  const burger=document.getElementById('burger'),mob=document.getElementById('mobNav');
  if(burger&&mob){
    burger.addEventListener('click',()=>{burger.classList.toggle('open');mob.classList.toggle('open');document.body.style.overflow=mob.classList.contains('open')?'hidden':'';});
    mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');mob.classList.remove('open');document.body.style.overflow='';}));
  }
}
function initReveal(){
  const io=new IntersectionObserver(es=>{
    const v=[...es].filter(e=>e.isIntersecting);
    v.forEach((e,i)=>{setTimeout(()=>e.target.classList.add('in'),i*70);io.unobserve(e.target);});
  },{threshold:.05,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.rv,.rv-l').forEach(el=>io.observe(el));
}
function initDust(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<14;i++){
    const d=document.createElement('div');d.className='dust';
    const dur=14+Math.random()*20,delay=Math.random()*20,x=Math.random()*100,size=1.5+Math.random()*2.5;
    d.style.cssText=`left:${x}vw;width:${size}px;height:${size}px;opacity:${.08+Math.random()*.2};animation:floatDust ${dur}s linear ${-delay}s infinite`;
    document.body.appendChild(d);
  }
}
window.loadDishViewer=function(btn){const dv=btn.closest('.dish-view');if(!dv)return;dv.classList.add('loaded');};

const CART={
  items:JSON.parse(localStorage.getItem('sb_cart')||'[]'),
  save(){localStorage.setItem('sb_cart',JSON.stringify(this.items));this.updateUI();},
  add(name,price,size){
    const key=name+(size?'_'+size:'');
    const ex=this.items.find(i=>i.key===key);
    if(ex)ex.qty++;else this.items.push({key,name,price:+price,size:size||'',qty:1});
    this.save();this.pulse();
  },
  remove(key){this.items=this.items.filter(i=>i.key!==key);this.save();},
  updateQty(key,d){const it=this.items.find(i=>i.key===key);if(!it)return;it.qty+=d;if(it.qty<1)this.remove(key);else this.save();},
  total(){return this.items.reduce((s,i)=>s+i.price*i.qty,0);},
  count(){return this.items.reduce((s,i)=>s+i.qty,0);},
  clear(){this.items=[];this.save();},
  pulse(){const f=document.querySelector('.cart-float');if(f){f.style.transform='scale(1.15)';setTimeout(()=>f.style.transform='',220);}},
  updateUI(){
    const cnt=document.querySelector('.cart-count');
    if(cnt){const c=this.count();cnt.textContent=c;cnt.classList.toggle('show',c>0);}
    const box=document.querySelector('.cart-items');
    if(!box)return;
    if(!this.items.length){box.innerHTML='<div class="cart-empty">Votre panier est vide<br>お待ちしております</div>';}
    else{
      box.innerHTML=this.items.map(i=>`<div class="c-item"><div class="c-info"><div class="c-name">${i.name}</div>${i.size?`<div class="c-size">${i.size}</div>`:''}</div><div class="c-qty"><button onclick="CART.updateQty('${i.key.replace(/'/g,"\\'")}',-1)">−</button><span>${i.qty}</span><button onclick="CART.updateQty('${i.key.replace(/'/g,"\\'")}',1)">+</button></div><div class="c-price">${(i.price*i.qty).toLocaleString()} DA</div></div>`).join('');
    }
    const tot=document.querySelector('.ct-val');if(tot)tot.textContent=this.total().toLocaleString()+' DA';
    const btn=document.querySelector('.order-btn');if(btn)btn.style.display=this.items.length?'flex':'none';
  }
};
function toggleCart(){
  document.querySelector('.cart-panel')?.classList.toggle('open');
  document.querySelector('.cart-overlay')?.classList.toggle('show');
  CART.updateUI();
}
function openOrderForm(){
  document.querySelector('.order-modal')?.classList.add('show');
  document.querySelector('.cart-panel')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('show');
}
function closeOrderForm(){document.querySelector('.order-modal')?.classList.remove('show');}
function handleOrderType(){
  const del=document.getElementById('type-delivery');
  const df=document.querySelector('.delivery-fields');
  if(del&&df)df.classList.toggle('show',del.checked);
}
function submitOrder(){
  const name=document.getElementById('o-name')?.value?.trim();
  const phone=document.getElementById('o-phone')?.value?.trim();
  const resto=document.querySelector('input[name="resto"]:checked')?.value;
  const type=document.querySelector('input[name="otype"]:checked')?.value;
  const addr=document.getElementById('o-addr')?.value?.trim();
  if(!name||!phone||!resto||!type){alert('Veuillez remplir tous les champs obligatoires.');return;}
  if(type==='delivery'&&!addr){alert('Veuillez entrer votre adresse de livraison.');return;}
  let msg=`🍣 *Nouvelle commande — Sushiball*\n\n`;
  msg+=`📍 Restaurant: *${resto}*\n`;
  msg+=`📦 Type: *${type==='delivery'?'Livraison':'Emporter'}*\n`;
  msg+=`👤 Nom: *${name}*\n📱 Tél: *${phone}*\n`;
  if(type==='delivery')msg+=`🏠 Adresse: *${addr}*\n`;
  msg+=`\n──────────────\n`;
  CART.items.forEach(i=>{msg+=`${i.qty}× ${i.name}${i.size?' ('+i.size+')':''} — ${(i.price*i.qty).toLocaleString()} DA\n`;});
  msg+=`──────────────\n💰 *Total: ${CART.total().toLocaleString()} DA*`;
  const num=window.RESTOS[resto]||Object.values(window.RESTOS)[0];
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,'_blank');
  CART.clear();closeOrderForm();
}
window.selectSize=function(btn){
  btn.closest('.sz-group').querySelectorAll('.sz-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  const wrap=btn.closest('.cart-row');
  const ab=wrap.querySelector('.add-btn');
  ab.dataset.price=btn.dataset.price;
  ab.dataset.size=btn.dataset.size;
};
window.addToCart=function(btn){
  const name=btn.dataset.name,price=btn.dataset.price,size=btn.dataset.size||'';
  if(!price){alert('Choisissez une taille');return;}
  CART.add(name,price,size);
};
function initSectionBar(){
  const bar=document.querySelector('.section-bar');
  if(!bar)return;
  const act=bar.querySelector('.sb-link.active');
  if(!act)return;
  bar.scrollLeft=Math.max(0,act.offsetLeft-(bar.clientWidth/2)+(act.offsetWidth/2));
}
document.addEventListener('DOMContentLoaded',()=>{
  initNav();initReveal();initDust();initSectionBar();
  CART.updateUI();
  document.querySelectorAll('input[name="otype"]').forEach(r=>r.addEventListener('change',handleOrderType));
});
