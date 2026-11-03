/* ==========================================================================
   NoChic — interactions
   Core UI (menu, filters, cart, reviews, newsletter) works without any library.
   GSAP + ScrollTrigger add the scroll moments; Lenis adds smooth scrolling.
   Everything motion-related is skipped under prefers-reduced-motion.
   ========================================================================== */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  const motion = hasGSAP && !reduceMotion;

  /* ---------- Missing-asset placeholders ---------- */
  $$('img').forEach((img) => {
    const fail = () => {
      if (img.hasAttribute('data-optional')) { img.remove(); return; }
      img.closest('.media')?.classList.add('is-missing');
    };
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener('error', fail, { once: true });
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (target) => {
    if (lenis) { lenis.scrollTo(target, { duration: 1.4 }); return; }
    const behavior = reduceMotion ? 'auto' : 'smooth';
    if (target === 0) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior });
  };

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });

  /* ---------- Header: solid after the top, hides while scrolling down ---------- */
  const header = $('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  const toggleLabel = $('.menu-toggle__label', toggle);
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = 'Menu';
    root.classList.remove('menu-open');
    lenis?.start();
  }
  toggle.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = 'Sluiten';
    root.classList.add('menu-open');
    header.classList.add('is-solid');
    header.classList.remove('is-hidden');
    lenis?.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Word splitting ---------- */
  const splitWords = (el, wrap) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            frag.appendChild(wrap(part, i++));
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  };

  // Masked rise (used for headings)
  $$('[data-split]').forEach((el) => splitWords(el, (word, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.textContent = word;
    inner.style.setProperty('--i', i);
    w.appendChild(inner);
    return w;
  }));

  // Scroll-scrubbed words (story statement)
  $$('[data-scrub-words]').forEach((el) => splitWords(el, (word) => {
    const s = document.createElement('span');
    s.className = 'sw';
    s.textContent = word;
    return s;
  }));

  /* ---------- Reveal once on enter ---------- */
  const revealables = $$('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Product filters ---------- */
  let shopTrigger = null; // set by the desktop horizontal scene
  const filterBar = $('[data-filters]');
  const products = $$('[data-track] .product');
  const counts = { all: products.length };
  products.forEach((p) => { counts[p.dataset.category] = (counts[p.dataset.category] || 0) + 1; });
  $$('[data-count]', filterBar).forEach((s) => { s.textContent = String(counts[s.dataset.count] || 0).padStart(2, '0'); });

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    $$('[data-filter]', filterBar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const f = btn.dataset.filter;
    products.forEach((p) => {
      const show = f === 'all' || p.dataset.category === f;
      p.classList.toggle('is-hidden', !show);
      if (show) p.classList.add('is-entering');
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      products.forEach((p) => p.classList.remove('is-entering'));
      if (!hasGSAP) return;
      window.ScrollTrigger.refresh();
      // In the pinned track, return to the start so the filters stay in view.
      if (shopTrigger && window.scrollY > shopTrigger.start) {
        if (lenis) lenis.scrollTo(shopTrigger.start, { immediate: true });
        else window.scrollTo(0, shopTrigger.start);
      }
    }));
  });

  /* ---------- Cart (demo) + toast ---------- */
  const countEl = $('[data-cart-count]');
  const toast = $('[data-toast]');
  let cart = 0;
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };
  $$('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      cart += 1;
      countEl.textContent = cart;
      countEl.classList.remove('is-bumped');
      void countEl.offsetWidth;
      countEl.classList.add('is-bumped');
      const name = $('.product__name', btn.closest('.product')).textContent.trim();
      showToast(`${name} toegevoegd aan je mand`);
    });
  });

  /* ---------- Reviews ---------- */
  const reviewList = $('[data-review-list]');
  const reviews = [...reviewList.children];
  if (reviews.length > 1) {
    const nav = $('[data-review-nav]');
    const cur = $('[data-review-current]');
    let index = 0;
    nav.hidden = false;
    $('[data-review-total]').textContent = String(reviews.length).padStart(2, '0');
    const show = (i) => {
      index = (i + reviews.length) % reviews.length;
      reviews.forEach((r, n) => r.classList.toggle('is-active', n === index));
      cur.textContent = String(index + 1).padStart(2, '0');
    };
    $('[data-review-prev]').addEventListener('click', () => show(index - 1));
    $('[data-review-next]').addEventListener('click', () => show(index + 1));
  }

  /* ---------- Newsletter ---------- */
  const form = $('[data-newsletter]');
  const status = $('[data-newsletter-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', form);
    if (!input.checkValidity()) {
      status.textContent = 'Vul een geldig e-mailadres in.';
      input.focus();
      return;
    }
    status.textContent = 'Bedankt — je bent aangemeld.';
    form.reset();
  });

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Button fill follows the entry point ---------- */
  $$('.btn').forEach((btn) => {
    btn.addEventListener('pointerenter', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  /* ---------- Chapter indicator ---------- */
  const chapterEl = $('[data-chapter-indicator]');
  const chapterNum = $('[data-chapter-num]');
  const chapterName = $('[data-chapter-name]');
  const setChapter = (section) => {
    const [num, name] = section.dataset.chapter.split('|');
    if (chapterNum.textContent === num) return;
    chapterEl.classList.add('is-switching');
    setTimeout(() => {
      chapterNum.textContent = num;
      chapterName.textContent = name;
      chapterEl.classList.remove('is-switching');
    }, 250);
  };

  if (!motion) {
    // Without GSAP: chapters via IntersectionObserver, everything else static.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) setChapter(en.target); });
      }, { rootMargin: '-50% 0px -50% 0px' });
      $$('[data-chapter]').forEach((s) => io.observe(s));
    }
    return;
  }

  /* ======================================================================
     Motion layer (GSAP)
     ====================================================================== */
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const metrics = () => {
    const w = window.innerWidth;
    const pad = Math.min(64, Math.max(20, w * 0.04));
    return { w, pad, edge: Math.max(pad, (w - 1520) / 2 + pad) };
  };

  const mm = gsap.matchMedia();

  /* ----- Desktop: pinned scenes ----- */
  mm.add('(min-width: 1024px)', () => {
    /* I. Hero — framed image opens to full bleed */
    const hero = $('[data-hero]');
    const frame = $('[data-hero-frame]');
    const heroLines = $$('.hero__line', hero);
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=100%', scrub: 1, pin: true, anticipatePin: 1 },
    });
    heroTl
      .fromTo(frame, {
        clipPath: () => { const m = metrics(); return `inset(84px ${m.edge}px ${m.pad}px ${m.w * 0.54}px)`; },
      }, { clipPath: 'inset(0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo($('[data-hero-img]'), { scale: 1.16 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .to(frame, { '--shade': 1, ease: 'none', duration: 0.8 }, 0.2)
      .fromTo(['.hero__foot', '.hero__eyebrow', '.hero__scroll'], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, ease: 'power1.in', duration: 0.4 }, 0)
      .to(heroLines, { x: (i) => [0, 24, 64, 12][i] || 0, ease: 'none', duration: 1 }, 0);

    /* II. Shop — vertical scroll drives a horizontal track */
    const shop = $('[data-shop]');
    const track = $('[data-track]');
    const bar = $('[data-shop-progress]');
    const intro = $('[data-shop-intro]');
    track.prepend(intro);
    shop.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const trackTween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: shop,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
      },
    });
    shopTrigger = trackTween.scrollTrigger;
    // Cards drift slightly against the track for depth
    products.forEach((p) => {
      gsap.fromTo($$('.product__img', p), { xPercent: 4 }, {
        xPercent: -4,
        ease: 'none',
        scrollTrigger: { trigger: p, containerAnimation: trackTween, start: 'left right', end: 'right left', scrub: true },
      });
    });

    /* IV. Campaign — the poster assembles while pinned */
    const campaign = $('[data-campaign]');
    const steps = $$('[data-campaign-steps] li');
    const camTl = gsap.timeline({
      scrollTrigger: { trigger: campaign, start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1 },
    });
    camTl
      .from('[data-word-a]', { xPercent: -45, autoAlpha: 0, ease: 'power3.out', duration: 1 }, 0)
      .from('[data-word-b]', { xPercent: 45, autoAlpha: 0, ease: 'power3.out', duration: 1 }, 0)
      .from('[data-campaign-product] img', { yPercent: 55, rotate: -10, ease: 'power3.out', duration: 1.2 }, 0.1)
      .from(['.campaign__desc', '.campaign__buy'], { autoAlpha: 0, y: 30, duration: 0.5, stagger: 0.1 }, 0.8);
    steps.forEach((li, i) => {
      camTl.fromTo(li, { opacity: 0.25 }, { opacity: 1, duration: 0.3 }, 0.9 + i * 0.35);
    });
    camTl.to({}, { duration: 0.4 });

    return () => {
      shopTrigger = null;
      $('.shop__pin').prepend(intro);
      shop.classList.remove('is-horizontal');
      gsap.set(track, { clearProps: 'transform' });
    };
  });

  /* ----- All sizes ----- */
  mm.add('all', () => {
    /* III. Story — the dark panel widens into place */
    const story = $('[data-story]');
    gsap.fromTo(story, { clipPath: 'inset(0% 4% 0% 4%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: story, start: 'top bottom', end: 'top 25%', scrub: true },
    });

    // Statement fills in word by word
    gsap.fromTo($$('.sw', story), { opacity: 0.14 }, {
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: { trigger: '.story__quote', start: 'top 80%', end: 'bottom 45%', scrub: true },
    });

    // Main image: clip reveal from the bottom, then a slow drift
    const main = $('[data-clip-reveal]');
    const mainImg = $('img', main);
    gsap.timeline({ scrollTrigger: { trigger: main, start: 'top 82%' } })
      .fromTo(main, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out' }, 0)
      .fromTo(mainImg, { scale: 1.35 }, { scale: 1.08, duration: 2, ease: 'expo.out' }, 0);
    gsap.fromTo(mainImg, { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: main, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // Detail image floats faster than the page
    const detail = $('[data-float]');
    gsap.fromTo(detail, { yPercent: 18 }, {
      yPercent: Number(detail.dataset.float) || -18,
      ease: 'none',
      scrollTrigger: { trigger: '.story__body', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* VI. Closing — a window that opens to full bleed */
    const closing = $('[data-closing]');
    const opening = { trigger: closing, start: 'top bottom', end: 'top top', scrub: true };
    gsap.fromTo([$('[data-closing-media]'), $('.closing__shade')], { clipPath: 'inset(14% 20% 14% 20%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: opening });
    gsap.fromTo($('[data-closing-media] img'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: opening });
    gsap.from('[data-closing-a]', { xPercent: -14, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: closing, start: 'top 55%', end: 'top 5%', scrub: true } });
    gsap.from('[data-closing-b]', { xPercent: 14, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: closing, start: 'top 45%', end: 'top top', scrub: true } });
  });

  /* ----- Chapters (created last so pinned offsets are known) ----- */
  $$('[data-chapter]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => setChapter(section),
      onEnterBack: () => setChapter(section),
    });
  });

  /* ----- Pointer: magnetic elements + contextual cursor ----- */
  if (finePointer) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = el.classList.contains('shop__end') ? 0.12 : 0.28;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.6, ease: 'power3.out',
        });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)' }));
    });

    const cursor = $('[data-cursor-el]');
    const cursorLabel = $('[data-cursor-label]');
    root.classList.add('has-cursor');
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        cursorLabel.textContent = el.dataset.cursor;
        gsap.to(cursor, { scale: 1, duration: 0.5, ease: 'expo.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(cursor, { scale: 0, duration: 0.4, ease: 'expo.out' }));
    });
  }

  // Images and fonts change layout — recalc trigger positions once settled.
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
