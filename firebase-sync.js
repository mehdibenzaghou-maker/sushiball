/* ═══ SUSHIBALL — firebase-sync.js ═══
   Synchronise le site avec Firestore (admin.html) :
   - collection "site" doc "settings" → textes, images, téléphones, liens
   - collection "menu" → prix / descriptions / photos des plats           */
(function(){
  var CONFIG={
    apiKey:"AIzaSyC6E339B7uj7OP5Ar0FsRHjIKOnhiuscR4",
    authDomain:"sushiball.firebaseapp.com",
    projectId:"sushiball",
    messagingSenderId:"891422097707",
    appId:"1:891422097707:web:7e72aba87e83cd84d5c56e"
  };
  function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}

  function norm(s){
    return (s||'').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/œ/g,'oe')
      .replace(/[^a-z0-9]+/g,' ')
      .trim();
  }

  function applySettings(st){
    if(!st)return;
    // textes
    document.querySelectorAll('[data-set]').forEach(function(el){
      var k=el.getAttribute('data-set');
      if(st[k]===undefined||st[k]==='')return;
      if(k==='hero_title'){
        var t=st[k].trim();
        var i=t.lastIndexOf(' ');
        if(i>0){el.innerHTML=t.slice(0,i)+' <span class="accent">'+t.slice(i+1)+'</span>';}
        else{var h=Math.ceil(t.length/2);el.innerHTML=t.slice(0,h)+'<span class="accent">'+t.slice(h)+'</span>';}
      }else{
        el.textContent=st[k];
      }
    });
    // liens
    document.querySelectorAll('[data-set-href]').forEach(function(el){
      var k=el.getAttribute('data-set-href');
      if(!st[k])return;
      var v=st[k];
      if(k.indexOf('tel')===0)el.setAttribute('href','tel:'+v.replace(/\s/g,''));
      else if(k.indexOf('wa')===0)el.setAttribute('href','https://wa.me/'+v.replace(/\D/g,''));
      else el.setAttribute('href',v);
    });
    // images
    document.querySelectorAll('[data-set-src]').forEach(function(el){
      var k=el.getAttribute('data-set-src');
      if(st[k])el.setAttribute('src',st[k]);
    });
    // WhatsApp routing panier
    if(window.RESTOS){
      if(st.wa_dely)window.RESTOS["Dely Ibrahim"]=String(st.wa_dely).replace(/\D/g,'');
      if(st.wa_sidi)window.RESTOS["Sidi Yahia"]=String(st.wa_sidi).replace(/\D/g,'');
    }
  }

  function applyMenu(byName){
    var dishes=document.querySelectorAll('.dish,.drink');
    var updated=0,missing=[];
    dishes.forEach(function(card){
      var nameEl=card.querySelector('.dish-name')||card.querySelector('.d-name');
      if(!nameEl)return;
      var key=norm(nameEl.textContent);
      var m=byName[key];
      if(!m){
        // fuzzy: prefix / contains
        var keys=Object.keys(byName);
        for(var i=0;i<keys.length;i++){
          if(keys[i].indexOf(key)===0||key.indexOf(keys[i])===0){m=byName[keys[i]];break;}
        }
      }
      if(!m){missing.push(nameEl.textContent.trim());return;}
      // prix simple
      var priceEl=card.querySelector('.dish-price')||card.querySelector('.d-price');
      if(priceEl&&m.price){
        if(priceEl.classList.contains('dish-price'))priceEl.innerHTML=m.price+' <span class="da">DA</span>';
        else priceEl.textContent=m.price+' DA';
      }
      var ab=card.querySelector('.add-btn');
      if(ab&&m.price&&!card.querySelector('.sz-btn'))ab.dataset.price=m.price;
      // description
      if(m.desc){
        var de=card.querySelector('.dish-desc');
        if(de)de.textContent=m.desc;
      }
      // photo (remplace le slot vide)
      if(m.photo){
        var empty=card.querySelector('.dish-view.empty');
        if(empty){
          var dv=document.createElement('div');
          dv.className='dish-view photo';
          dv.innerHTML='<img src="'+m.photo+'" alt="" loading="lazy">';
          empty.replaceWith(dv);
        }else{
          var ph=card.querySelector('.dish-view.photo img');
          if(ph)ph.src=m.photo;
        }
      }
      updated++;
    });
    console.log('[sync] plats mis à jour: '+updated+(missing.length?' | introuvables: '+missing.join(', '):''));
  }

  function run(){
    Promise.all([
      loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js'),
      loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js')
    ]).then(function(){
      firebase.initializeApp(CONFIG);
      var db=firebase.firestore();
      db.collection('site').doc('settings').get().then(function(doc){
        if(doc.exists)applySettings(doc.data());
      }).catch(function(e){console.warn('[sync] settings:',e.message);});
      db.collection('menu').get().then(function(snap){
        var byName={};
        snap.forEach(function(doc){
          var d=doc.data();
          (d.dishes||[]).forEach(function(dish){
            if(dish&&dish.name)byName[norm(dish.name)]=dish;
          });
        });
        if(Object.keys(byName).length)applyMenu(byName);
      }).catch(function(e){console.warn('[sync] menu:',e.message);});
    }).catch(function(e){console.warn('[sync] firebase load failed:',e.message);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);
  else run();
})();
