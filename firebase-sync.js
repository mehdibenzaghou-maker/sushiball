/* ═══ FIREBASE SYNC — prix, photos & contenus du site ═══ */
(function(){
  const cfg = {
    apiKey: "AIzaSyC6E339B7uj7OP5Ar0FsRHjIKOnhiuscR4",
    authDomain: "sushiball.firebaseapp.com",
    projectId: "sushiball",
    messagingSenderId: "891422097707",
    appId: "1:891422097707:web:7e72aba87e83cd84d5c56e"
  };
  function load(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
  const norm=t=>t.replace(/\s+/g,' ').trim().toLowerCase();

  async function init(){
    try{
      await load('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
      await load('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');
      if(!firebase.apps.length)firebase.initializeApp(cfg);
      const db=firebase.firestore();

      /* ── 1. SETTINGS (textes, photos, téléphones du site) ── */
      try{
        const sdoc=await db.collection('site').doc('settings').get();
        if(sdoc.exists){
          const S=sdoc.data();
          // text nodes
          document.querySelectorAll('[data-set]').forEach(el=>{
            const k=el.dataset.set;
            if(S[k])el.textContent=S[k];
          });
          // hrefs (tel:, wa.me, instagram)
          document.querySelectorAll('[data-set-href]').forEach(el=>{
            const k=el.dataset.setHref;
            if(k==='tel_dely'&&S.phone_dely)el.href='tel:'+S.phone_dely;
            if(k==='tel_sidi'&&S.phone_sidi)el.href='tel:'+S.phone_sidi;
            if(k==='wa_dely'&&S.phone_dely)el.href='https://wa.me/'+S.phone_dely.replace(/[^0-9]/g,'');
            if(k==='wa_sidi'&&S.phone_sidi)el.href='https://wa.me/'+S.phone_sidi.replace(/[^0-9]/g,'');
            if(k==='instagram'&&S.instagram)el.href=S.instagram;
          });
          // images
          document.querySelectorAll('[data-set-src]').forEach(el=>{
            const k=el.dataset.setSrc;
            if(S[k])el.src=S[k];
          });
          // WhatsApp order routing numbers
          if(window.RESTOS){
            if(S.phone_dely)window.RESTOS['Dely Ibrahim']=S.phone_dely.replace(/[^0-9]/g,'');
            if(S.phone_sidi)window.RESTOS['Sidi Yahia']=S.phone_sidi.replace(/[^0-9]/g,'');
          }
        }
      }catch(e){console.log('settings sync skip',e);}

      /* ── 2. MENU (prix, photos, descriptions des plats) ── */
      const snap=await db.collection('menu').get();
      const all=[];
      snap.forEach(doc=>{const s=doc.data();if(s.dishes)s.dishes.forEach(d=>all.push(d));});
      if(!all.length)return;
      const byName={};
      all.forEach(d=>{byName[norm(d.name)]=d;});

      document.querySelectorAll('.dish').forEach(card=>{
        const nameEl=card.querySelector('.dish-name');
        if(!nameEl)return;
        const m=byName[norm(nameEl.textContent)];
        if(!m)return;
        // price
        const pEl=card.querySelector('.dish-price');
        if(pEl&&m.price){pEl.innerHTML=Number(m.price).toLocaleString('fr')+' <span class="da">DA</span>';}
        const ab=card.querySelector('.add-btn[data-price]');
        if(ab&&m.price)ab.dataset.price=m.price;
        // photo (replaces empty 3D slot)
        if(m.photo){
          const empty=card.querySelector('.dish-view.empty');
          if(empty)empty.outerHTML='<div class="dish-view photo"><img src="'+m.photo+'" alt="'+m.name+'"></div>';
        }
        // desc
        if(m.desc){
          let dEl=card.querySelector('.dish-desc');
          if(dEl)dEl.textContent=m.desc;
        }
      });
    }catch(e){console.log('firebase sync error',e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
