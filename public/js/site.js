/* ============================================================
   ASZTALOS ROBI — interactions
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: solidify on scroll ---- */
  const nav = $(".nav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  const burger = $(".nav__burger");
  const drawer = $(".drawer");
  const toggleMenu = (open) => {
    const o = open ?? !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", o);
    burger.setAttribute("aria-expanded", String(o));
  };
  burger && burger.addEventListener("click", () => toggleMenu());
  drawer && $$("a", drawer).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });

  /* ---- Hero intro ---- */
  requestAnimationFrame(() => $(".hero")?.classList.add("in"));

  /* ---- Mobile hero: generate tree rings ---- */
  (function buildRings() {
    const NS = "http://www.w3.org/2000/svg";
    const g = document.getElementById("mRingGroup");
    const svg = document.getElementById("mrings");
    if (!g || !svg) return;
    const cx = 496, cy = 224;
    svg.style.setProperty("--cx", cx + "px");
    svg.style.setProperty("--cy", cy + "px");
    const rnd = (a, b) => a + Math.random() * (b - a);
    let r = 10, i = 0;
    while (r < 860) {
      const late = (i % 5 === 4);
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", cx); e.setAttribute("cy", cy);
      e.setAttribute("rx", (r * rnd(0.97, 1.03)).toFixed(1));
      e.setAttribute("ry", (r * rnd(0.9, 0.96)).toFixed(1));
      e.setAttribute("transform", `rotate(${rnd(-10, 10).toFixed(1)} ${cx} ${cy})`);
      e.setAttribute("fill", "none");
      e.setAttribute("stroke", "#9c6a38");
      e.setAttribute("stroke-width", late ? rnd(2.4, 3.6).toFixed(1) : rnd(0.8, 1.6).toFixed(1));
      e.setAttribute("stroke-opacity", (late ? rnd(0.18, 0.28) : rnd(0.07, 0.14)).toFixed(3));
      g.appendChild(e);
      r += late ? rnd(26, 40) : rnd(13, 24);
      i++;
    }
    for (let k = 0; k < 5; k++) {
      const a = rnd(0, Math.PI * 2), len = rnd(260, 760);
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", cx + Math.cos(a) * 40); ln.setAttribute("y1", cy + Math.sin(a) * 40);
      ln.setAttribute("x2", cx + Math.cos(a) * len); ln.setAttribute("y2", cy + Math.sin(a) * len);
      ln.setAttribute("stroke", "#6b4a28"); ln.setAttribute("stroke-width", rnd(1.5, 3).toFixed(1));
      ln.setAttribute("stroke-opacity", rnd(0.1, 0.18).toFixed(2));
      g.appendChild(ln);
    }
  })();

  /* ---- Count-up animation ---- */
  const animateNum = (el) => {
    const target = +el.dataset.target;
    const dur = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(ease(p) * target).toLocaleString("hu-HU");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---- Scroll reveal + count-up (rect-based, works without IntersectionObserver) ---- */
  const revealEls = $$(".reveal");
  const counters  = $$("[data-target]");
  let revTick = false;
  const check = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add("in");
    });
    counters.forEach((el) => {
      if (el.dataset.done) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) {
        el.dataset.done = "1";
        if (reduce) el.textContent = (+el.dataset.target).toLocaleString("hu-HU");
        else animateNum(el);
      }
    });
  };
  const onCheck = () => { if (!revTick) { requestAnimationFrame(() => { check(); revTick = false; }); revTick = true; } };
  window.addEventListener("scroll", onCheck, { passive: true });
  window.addEventListener("resize", onCheck, { passive: true });
  window.addEventListener("load", check);
  check();
  /* failsafe: never leave content hidden */
  setTimeout(() => { revealEls.forEach((el) => el.classList.add("in")); }, 2600);

  /* ---- Hero parallax ---- */
  const heroImg = $(".hero__frame img");
  let ticking = false;
  if (heroImg && !reduce) {
    const para = () => {
      const r = heroImg.parentElement.getBoundingClientRect();
      const off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
      heroImg.style.transform = `translateY(${off.toFixed(1)}px)`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(para); ticking = true; }
    }, { passive: true });
    para();
  }

  /* ---- Gallery: balanced masonry + "show more" + even-bottom clip ---- */
  (function () {
    const moreBtn = $(".more-btn");
    const grid = $("#galeria-racs");
    if (!moreBtn || !grid) return;
    const label = $(".more-btn__txt", moreBtn);
    const allTiles = $$(".tile", grid);                 // every tile, in display order
    const DEFAULT = allTiles.filter((t) => !t.classList.contains("is-hidden")).length || 9;
    let open = false;

    const colCount = () => (window.innerWidth <= 1020 ? 2 : 3);
    const imgOf = (t) => $("img", t);
    const shownLoaded = (tiles) => tiles.every((t) => { const i = imgOf(t); return !i || (i.complete && i.naturalHeight > 0); });

    /* Greedy balanced layout: drop each tile into the currently SHORTEST column,
       so the columns end nearly even. Collapsed, clip + fade the bottom to the
       shortest column so it reads as one clean line instead of a ragged edge. */
    const layout = () => {
      const n = colCount();
      const shown = open ? allTiles : allTiles.slice(0, DEFAULT);
      const extra = open ? [] : allTiles.slice(DEFAULT);

      grid.style.maxHeight = "";
      grid.classList.remove("is-clipped");
      grid.textContent = "";                            // detach tiles (refs kept in allTiles)

      const cols = [];
      for (let i = 0; i < n; i++) {
        const c = document.createElement("div");
        c.className = "masonry__col";
        grid.appendChild(c);
        cols.push(c);
      }
      const shortest = () => {
        let m = 0;
        for (let i = 1; i < n; i++) if (cols[i].offsetHeight < cols[m].offsetHeight) m = i;
        return cols[m];
      };
      shown.forEach((t) => { t.classList.remove("is-hidden"); shortest().appendChild(t); });
      extra.forEach((t, i) => { t.classList.add("is-hidden"); cols[i % n].appendChild(t); });

      if (!open && n >= 2 && shownLoaded(shown)) {
        const min = Math.min(...cols.map((c) => c.offsetHeight));
        grid.style.maxHeight = Math.round(min) + "px";
        grid.classList.add("is-clipped");
      }
    };

    moreBtn.addEventListener("click", () => {
      open = !open;
      moreBtn.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Kevesebb" : "Több munka";
      layout();
      if (!open) $("#galeria")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });

    /* (re)layout when things change: images loading in, fonts, viewport */
    let raf;
    const relayout = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
    allTiles.forEach((t) => { const img = imgOf(t); if (img && !img.complete) img.addEventListener("load", relayout); });
    window.addEventListener("load", relayout);
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(layout, 150); }, { passive: true });
    layout();
  })();

  /* ---- Lightbox ---- */
  const tiles = $$(".masonry .tile");
  const lb = $(".lb");
  const lbImg = $(".lb__img");
  const lbCount = $(".lb__count");
  let idx = 0;
  const sources = tiles.map((t) => t.querySelector("img").getAttribute("src"));

  const show = (i) => {
    idx = (i + sources.length) % sources.length;
    lbImg.style.opacity = "0";
    const pre = new Image();
    pre.onload = () => { lbImg.src = pre.src; lbImg.style.opacity = "1"; };
    pre.src = sources[idx];
    if (lbCount) lbCount.textContent = `${String(idx + 1).padStart(2, "0")} — ${String(sources.length).padStart(2, "0")}`;
  };
  const openLB = (i) => { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; };
  const closeLB = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };

  tiles.forEach((t, i) => t.addEventListener("click", () => openLB(i)));
  lb && $(".lb__close", lb).addEventListener("click", closeLB);
  lb && $(".lb__next", lb).addEventListener("click", () => show(idx + 1));
  lb && $(".lb__prev", lb).addEventListener("click", () => show(idx - 1));
  lb && lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
})();
