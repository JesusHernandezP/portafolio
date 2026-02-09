/* =========================
   main.js — Portfolio v2
   Features:
   - Theme toggle (dark/light) + persistence
   - Project filter chips
   - Copy email button with feedback
   - Footer year
   - Soft scroll reveal (respects reduced motion)
========================= */

(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Theme ----------
  const html = document.documentElement;
  const themeToggle = $("#themeToggle");

  // Detect system theme (fallback)
  const systemPrefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  // Load saved theme if any
  const savedTheme = localStorage.getItem("theme"); // "light" | "dark" | null
  const initialTheme = savedTheme ?? (systemPrefersLight ? "light" : "dark");

  setTheme(initialTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next, true);
    });
  }

  function setTheme(theme, persist) {
    html.setAttribute("data-theme", theme);
    if (persist) localStorage.setItem("theme", theme);

    // Update toggle aria state
    if (themeToggle) {
      const pressed = theme === "light";
      themeToggle.setAttribute("aria-pressed", String(pressed));
      themeToggle.title =
        theme === "light" ? "Cambiar a oscuro" : "Cambiar a claro";
    }
  }

  // ---------- Project Filter ----------
  const chips = $$("[data-filter]");
  const projectsGrid = $("#projectsGrid");
  const projectCards = projectsGrid ? $$(".project-card", projectsGrid) : [];

  if (chips.length && projectCards.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter") || "all";

        // Active UI
        chips.forEach((c) => c.classList.remove("chip-active"));
        chip.classList.add("chip-active");

        // Filter cards
        projectCards.forEach((card) => {
          const category = card.getAttribute("data-category") || "";
          const show = filter === "all" || category === filter;

          card.style.display = show ? "" : "none";
          card.setAttribute("aria-hidden", String(!show));
        });
      });
    });
  }

  // ---------- Copy Email ----------
  const copyBtn = $("#copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email") || "";
      if (!email) return;

      const originalText = copyBtn.textContent;

      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "Copiado ✓";
        copyBtn.classList.add("copied");

        window.setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove("copied");
        }, 1400);
      } catch (err) {
        // Fallback: select via prompt (last resort)
        window.prompt("Copia el email:", email);
      }
    });
  }

  // ---------- Soft reveal on scroll ----------
  // Adds a small fade-up when elements enter the viewport.
  if (!prefersReducedMotion()) {
    const revealTargets = [
      ".section-title",
      ".section-subtitle",
      ".project-card",
      ".skills-grid .card",
      ".split .card",
      ".hero-copy > *",
      ".hero-card .card",
    ]
      .map((s) => $$(s))
      .flat()
      .filter(Boolean);

    revealTargets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      el.style.transition = "opacity .45s ease, transform .45s ease";
      el.style.willChange = "opacity, transform";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.unobserve(el);
        });
      },
      { threshold: 0.12 },
    );

    revealTargets.forEach((el) => io.observe(el));
  }
})();
