/* ============================================================
   SFASELIN.SHOP — storefront engine (vanilla JS, localStorage)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const fmt = n => "$" + Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
  const byId = id => SF_PRODUCTS.find(p => p.id === id);
  const off = p => Math.round((1 - p.price / p.mrp) * 100);

  /* ---------- icons ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    heart:  '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.3 4.5 6.2 4.1c2.2-.2 4.2 1 5.8 3 1.6-2 3.6-3.2 5.8-3 3.9.4 5.8 4.5 4.2 7.6C19.5 16.3 12 21 12 21z"/></svg>',
    bag:    '<svg viewBox="0 0 24 24"><path d="M6 8h12l-1.2 12.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24"><path d="M3 12h17M14 5l7 7-7 7"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24"><path d="M21 12H4M10 5l-7 7 7 7"/></svg>',
    truck:  '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    ret:    '<svg viewBox="0 0 24 24"><path d="M4 9a8 8 0 0 1 14.9-2M20 15a8 8 0 0 1-14.9 2"/><path d="M19 3v4h-4M5 21v-4h4"/></svg>'
  };

  /* ---------- state ---------- */
  let cart = store.get("sfaselin_cart", []);       // [{id, qty}]
  let wish = store.get("sfaselin_wishlist", []);   // [id]
  let coupon = store.get("sfaselin_coupon", null); // code string

  const saveCart = () => { store.set("sfaselin_cart", cart); renderCartUI(); };
  const saveWish = () => { store.set("sfaselin_wishlist", wish); renderWishUI(); };

  const cartCount = () => cart.reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => cart.reduce((a, l) => a + (byId(l.id)?.price || 0) * l.qty, 0);

  /* ---------- toast ---------- */
  function toast(msg) {
    const zone = $(".toast-zone"); if (!zone) return;
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    zone.appendChild(t);
    requestAnimationFrame(() => t.classList.add("is-in"));
    setTimeout(() => { t.classList.remove("is-in"); setTimeout(() => t.remove(), 500); }, 2600);
  }

  /* ---------- layout injection ---------- */
  const PAGE = document.body.dataset.page || "";

  function injectLayout() {
    const nav = [
      ["index.html", "Home"], ["shop.html", "Shop"],
      ["about.html", "About"], ["contact.html", "Contact"]
    ];
    const links = nav.map(([h, n]) =>
      `<a href="${h}" class="${PAGE === n.toLowerCase() ? "is-active" : ""}">${n}</a>`).join("");

    $("#site-header").innerHTML = `
      <div class="marquee" aria-hidden="true"><div class="marquee__track">${(
        "<span>Free US shipping on orders over $35</span><span>Cards, PayPal & Apple Pay accepted</span>" +
        "<span>30-day easy returns</span><span>Anti-tarnish promise on every piece</span>").repeat(3)}</div></div>
      <div class="site-header__inner">
        <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
        <a class="brand" href="index.html">SFASELIN<em>.</em><small>sfaselin.shop</small></a>
        <nav class="main-nav">${links}</nav>
        <div class="header-actions">
          <button class="icon-btn" id="open-search" aria-label="Search">${I.search}</button>
          <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">${I.heart}
            <span class="count-badge" id="wish-count"></span></a>
          <button class="icon-btn" id="open-cart" aria-label="Cart">${I.bag}
            <span class="count-badge" id="cart-count"></span></button>
        </div>
      </div>`;

    $("#mobile-nav").innerHTML = `
      <button class="mobile-nav__close" id="close-mobile">Close ✕</button>
      ${nav.map(([h, n], i) => `<a href="${h}">${n}<small>0${i + 1}</small></a>`).join("")}
      <a href="wishlist.html">Wishlist<small>05</small></a>
      <a href="faq.html">Help & FAQ<small>06</small></a>`;

    $("#cart-root").innerHTML = `
      <div class="overlay" id="drawer-overlay"></div>
      <aside class="drawer" id="cart-drawer" aria-label="Shopping bag">
        <div class="drawer__head">
          <h3>Your Bag <span class="micro" id="drawer-count"></span></h3>
          <button class="drawer__close" id="close-cart">Close ✕</button>
        </div>
        <div class="ship-bar" id="ship-bar"></div>
        <div class="drawer__items" id="drawer-items"></div>
        <div class="drawer__foot" id="drawer-foot"></div>
      </aside>`;

    $("#search-root").innerHTML = `
      <div class="search-overlay" id="search-overlay">
        <div class="search-overlay__head">
          <span class="micro">Search sfaselin.shop</span>
          <button class="drawer__close" id="close-search">Close ✕</button>
        </div>
        <div class="search-box">
          <input id="search-input" type="text" placeholder="Try “hoops”…" autocomplete="off">
          <div class="search-hint" id="search-hint">Popular: Kundan · Pearls · Hoops · Bangles</div>
        </div>
        <div class="search-results" id="search-results"></div>
      </div>`;

    $("#site-footer").innerHTML = `
      <div class="wrap">
        <div class="site-footer__grid">
          <div>
            <a class="brand" href="index.html">SFASELIN<em>.</em><small>sfaselin.shop</small></a>
            <p class="site-footer__about">Imitation jewelry, honestly priced. Hand-finished pieces
            plated to last — designed in New York, delivered across the US.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="shop.html">All Jewelry</a></li>
              <li><a href="shop.html?cat=Earrings">Earrings</a></li>
              <li><a href="shop.html?cat=Necklaces">Necklaces</a></li>
              <li><a href="shop.html?cat=Bangles%20%26%20Bracelets">Bangles & Bracelets</a></li>
              <li><a href="shop.html?cat=Rings">Rings</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="shipping-policy.html">Shipping Policy</a></li>
              <li><a href="refund-policy.html">Returns & Refunds</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="about.html">Our Story</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal & Contact</h4>
            <ul>
              <li><a href="privacy-policy.html">Privacy Policy</a></li>
              <li><a href="terms-conditions.html">Terms & Conditions</a></li>
            </ul>
            <ul class="site-footer__contact" style="margin-top:1.2rem">
              <li>✉&nbsp; support@sfaselin.shop</li>
              <li>☏&nbsp; +1 (212) 555-0147 (Mon–Fri, 9am–6pm ET)</li>
              <li>⌂&nbsp; 128 Mercer Street, New York, NY 10012</li>
            </ul>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>© ${new Date().getFullYear()} Sfaselin.shop — All rights reserved.</span>
          <span class="pay-note">We accept <b>Cards</b><b>PayPal</b><b>Apple Pay</b></span>
        </div>
      </div>
      <div class="toast-zone"></div>`;
  }

  /* ---------- shared UI ---------- */
  function productCard(p, reveal) {
    const wished = wish.includes(p.id);
    return `
    <article class="product-card ${reveal ? "reveal" : ""}">
      <div class="product-card__img">
        ${p.tag ? `<span class="product-card__tag ${p.tag === "New" ? "product-card__tag--gold" : ""}">${p.tag}</span>` : ""}
        <a href="product.html?id=${p.id}" aria-label="${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>
        <button class="wish-btn ${wished ? "is-active" : ""}" data-wish="${p.id}" aria-label="Wishlist">${I.heart}</button>
        <button class="quick-add" data-add="${p.id}">Add to Bag — ${fmt(p.price)}</button>
      </div>
      <div class="product-card__info">
        <span class="product-card__cat">${p.category}</span>
        <h3 class="product-card__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-card__price"><b>${fmt(p.price)}</b><s>${fmt(p.mrp)}</s><span class="price-off">${off(p)}% off</span></div>
      </div>
    </article>`;
  }

  function bindProductButtons(root) {
    $$("[data-add]", root).forEach(b => b.onclick = () => addToCart(b.dataset.add, 1, true));
    $$("[data-wish]", root).forEach(b => b.onclick = () => toggleWish(b.dataset.wish, b));
  }

  /* ---------- cart ops ---------- */
  function addToCart(id, qty, openDrawer) {
    const line = cart.find(l => l.id === id);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else cart.push({ id, qty });
    saveCart();
    toast(byId(id).name + " added to your bag");
    if (openDrawer) openCart();
  }
  function setQty(id, qty) {
    const line = cart.find(l => l.id === id); if (!line) return;
    line.qty = qty;
    if (line.qty <= 0) cart = cart.filter(l => l.id !== id);
    saveCart();
  }
  function removeLine(id) { cart = cart.filter(l => l.id !== id); saveCart(); }

  function toggleWish(id, btn) {
    if (wish.includes(id)) { wish = wish.filter(w => w !== id); toast("Removed from wishlist"); }
    else { wish.push(id); toast(byId(id).name + " saved to wishlist"); }
    saveWish();
    if (btn) btn.classList.toggle("is-active", wish.includes(id));
    if (PAGE === "wishlist") renderWishlistPage();
  }

  /* ---------- cart UI ---------- */
  function renderCartUI() {
    const n = cartCount();
    const badge = $("#cart-count");
    if (badge) { badge.textContent = n; badge.classList.toggle("is-empty", n === 0); }
    const dc = $("#drawer-count"); if (dc) dc.textContent = n ? `— ${n} item${n > 1 ? "s" : ""}` : "";

    const items = $("#drawer-items"), foot = $("#drawer-foot"), bar = $("#ship-bar");
    if (!items) return;

    if (cart.length === 0) {
      bar.style.display = "none";
      items.innerHTML = `<div class="drawer__empty">
        <p class="serif">Your bag is empty.</p>
        <a class="link-line" href="shop.html">Discover the collection</a></div>`;
      foot.innerHTML = "";
      return;
    }
    bar.style.display = "";
    const sub = cartSubtotal();
    const left = SF_FREE_SHIP - sub;
    bar.innerHTML = left > 0
      ? `Add <b>${fmt(left)}</b> more for <b>free shipping</b><div class="ship-bar__track"><div class="ship-bar__fill" style="width:${Math.min(sub / SF_FREE_SHIP * 100, 100)}%"></div></div>`
      : `You've unlocked <b>free shipping</b> ✦<div class="ship-bar__track"><div class="ship-bar__fill" style="width:100%"></div></div>`;

    items.innerHTML = cart.map(l => {
      const p = byId(l.id); if (!p) return "";
      return `<div class="cart-line">
        <a href="product.html?id=${p.id}"><img class="cart-line__img" src="${p.img}" alt="${esc(p.name)}"></a>
        <div>
          <div class="cart-line__name">${p.name}</div>
          <div class="cart-line__price">${fmt(p.price)} × ${l.qty}</div>
          <div class="cart-line__qty">
            <button data-dec="${p.id}" aria-label="Decrease">−</button><b>${l.qty}</b>
            <button data-inc="${p.id}" aria-label="Increase">+</button>
          </div>
        </div>
        <button class="cart-line__rm" data-rm="${p.id}">Remove</button>
      </div>`;
    }).join("");

    foot.innerHTML = `
      <div class="drawer__sub"><span>Subtotal</span><b>${fmt(sub)}</b></div>
      <div class="drawer__note">Shipping & offers calculated at checkout.</div>
      <a class="btn btn--full" href="checkout.html">Checkout <span class="arr">→</span></a>
      <a class="btn btn--ghost btn--full" href="cart.html" style="margin-top:.6rem">View Bag</a>`;

    $$("[data-inc]", items).forEach(b => b.onclick = () => setQty(b.dataset.inc, (cart.find(l => l.id === b.dataset.inc)?.qty || 0) + 1));
    $$("[data-dec]", items).forEach(b => b.onclick = () => setQty(b.dataset.dec, (cart.find(l => l.id === b.dataset.dec)?.qty || 0) - 1));
    $$("[data-rm]", items).forEach(b => b.onclick = () => { removeLine(b.dataset.rm); toast("Removed from bag"); });

    if (PAGE === "cart") renderCartPage();
    if (PAGE === "checkout") renderCheckoutSummary();
  }

  function renderWishUI() {
    const badge = $("#wish-count");
    if (badge) { badge.textContent = wish.length; badge.classList.toggle("is-empty", wish.length === 0); }
    $$("[data-wish]").forEach(b => b.classList.toggle("is-active", wish.includes(b.dataset.wish)));
  }

  /* ---------- drawers / overlays ---------- */
  function openCart() { $("#cart-drawer").classList.add("is-open"); $("#drawer-overlay").classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function closeCart() { $("#cart-drawer").classList.remove("is-open"); $("#drawer-overlay").classList.remove("is-open"); document.body.style.overflow = ""; }
  function openSearch() { $("#search-overlay").classList.add("is-open"); setTimeout(() => $("#search-input").focus(), 300); }
  function closeSearch() { $("#search-overlay").classList.remove("is-open"); }

  function bindChrome() {
    $("#open-cart").onclick = openCart;
    $("#close-cart").onclick = closeCart;
    $("#drawer-overlay").onclick = closeCart;
    $("#open-search").onclick = openSearch;
    $("#close-search").onclick = closeSearch;
    $("#burger").onclick = () => { $("#burger").classList.toggle("is-open"); $("#mobile-nav").classList.toggle("is-open"); };
    $("#close-mobile").onclick = () => { $("#burger").classList.remove("is-open"); $("#mobile-nav").classList.remove("is-open"); };
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeSearch(); } });

    const input = $("#search-input");
    input.addEventListener("input", () => runSearch(input.value.trim()));
    $$("#search-hint").forEach(h => h.onclick = () => { input.value = "kundan"; runSearch("kundan"); });
  }

  function runSearch(q) {
    const box = $("#search-results");
    if (!q) { box.innerHTML = ""; return; }
    const ql = q.toLowerCase();
    const hits = SF_PRODUCTS.filter(p =>
      (p.name + " " + p.category + " " + p.desc + " " + p.finish).toLowerCase().includes(ql));
    box.innerHTML = hits.length
      ? hits.map(p => `<a class="sr" href="product.html?id=${p.id}">
          <img src="${p.img}" alt="${esc(p.name)}"><h4>${p.name}</h4><span>${fmt(p.price)}</span></a>`).join("")
      : `<div class="sr-none">Nothing found for “${esc(q)}” — try “pearl”, “hoops” or “kundan”.</div>`;
  }

  /* ---------- carousel ---------- */
  function bindCarousel(trackSel, prevSel, nextSel) {
    const track = $(trackSel); if (!track) return;
    const prev = $(prevSel), next = $(nextSel);
    const step = () => Math.min(track.clientWidth * 0.8, 720);
    if (prev) prev.onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });
    if (next) next.onclick = () => track.scrollBy({ left: step(), behavior: "smooth" });
    /* drag to scroll */
    let down = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", e => { down = true; sx = e.clientX; sl = track.scrollLeft; track.setPointerCapture(e.pointerId); });
    track.addEventListener("pointermove", e => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    ["pointerup", "pointercancel"].forEach(ev => track.addEventListener(ev, () => down = false));
  }

  /* ---------- reveal ---------- */
  function bindReveals() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: .12 });
    $$(".reveal").forEach(el => io.observe(el));
  }

  /* ---------- accordions ---------- */
  function bindAccordions() {
    $$(".accordion__head").forEach(h => h.onclick = () => {
      const item = h.parentElement, open = item.classList.contains("is-open");
      $$(".accordion__item", item.parentElement).forEach(i => i.classList.remove("is-open"));
      if (!open) item.classList.add("is-open");
    });
  }

  /* ---------- newsletter ---------- */
  function bindNewsletter() {
    const f = $("#news-form"); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const v = $("#news-email").value.trim();
      const msg = $("#news-msg");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = "Please enter a valid email address."; msg.className = "news-msg err"; return; }
      const list = store.get("sfaselin_news", []);
      if (list.includes(v)) { msg.textContent = "You're already on the list — good taste repeats itself."; msg.className = "news-msg ok"; return; }
      list.push(v); store.set("sfaselin_news", list);
      msg.textContent = "Welcome to the glow list. Your 10% welcome code: SFASELIN10"; msg.className = "news-msg ok";
      f.reset();
    };
  }

  /* ============================================================
     PAGE: HOME
     ============================================================ */
  function initHome() {
    const catWrap = $("#cat-grid");
    if (catWrap) catWrap.innerHTML = SF_CATEGORIES.map((c, i) => `
      <a class="cat-tile reveal" data-delay="${i % 4}" href="shop.html?cat=${encodeURIComponent(c.name)}">
        <img src="${c.img}" alt="${c.name}" loading="lazy">
        <div class="cat-tile__label"><h3>${c.name}</h3><span>${c.note}</span></div>
      </a>`).join("");

    const feat = $("#featured-track");
    if (feat) {
      feat.innerHTML = SF_PRODUCTS.filter(p => p.featured).map(p => productCard(p)).join("");
      bindProductButtons(feat);
      bindCarousel("#featured-track", "#feat-prev", "#feat-next");
    }
    const best = $("#best-grid");
    if (best) {
      best.innerHTML = SF_PRODUCTS.filter(p => p.tag === "Bestseller").slice(0, 4).map(p => productCard(p, true)).join("");
      bindProductButtons(best);
    }
  }

  /* ============================================================
     PAGE: SHOP
     ============================================================ */
  const shopState = { cats: new Set(), maxPrice: 2500, sort: "featured", q: "" };

  function initShop() {
    const params = new URLSearchParams(location.search);
    const pre = params.get("cat"), q = params.get("q");
    if (pre) shopState.cats.add(pre);
    if (q) { shopState.q = q; const si = $("#shop-search"); if (si) si.value = q; }

    /* category filters */
    const cats = [...new Set(SF_PRODUCTS.map(p => p.category))];
    $("#filter-cats").innerHTML = cats.map(c => {
      const n = SF_PRODUCTS.filter(p => p.category === c).length;
      return `<label class="filter-opt"><input type="checkbox" value="${esc(c)}" ${shopState.cats.has(c) ? "checked" : ""}>
        <span>${c}</span><span class="cnt">${n}</span></label>`;
    }).join("");
    $$("#filter-cats input").forEach(i => i.onchange = () => {
      i.checked ? shopState.cats.add(i.value) : shopState.cats.delete(i.value);
      renderShopGrid();
    });

    /* price filters */
    const bands = [["0-10", "Under $10", 0, 10], ["10-20", "$10 – $20", 10, 20],
                   ["20-99999", "Above $20", 20, 99999]];
    $("#filter-price").innerHTML = bands.map(([v, l]) =>
      `<label class="filter-opt"><input type="checkbox" value="${v}" checked><span>${l}</span></label>`).join("");
    $$("#filter-price input").forEach(i => i.onchange = renderShopGrid);

    $("#shop-sort").onchange = e => { shopState.sort = e.target.value; renderShopGrid(); };
    const si = $("#shop-search");
    if (si) si.oninput = () => { shopState.q = si.value.trim().toLowerCase(); renderShopGrid(); };
    const clr = $("#clear-filters");
    if (clr) clr.onclick = () => {
      shopState.cats.clear(); shopState.q = ""; if (si) si.value = "";
      $$("#filter-cats input").forEach(i => i.checked = false);
      $$("#filter-price input").forEach(i => i.checked = true);
      $("#shop-sort").value = "featured"; shopState.sort = "featured";
      renderShopGrid();
    };
    renderShopGrid();
  }

  function renderShopGrid() {
    const grid = $("#shop-grid"); if (!grid) return;
    const bandsOn = $$("#filter-price input:checked").map(i => i.value);
    const inBand = p => bandsOn.some(v => {
      const [a, b] = v.split("-").map(Number); return p.price >= a && p.price <= b;
    });
    let list = SF_PRODUCTS.filter(p =>
      (shopState.cats.size === 0 || shopState.cats.has(p.category)) && inBand(p) &&
      (!shopState.q || (p.name + p.category + p.desc).toLowerCase().includes(shopState.q)));

    const sorters = {
      "featured": (a, b) => (b.featured - a.featured) || (b.rating - a.rating),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "discount": (a, b) => off(b) - off(a),
      "rating": (a, b) => b.rating - a.rating
    };
    list.sort(sorters[shopState.sort] || sorters.featured);

    $("#shop-count").textContent = `${list.length} piece${list.length === 1 ? "" : "s"}`;
    grid.innerHTML = list.length
      ? list.map(p => productCard(p)).join("")
      : `<div class="shop-empty"><h3>Nothing matches those filters.</h3>
         <p>Loosen a filter or two — the perfect piece is close.</p>
         <button class="btn btn--ghost" id="empty-clear">Clear all filters</button></div>`;
    bindProductButtons(grid);
    const ec = $("#empty-clear"); if (ec) ec.onclick = () => $("#clear-filters").click();
  }

  /* ============================================================
     PAGE: PRODUCT DETAIL
     ============================================================ */
  function initProduct() {
    const id = new URLSearchParams(location.search).get("id");
    const p = byId(id) || SF_PRODUCTS[0];
    document.title = `${p.name} — SFASELIN`;
    const root = $("#pd-root");
    root.innerHTML = `
      <div class="pd-layout">
        <div class="pd-media">
          <div class="pd-media__frame"><img src="${p.img}" alt="${esc(p.name)}"></div>
        </div>
        <div class="pd-info">
          <div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> /
            <a href="shop.html?cat=${encodeURIComponent(p.category)}">${p.category}</a></div>
          <h1>${p.name}</h1>
          <div class="micro micro--gold">★ ${p.rating} · ${p.reviews} verified reviews ${p.tag ? "· " + p.tag : ""}</div>
          <div class="pd-price"><b>${fmt(p.price)}</b><s>${fmt(p.mrp)}</s>
            <span class="price-off">Save ${off(p)}%</span></div>
          <p class="pd-desc">${p.desc}</p>
          <div class="qty-row">
            <div class="qty">
              <button id="q-dec" aria-label="Decrease">−</button>
              <input id="q-val" value="1" inputmode="numeric" aria-label="Quantity">
              <button id="q-inc" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="pd-actions">
            <button class="btn" id="pd-add">Add to Bag — ${fmt(p.price)}</button>
            <button class="btn btn--ghost" id="pd-buy">Buy It Now</button>
            <button class="wish-btn ${wish.includes(p.id) ? "is-active" : ""}" style="position:static;opacity:1;transform:none;border:1px solid var(--line-strong);width:52px;height:52px;border-radius:0"
              id="pd-wish" aria-label="Wishlist">${I.heart}</button>
          </div>
          <div class="pd-trust">
            <div>${I.truck} Free US shipping over ${fmt(SF_FREE_SHIP)}</div>
            <div>${I.ret} 30-day easy returns</div>
            <div>${I.shield} 6-month anti-tarnish promise</div>
          </div>
          <div class="pd-meta">
            <div><dt>Finish</dt><dd>${p.finish}</dd></div>
            <div><dt>Material</dt><dd>${p.material}</dd></div>
            <div><dt>SKU</dt><dd>SF-${p.id.slice(0, 6).toUpperCase()}</dd></div>
            <div><dt>Dispatch</dt><dd>Ships in 1–2 business days from New York</dd></div>
          </div>
          <div class="accordion">
            <div class="accordion__item">
              <button class="accordion__head"><span>Care Instructions</span><span>+</span></button>
              <div class="accordion__body"><div>Keep away from water, perfume and hairspray.
                Wipe with a soft dry cloth after wear and store in the Sfaselin pouch provided.
                With care, our micro-plating keeps its glow for years.</div></div>
            </div>
            <div class="accordion__item">
              <button class="accordion__head"><span>Shipping & Returns</span><span>+</span></button>
              <div class="accordion__body"><div>Ships in 1–2 business days; delivery in 2–5 business days across the US.
                Free shipping over ${fmt(SF_FREE_SHIP)} (else $4.99). 30-day easy returns on unworn pieces —
                see our <a class="link-line" href="refund-policy.html">Returns & Refunds</a> policy.</div></div>
            </div>
            <div class="accordion__item">
              <button class="accordion__head"><span>What is imitation jewelry?</span><span>+</span></button>
              <div class="accordion__body"><div>Fine craftsmanship without fine-metal prices: brass or copper alloy cores,
                micro gold/silver plating, hand-set kundan, CZ and shell pearls. You get the look and feel of
                precious jewelry at a fraction of the cost.</div></div>
            </div>
          </div>
        </div>
      </div>`;

    let qty = 1;
    const qv = $("#q-val");
    $("#q-dec").onclick = () => { qty = Math.max(1, qty - 1); qv.value = qty; };
    $("#q-inc").onclick = () => { qty = Math.min(10, qty + 1); qv.value = qty; };
    qv.onchange = () => { qty = Math.min(10, Math.max(1, parseInt(qv.value) || 1)); qv.value = qty; };
    $("#pd-add").onclick = () => addToCart(p.id, qty, true);
    $("#pd-buy").onclick = () => { addToCart(p.id, qty, false); location.href = "checkout.html"; };
    $("#pd-wish").onclick = e => toggleWish(p.id, e.currentTarget);

    const rel = SF_PRODUCTS.filter(x => x.id !== p.id && x.category === p.category)
      .concat(SF_PRODUCTS.filter(x => x.id !== p.id && x.category !== p.category))
      .slice(0, 8);
    const relTrack = $("#related-track");
    relTrack.innerHTML = rel.map(x => productCard(x)).join("");
    bindProductButtons(relTrack);
    bindCarousel("#related-track", "#rel-prev", "#rel-next");
    bindAccordions();
  }

  /* ============================================================
     PAGE: CART
     ============================================================ */
  function calcTotals() {
    const sub = cartSubtotal();
    let disc = 0;
    if (coupon && SF_COUPONS[coupon]) {
      const c = SF_COUPONS[coupon];
      if (c.type === "pct") disc = Math.round(sub * c.value / 100);
      else if (!c.min || sub >= c.min) disc = c.value;
    }
    const ship = cart.length === 0 ? 0 : (sub - disc >= SF_FREE_SHIP ? 0 : SF_SHIP_FEE);
    return { sub, disc, ship, total: Math.max(0, sub - disc + ship) };
  }

  function summaryHTML(t) {
    return `
      <div class="summary__row"><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
      ${t.disc ? `<div class="summary__row" style="color:var(--ok)"><span>Coupon ${coupon}</span><span>−${fmt(t.disc)}</span></div>` : ""}
      <div class="summary__row"><span>Shipping</span><span>${t.ship === 0 ? "Free" : fmt(t.ship)}</span></div>
      <div class="summary__row summary__row--total"><span>Total</span><b>${fmt(t.total)}</b></div>`;
  }

  function renderCartPage() {
    const list = $("#cart-list"); if (!list) return;
    if (cart.length === 0) {
      $("#cartpage-root").innerHTML = `<div class="shop-empty" style="grid-column:1/-1">
        <h3 class="serif">Your bag is empty.</h3>
        <p>Beautiful things are waiting on the shelf.</p>
        <a class="btn" href="shop.html">Shop the Collection</a></div>`;
      return;
    }
    list.innerHTML = cart.map(l => {
      const p = byId(l.id);
      return `<div class="cart-row">
        <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${esc(p.name)}"></a>
        <div>
          <div class="cart-row__name"><a href="product.html?id=${p.id}">${p.name}</a></div>
          <div class="cart-row__cat">${p.category}</div>
          <div class="cart-row__price">${fmt(p.price)} <s style="color:var(--brown-3)">${fmt(p.mrp)}</s></div>
        </div>
        <div class="cart-line__qty">
          <button data-pdec="${p.id}">−</button><b>${l.qty}</b><button data-pinc="${p.id}">+</button>
        </div>
        <b>${fmt(p.price * l.qty)}</b>
        <button class="cart-line__rm" data-prm="${p.id}">Remove</button>
      </div>`;
    }).join("");
    $$("[data-pinc]", list).forEach(b => b.onclick = () => setQty(b.dataset.pinc, cart.find(l => l.id === b.dataset.pinc).qty + 1));
    $$("[data-pdec]", list).forEach(b => b.onclick = () => setQty(b.dataset.pdec, cart.find(l => l.id === b.dataset.pdec).qty - 1));
    $$("[data-prm]", list).forEach(b => b.onclick = () => { removeLine(b.dataset.prm); toast("Removed from bag"); });
    renderSummaryBox();
  }

  function renderSummaryBox() {
    const box = $("#cart-summary"); if (!box) return;
    const t = calcTotals();
    box.innerHTML = `
      <h3>Order Summary</h3>
      <div class="promo-row">
        <input id="promo-input" placeholder="Coupon code" value="${coupon || ""}">
        <button id="promo-apply">Apply</button>
      </div>
      <div class="promo-msg" id="promo-msg"></div>
      ${summaryHTML(t)}
      <a class="btn btn--full" href="checkout.html">Proceed to Checkout <span class="arr">→</span></a>
      <div class="summary__secure">Secure checkout · Cards, PayPal & Apple Pay</div>`;
    $("#promo-apply").onclick = applyCoupon;
  }

  function applyCoupon() {
    const code = $("#promo-input").value.trim().toUpperCase();
    if (!code) return;
    const c = SF_COUPONS[code];
    let text, cls;
    if (!c) { text = "That code isn't valid."; cls = "promo-msg err"; coupon = null; }
    else if (c.min && cartSubtotal() < c.min) { text = `Needs a minimum order of ${fmt(c.min)}.`; cls = "promo-msg err"; coupon = null; }
    else { text = `Applied: ${c.label}.`; cls = "promo-msg ok"; coupon = code; }
    store.set("sfaselin_coupon", coupon);
    renderSummaryBox();
    if (PAGE === "checkout") renderCheckoutSummary();
    const msg = $("#promo-msg");
    if (msg) { msg.textContent = text; msg.className = cls; }
  }

  function initCart() { renderCartPage(); }

  /* ============================================================
     PAGE: CHECKOUT
     ============================================================ */
  function renderCheckoutSummary() {
    const box = $("#co-summary"); if (!box) return;
    if (cart.length === 0) {
      $("#checkout-root").innerHTML = `<div class="shop-empty">
        <h3 class="serif">Nothing to check out yet.</h3>
        <p>Add a piece or two first.</p><a class="btn" href="shop.html">Shop the Collection</a></div>`;
      return;
    }
    const t = calcTotals();
    box.innerHTML = `
      <div class="mini-lines">
        ${cart.map(l => { const p = byId(l.id); return `
          <div class="mini-line"><img src="${p.img}" alt="${esc(p.name)}">
            <div><h5>${p.name}</h5><small>Qty ${l.qty} · ${p.category}</small></div>
            <b>${fmt(p.price * l.qty)}</b></div>`; }).join("")}
      </div>
      <div class="promo-row">
        <input id="promo-input" placeholder="Coupon code" value="${coupon || ""}">
        <button id="promo-apply">Apply</button>
      </div>
      <div class="promo-msg" id="promo-msg"></div>
      ${summaryHTML(t)}`;
    $("#promo-apply").onclick = applyCoupon;
  }

  function initCheckout() {
    renderCheckoutSummary();
    const form = $("#co-form"); if (!form) return;

    /* payment option selection + card fields toggle */
    $$(".pay-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        $$(".pay-opt").forEach(o => o.classList.remove("is-selected"));
        opt.classList.add("is-selected");
        opt.querySelector("input[type=radio]").checked = true;
      });
    });

    /* live field validation */
    const rules = {
      "f-name":  v => v.trim().length >= 3 || "Please enter your full name.",
      "f-email": v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address.",
      "f-phone": v => /^\d{10}$/.test(v.replace(/\D/g, "")) || "Enter a valid 10-digit US phone number.",
      "f-addr":  v => v.trim().length >= 8 || "Please enter your full street address.",
      "f-city":  v => v.trim().length >= 2 || "Required.",
      "f-state": v => v !== "" || "Select your state.",
      "f-pin":   v => /^\d{5}(-\d{4})?$/.test(v.trim()) || "Enter a 5-digit ZIP code."
    };
    const validate = id => {
      const el = $("#" + id); if (!el) return true;
      const r = rules[id](el.value);
      el.closest(".field").classList.toggle("has-error", r !== true);
      if (r !== true) el.closest(".field").querySelector(".err-msg").textContent = r;
      return r === true;
    };
    Object.keys(rules).forEach(id => { const el = $("#" + id); if (el) el.addEventListener("blur", () => validate(id)); });

    /* card fields only validated when card chosen */
    const cardRules = () => {
      const pay = document.querySelector("input[name=pay]:checked")?.value;
      if (pay !== "card") return true;
      let ok = true;
      const cn = $("#f-cardno"), cv = $("#f-cvv"), ex = $("#f-exp");
      const test = (el, good, msg) => {
        el.closest(".field").classList.toggle("has-error", !good);
        if (!good) { el.closest(".field").querySelector(".err-msg").textContent = msg; ok = false; }
      };
      test(cn, /^\d{16}$/.test(cn.value.replace(/\s/g, "")), "Enter the 16-digit card number.");
      test(ex, /^(0[1-9]|1[0-2])\/\d{2}$/.test(ex.value.trim()), "Use MM/YY.");
      test(cv, /^\d{3,4}$/.test(cv.value.trim()), "3–4 digits.");
      return ok;
    };
    const cn = $("#f-cardno");
    if (cn) cn.addEventListener("input", () => {
      cn.value = cn.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    });

    form.onsubmit = e => {
      e.preventDefault();
      const fieldsOk = Object.keys(rules).map(validate).every(Boolean);
      if (!fieldsOk || !cardRules()) {
        toast("Please fix the highlighted fields");
        const bad = $(".field.has-error input, .field.has-error select");
        if (bad) bad.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const pay = document.querySelector("input[name=pay]:checked")?.value || "card";
      const t = calcTotals();
      const order = {
        id: "SF" + Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        name: $("#f-name").value.trim(), email: $("#f-email").value.trim(),
        phone: $("#f-phone").value.trim(),
        address: [$("#f-addr").value.trim(), $("#f-city").value.trim(), $("#f-state").value, $("#f-pin").value.trim()].join(", "),
        pay, items: cart.map(l => ({ ...l, name: byId(l.id).name, price: byId(l.id).price })),
        coupon, ...t
      };
      const orders = store.get("sfaselin_orders", []); orders.push(order);
      store.set("sfaselin_orders", orders);
      cart = []; coupon = null;
      store.set("sfaselin_cart", cart); store.set("sfaselin_coupon", null);
      renderCartUI();
      const payLabel = { card: "Card", paypal: "PayPal", applepay: "Apple Pay" }[pay];
      $("#checkout-root").innerHTML = `
        <div class="order-success">
          <div class="order-success__ring"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></div>
          <div class="micro micro--gold">Order Confirmed</div>
          <h1>Thank you, ${esc(order.name.split(" ")[0])}.</h1>
          <p>Your order is being gift-wrapped at our New York studio and will ship within 1–2 business days.</p>
          <p>A confirmation has been sent to <b>${esc(order.email)}</b>.</p>
          <div class="order-id">ORDER ${order.id} · ${payLabel} · ${fmt(order.total)}</div>
          <div>
            <a class="btn" href="shop.html">Continue Shopping <span class="arr">→</span></a>
          </div>
        </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  /* ============================================================
     PAGE: WISHLIST
     ============================================================ */
  function renderWishlistPage() {
    const grid = $("#wish-grid"); if (!grid) return;
    const items = wish.map(byId).filter(Boolean);
    grid.innerHTML = items.length
      ? items.map(p => productCard(p)).join("")
      : `<div class="shop-empty" style="grid-column:1/-1">
          <h3 class="serif">Your wishlist is empty.</h3>
          <p>Tap the heart on any piece to keep it here.</p>
          <a class="btn" href="shop.html">Browse Jewelry</a></div>`;
    bindProductButtons(grid);
    renderWishUI();
  }

  /* ============================================================
     PAGE: CONTACT
     ============================================================ */
  function initContact() {
    const f = $("#contact-form"); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const n = $("#c-name"), em = $("#c-email"), m = $("#c-msg");
      const msg = $("#contact-msg");
      if (n.value.trim().length < 3) { msg.textContent = "Please tell us your name."; msg.className = "form-msg err"; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value)) { msg.textContent = "Please enter a valid email."; msg.className = "form-msg err"; return; }
      if (m.value.trim().length < 10) { msg.textContent = "Your message is a little short — tell us more."; msg.className = "form-msg err"; return; }
      const inbox = store.get("sfaselin_messages", []);
      inbox.push({ name: n.value.trim(), email: em.value.trim(), topic: $("#c-topic").value, msg: m.value.trim(), date: new Date().toISOString() });
      store.set("sfaselin_messages", inbox);
      msg.textContent = "Message received. We reply within one working day — usually much faster.";
      msg.className = "form-msg ok";
      f.reset();
    };
  }

  /* ============================================================
     BOOT
     ============================================================ */
  injectLayout();
  bindChrome();
  bindNewsletter();
  renderCartUI();
  renderWishUI();

  ({ home: initHome, shop: initShop, product: initProduct, cart: initCart,
     checkout: initCheckout, wishlist: renderWishlistPage, contact: initContact }[PAGE] || (() => {}))();

  bindAccordions();
  bindReveals();
})();
