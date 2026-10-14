/* STEP: mobile menu and contact form.
   Pages are complete HTML without this script; it only adds behavior. */

(function () {
  /* ---------- Refresh stale pages ----------
     GitHub Pages lets browsers reuse a page for 10 minutes. If a newer version
     has been published since this copy was saved, fetch it and reload once. */
  const buildMeta = document.querySelector('meta[name="build"]');
  if (buildMeta && window.fetch) {
    fetch(buildMeta.dataset.versionUrl, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (v) => {
        if (!v || !v.build || v.build === buildMeta.content) return;
        const key = "step-reloaded-" + v.build;
        try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { return; }
        await fetch(location.href, { cache: "reload" });
        location.reload();
      })
      .catch(() => {});
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Header shadow once the page scrolls ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Reveal on scroll ----------
     Only elements that start below the first screen are hidden, so nothing
     flickers on load and everything stays visible if JavaScript fails. */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const targets = document.querySelectorAll(
      ".section-header, .featured, .card, .voice, .columns-2 > div, " +
        ".steps li, .split > *, .support__inner, .section-more, .ledger, .problem__card, " +
        ".way, .faq__item"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");
          observer.unobserve(el);
          // Hand control back to hover effects once the entrance finishes.
          const done = (e) => {
            if (e.target !== el) return;
            el.removeEventListener("transitionend", done);
            el.classList.remove("reveal", "is-visible");
            el.style.removeProperty("--delay");
          };
          el.addEventListener("transitionend", done);
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      // Stagger siblings in the same grid (cards, goal columns).
      const index = [...el.parentElement.children].indexOf(el);
      if (el.matches(".card, .columns-2 > div, .way, .problem__card, .faq__item, .voice")) {
        el.style.setProperty("--delay", `${(index % 4) * 0.05}s`);
      }
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ---------- Steps grow as you scroll ----------
     Each step's progress (0 to 1) follows its position in the window, so the
     staircase builds as you scroll down and unbuilds if you scroll back up. */
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const scrollGroups = [
    { list: document.querySelector(".stairs"), items: ".stair", bar: ".stair__bar" },
    { list: document.querySelector(".phases"), items: ".phase", bar: ".phase__bar" },
  ].filter((g) => g.list);
  if (scrollGroups.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      scrollGroups.forEach(({ list, items, bar }) => {
        const els = [...list.querySelectorAll(items)];
        const sideBySide = els.length > 1 && Math.abs(els[0].offsetLeft - els[1].offsetLeft) > 10;
        const listTop = list.getBoundingClientRect().top;
        els.forEach((el, i) => {
          let p;
          if (sideBySide) {
            // Columns: build left to right as the row scrolls up the screen.
            p = (vh * 0.92 - listTop) / (vh * 0.45) - i * 0.3;
          } else {
            // Stacked: each step follows its own bar.
            const top = el.querySelector(bar).getBoundingClientRect().top;
            p = (vh * 0.95 - top) / (vh * 0.3);
          }
          el.style.setProperty("--p", ease(clamp(p)).toFixed(3));
        });
      });
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    scrollGroups.forEach((g) => g.list.classList.add("is-scroll"));
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Copy story link ---------- */
  document.querySelectorAll(".copy-link").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.url);
        button.textContent = "Link copied";
      } catch {
        window.prompt("Copy this link:", button.dataset.url);
      }
      setTimeout(() => (button.textContent = "Copy link"), 2500);
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");
  if (!form) return;

  const email = form.dataset.email;
  const endpoint = form.dataset.endpoint;
  const select = form.querySelector("#subject");
  const status = document.getElementById("form-status");

  // contact.html?subject=donations pre-selects a subject.
  const wanted = new URLSearchParams(location.search).get("subject");
  if (wanted && [...select.options].some((o) => o.value === wanted)) select.value = wanted;

  const rules = {
    name: (v) => v.trim() !== "" || "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email address.",
    subject: (v) => v !== "" || "Please choose a subject.",
    message: (v) => v.trim().length >= 5 || "Please write a short message.",
  };

  const check = (field) => {
    const result = rules[field.name](field.value);
    const wrap = field.closest(".field");
    const ok = result === true;
    wrap.classList.toggle("has-error", !ok);
    field.toggleAttribute("aria-invalid", !ok);
    wrap.querySelector(".field__error").textContent = ok ? "" : result;
    return ok;
  };

  const fields = [...form.elements].filter((f) => rules[f.name]);
  fields.forEach((f) => {
    f.addEventListener("blur", () => check(f));
    f.addEventListener("input", () => f.closest(".field").classList.contains("has-error") && check(f));
  });

  const say = (html, ok) => {
    status.className = "form-status is-visible " + (ok ? "form-status--ok" : "form-status--error");
    status.innerHTML = html;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!fields.map(check).every(Boolean)) {
      form.querySelector(".has-error input, .has-error select, .has-error textarea").focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const subject = select.options[select.selectedIndex].text;

    if (endpoint) {
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, subject }),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        say("Thank you. Your message has been sent, and we’ll be in touch soon.", true);
      } catch {
        say(`Sorry, your message didn’t go through. Please email us at <a href="mailto:${email}">${email}</a>.`, false);
      } finally {
        button.disabled = false;
      }
      return;
    }

    // No form service yet: open the visitor's email app with the message filled in.
    const body = `${data.message}\n\n${data.name}\n${data.email}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(`[${subject}] Message from ${data.name}`)}&body=${encodeURIComponent(body)}`;
    say(`Your email app should open with your message ready to send. If it doesn’t, write to us at <a href="mailto:${email}">${email}</a>.`, true);
  });
})();
