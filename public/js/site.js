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
