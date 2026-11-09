/* ==========================================================================
   NoChic — behaviour for the pages other than the homepage:
   cart page, site search and forms that have no backend yet.
   Loaded after js/main.js, which provides window.NoChicCart.
   ========================================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const products = window.NOCHIC_PRODUCTS || [];
  const pages = window.NOCHIC_PAGES || [];
  const cart = window.NoChicCart;

  /* ---------- Cart page ---------- */
  const cartPage = $('[data-cart-page]');
  if (cartPage) {
    const lines = $('[data-cart-lines]');
    const filled = $('[data-cart-filled]');
    const empty = $('[data-cart-empty]');
    const totalEl = $('[data-cart-total]');
    const PLACEHOLDER = '€ [prijs]';

    const renderLine = (product, qty) => {
      const li = document.createElement('li');
      li.className = 'cart-line';
      const lineTotal = typeof product.price === 'number' ? cart.formatPrice(product.price * qty) : PLACEHOLDER;
      li.innerHTML = `
        <a class="cart-line__img media" href="${product.url}"><img src="${product.image}" alt="" width="900" height="1125"></a>
        <div class="cart-line__info">
          <h2 class="cart-line__name"><a href="${product.url}">${product.name}</a></h2>
          <p class="label label--muted">${product.size}</p>
          <button class="cart-line__remove" type="button" data-remove>Verwijderen</button>
        </div>
        <div class="stepper" role="group" aria-label="Aantal ${product.name}">
          <button type="button" data-step="-1" aria-label="Eén minder">&minus;</button>
          <span aria-live="polite">${qty}</span>
          <button type="button" data-step="1" aria-label="Eén meer">+</button>
        </div>
        <p class="cart-line__price">${lineTotal}</p>`;
      li.addEventListener('click', (e) => {
        const step = e.target.closest('[data-step]');
        if (step) cart.setQuantity(product.slug, qty + Number(step.dataset.step));
        else if (e.target.closest('[data-remove]')) cart.setQuantity(product.slug, 0);
        else return;
        render();
      });
      return li;
    };

    function render() {
      const items = Object.entries(cart.items());
      filled.hidden = items.length === 0;
      empty.hidden = items.length > 0;
      lines.replaceChildren(...items.map(([slug, qty]) => renderLine(products.find((p) => p.slug === slug), qty)));
      const known = items.every(([slug]) => typeof products.find((p) => p.slug === slug).price === 'number');
      totalEl.textContent = known
        ? cart.formatPrice(items.reduce((sum, [slug, qty]) => sum + products.find((p) => p.slug === slug).price * qty, 0))
        : PLACEHOLDER;
    }
    render();
  }

  /* ---------- Search ---------- */
  const searchPage = $('[data-search-page]');
  if (searchPage) {
    const input = $('input', searchPage);
    const results = $('[data-search-results]');
    const status = $('[data-search-status]');
    const entries = [
      ...products.map((p) => ({ title: p.name, url: p.url, text: `${p.category} ${p.description}`, kind: 'Product' })),
      ...pages.map((p) => ({ ...p, kind: p.kind || 'Pagina' })),
    ];

    const run = (query) => {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      results.replaceChildren();
      if (!terms.length) { status.textContent = ''; return; }
      const hits = entries.filter((en) => {
        const hay = `${en.title} ${en.text}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      });
      status.textContent = hits.length === 1 ? '1 resultaat' : `${hits.length} resultaten`;
      hits.forEach((hit) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'search-hit';
        a.href = hit.url;
        const kind = document.createElement('span');
        kind.className = 'label label--muted';
        kind.textContent = hit.kind;
        const title = document.createElement('span');
        title.className = 'search-hit__title';
        title.textContent = hit.title;
        const text = document.createElement('span');
        text.className = 'search-hit__text';
        text.textContent = hit.text;
        a.append(kind, title, text);
        li.appendChild(a);
        results.appendChild(li);
      });
    };

    input.value = new URLSearchParams(window.location.search).get('q') || '';
    run(input.value);
    input.addEventListener('input', () => run(input.value));
    searchPage.addEventListener('submit', (e) => {
      e.preventDefault();
      history.replaceState(null, '', `?q=${encodeURIComponent(input.value)}`);
      run(input.value);
    });
  }

  /* ---------- Forms without a backend: say so instead of faking success ---------- */
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const status = $('[data-form-status]', form);
      status.textContent = form.dataset.demoForm;
    });
  });

  /* The cart's checkout button is a stand-in for the same reason */
  const checkout = $('[data-checkout]');
  if (checkout) {
    checkout.addEventListener('click', () => {
      $('[data-checkout-status]').textContent = 'Afrekenen is nog niet beschikbaar. De betaalkoppeling volgt.';
    });
  }
})();
