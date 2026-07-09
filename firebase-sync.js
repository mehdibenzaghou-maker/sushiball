/* ═══ FIREBASE SYNC — Lit les prix/photos depuis Firestore ═══ */
(function(){
  const firebaseConfig = {
    apiKey: "AIzaSyC6E339B7uj7OP5Ar0FsRHjIKOnhiuscR4",
    authDomain: "sushiball.firebaseapp.com",
    projectId: "sushiball",
    messagingSenderId: "891422097707",
    appId: "1:891422097707:web:7e72aba87e83cd84d5c56e"
  };

  // Load Firebase scripts dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function init() {
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js');

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Fetch all menu data
    const snap = await db.collection('menu').get();
    const allDishes = [];
    snap.forEach(doc => {
      const sec = doc.data();
      if (sec.dishes) {
        sec.dishes.forEach(d => allDishes.push(d));
      }
    });

    if (!allDishes.length) return;

    // Match dishes on the page by name and update prices/photos
    document.querySelectorAll('.dish-card').forEach(card => {
      const nameEl = card.querySelector('.dish-name');
      if (!nameEl) return;
      const name = nameEl.textContent.trim();

      // Find matching dish in Firestore data
      const match = allDishes.find(d => {
        const dbName = d.name.replace(/&amp;/g,'&').replace(/&eacute;/g,'é').replace(/&egrave;/g,'è').replace(/&ocirc;/g,'ô').replace(/&oelig;/g,'œ').replace(/&iuml;/g,'ï');
        return dbName === name || d.name === name;
      });

      if (!match) return;

      // Update price
      const priceEl = card.querySelector('.dish-price');
      if (priceEl && match.price) {
        priceEl.textContent = match.price.toLocaleString() + ' DA';
      }

      // Update add-to-cart button price
      const cartBtn = card.querySelector('.add-cart-btn[data-price]');
      if (cartBtn && match.price) {
        cartBtn.dataset.price = match.price;
      }

      // Update photo if available and no 3D model
      if (match.photo && card.querySelector('.dish-3d-empty')) {
        const empty = card.querySelector('.dish-3d-empty');
        empty.outerHTML = '<div style="height:200px;overflow:hidden"><img src="' + match.photo + '" alt="' + name + '" style="width:100%;height:100%;object-fit:cover"></div>';
      }

      // Update description if changed
      const descEl = card.querySelector('.dish-desc');
      if (descEl && match.desc) {
        descEl.textContent = match.desc;
      }
    });

    // Also update simple-card prices (desserts, boissons if any)
    document.querySelectorAll('.simple-card').forEach(card => {
      const nameEl = card.querySelector('.simple-name');
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      const match = allDishes.find(d => d.name === name);
      if (!match) return;
      const priceEl = card.querySelector('.simple-price');
      if (priceEl && match.price) {
        priceEl.textContent = match.price.toLocaleString() + ' DA';
      }
    });
  }

  // Run after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
