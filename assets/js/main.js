/* The Homeless Genealogy Initiative: mobile menu and contact form.
   Pages are complete HTML without this script; it only adds behavior. */

(function () {
  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
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
      ".section-header, .featured, .card, .facts, .quote-rotator, .columns-2 > div, " +
        ".steps li, .split > *, .support__inner, .section-more, .ledger, .problem__card, " +
        ".way, .faq__item, .pooled-note"
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      // Stagger siblings in the same grid (cards, goal columns).
      const index = [...el.parentElement.children].indexOf(el);
      if (el.matches(".card, .columns-2 > div, .way, .problem__card, .faq__item")) {
        el.style.setProperty("--delay", `${(index % 4) * 0.09}s`);
      }
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ---------- Rotating participant quotes ---------- */
  const rotator = document.querySelector(".quote-rotator");
  if (rotator) {
    const slides = [...rotator.querySelectorAll(".quote-slide")];
    const controls = rotator.parentElement.querySelector(".quote-controls");
    const dots = [...controls.querySelectorAll(".quote-dot")];
    let current = 0;
    let timer = null;

    const show = (next) => {
      next = (next + slides.length) % slides.length;
      if (next === current) return;
      const leaving = slides[current];
      leaving.classList.add("is-leaving");
      leaving.hidden = true;
      setTimeout(() => leaving.classList.remove("is-leaving"), 600);
      slides[next].hidden = false;
      dots[current].removeAttribute("aria-current");
      dots[next].setAttribute("aria-current", "true");
      current = next;
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!reduceMotion && !timer) timer = setInterval(() => show(current + 1), 7000); };

    rotator.classList.add("js-rotator");
    controls.hidden = false;
    dots[0].setAttribute("aria-current", "true");
    controls.querySelectorAll("[data-dir]").forEach((b) =>
      b.addEventListener("click", () => { stop(); show(current + Number(b.dataset.dir)); start(); })
    );
    dots.forEach((d, i) => d.addEventListener("click", () => { stop(); show(i); start(); }));
    const area = rotator.parentElement;
    area.addEventListener("mouseenter", stop);
    area.addEventListener("mouseleave", start);
    area.addEventListener("focusin", stop);
    area.addEventListener("focusout", start);
    start();
  }

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
