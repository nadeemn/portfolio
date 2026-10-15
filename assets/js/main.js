/* Nadeem Nazer — personal site
   Small progressive enhancements only; the page works without JS. */

(function () {
  const root = document.documentElement;

  /* Theme toggle (remembers choice per browser) */
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current =
        root.dataset.theme ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (_) {}
    });
  }

  /* Mobile nav */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Highlight the nav link of the section in view */
  const links = new Map();
  document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
    links.set(a.getAttribute("href").slice(1), a);
  });
  if ("IntersectionObserver" in window && links.size) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.remove("active"));
          const link = links.get(entry.target.id);
          if (link) link.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* Smooth scrolling for in-page links: eased, offset below the sticky nav,
     interruptible, and instant when the visitor prefers reduced motion. */
  const nav = document.querySelector(".nav");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let scrollFrame = null;

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function cancelScroll() {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = null;
  }

  function smoothScrollTo(y, onDone) {
    cancelScroll();
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const end = Math.max(0, Math.min(y, maxY));
    const start = window.scrollY;
    const distance = end - start;
    if (reduceMotion.matches || Math.abs(distance) < 2) {
      window.scrollTo(0, end);
      if (onDone) onDone();
      return;
    }
    // Longer jumps take a little longer, within 0.35–0.9 s.
    const duration = Math.min(900, 350 + Math.abs(distance) * 0.15);
    let startTime = null;
    const step = (now) => {
      if (startTime === null) startTime = now;
      const progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) {
        scrollFrame = requestAnimationFrame(step);
      } else {
        scrollFrame = null;
        if (onDone) onDone();
      }
    };
    scrollFrame = requestAnimationFrame(step);
  }

  function scrollToElement(el, onDone) {
    const offset = (nav ? nav.offsetHeight : 0) + 12;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    smoothScrollTo(y, onDone);
  }

  // Bring a section back into view after collapsing content above the fold.
  function keepInView(el) {
    if (el && el.getBoundingClientRect().top < 0) scrollToElement(el);
  }

  // Let the visitor take over mid-animation.
  ["wheel", "touchstart", "keydown"].forEach((type) =>
    window.addEventListener(type, cancelScroll, { passive: true })
  );

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const hash = link.getAttribute("href");
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();

    // Open any collapsed timeline entry that contains the target.
    for (let d = target.closest("details"); d; d = d.parentElement.closest("details")) {
      d.open = true;
    }

    if (location.hash !== hash) history.pushState(null, "", hash);
    scrollToElement(target, () => {
      // Move keyboard focus to the destination without a second jump.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* Publication summaries: hidden until "Summary" is clicked */
  document.querySelectorAll(".pub-toggle").forEach((btn) => {
    const summary = document.getElementById(btn.getAttribute("aria-controls"));
    if (!summary) return;
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const open = summary.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* Experience: expand / collapse all timeline entries */
  const xpCards = Array.from(document.querySelectorAll(".timeline details"));
  const xpToggleAll = document.getElementById("xp-toggle-all");
  if (xpToggleAll && xpCards.length) {
    const allOpen = () => xpCards.every((d) => d.open);
    const sync = () => {
      xpToggleAll.textContent = allOpen() ? "Collapse all" : "Expand all";
    };
    xpToggleAll.hidden = false;
    xpToggleAll.addEventListener("click", () => {
      const open = !allOpen();
      xpCards.forEach((d) => (d.open = open));
      sync();
      if (!open) keepInView(document.getElementById("experience"));
    });
    xpCards.forEach((d) => d.addEventListener("toggle", sync));
    sync();
  }

  /* Projects: show the first four, reveal the rest on demand */
  const projectGrid = document.getElementById("project-grid");
  const projectsMore = document.getElementById("projects-more");
  if (projectGrid && projectsMore) {
    const extra = projectGrid.querySelectorAll(".project-extra").length;
    const label = projectsMore.querySelector("span");
    if (extra) {
      projectGrid.classList.add("is-collapsed");
      projectsMore.hidden = false;
      projectsMore.addEventListener("click", () => {
        const collapsed = projectGrid.classList.toggle("is-collapsed");
        projectsMore.setAttribute("aria-expanded", String(!collapsed));
        label.textContent = collapsed
          ? `Show ${extra} more projects`
          : "Show fewer projects";
        if (collapsed) keepInView(document.getElementById("projects"));
      });
    }
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
