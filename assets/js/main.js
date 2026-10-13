/* ==========================================================================
   The Homeless Genealogy Initiative — shared site script
   ========================================================================== */

/* ---------- Site settings (edit these) ---------- */
const SITE = {
  name: "The Homeless Genealogy Initiative",
  shortName: "Homeless Genealogy Initiative",
  tagline: "Putting Down Roots",
  email: "homelessgenealogyinitiative@gmail.com",
  facebook: "https://www.facebook.com/BYUrecordlinkinglab/",
  address: "Economics Department Record Linking Lab, Campus Dr 2146 WVB, Provo, UT 84604",

  // Where the "Donate" buttons go. Until an online giving page exists, they
  // open the contact form with "Donations" pre-selected. When you have a
  // giving link, paste it here (e.g. "https://give.example.org/hgi").
  donateUrl: "contact.html?subject=donations#contact-form",

  // Optional: a form service URL (e.g. Formspree "https://formspree.io/f/xxxx").
  // Leave empty and the contact form will open the visitor's email app
  // with their message filled in, addressed to the email above.
  formEndpoint: "",
};

/* ---------- Icons (inline SVG, Lucide-style) ---------- */
const ICONS = {
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  tree: '<path d="M12 22v-7"/><path d="M9 22h6"/><circle cx="12" cy="9" r="6"/><path d="M12 9v6"/><path d="m9.5 11.5 2.5 2 2.5-2"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  laptop: '<rect width="18" height="12" x="3" y="4" rx="2"/><path d="M2 20h20"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  idcard: '<rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4"/><path d="M14 14h4"/>',
  table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

function icon(name, extra = "") {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[name] || ""}</svg>`;
}
function fbIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z"/></svg>`;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Header & footer ---------- */
const NAV = [
  { href: "stories.html", label: "Participants", match: ["stories.html", "story.html"] },
  { href: "about.html", label: "About" },
  { href: "how-it-works.html", label: "How It Works" },
  { href: "contact.html", label: "Contact" },
];

function currentPage() {
  const file = location.pathname.split("/").pop();
  return file === "" ? "index.html" : file;
}

function brandHtml() {
  return `
    <a class="brand" href="index.html" aria-label="${SITE.name} — home">
      <img src="assets/img/logo-mark.svg" alt="" width="42" height="42">
      <span class="brand__text">
        <span class="brand__name">${SITE.shortName}</span>
        <span class="brand__tag">${SITE.tagline}</span>
      </span>
    </a>`;
}

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const page = currentPage();
  const links = NAV.map((item) => {
    const active = (item.match || [item.href]).includes(page);
    return `<a href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
  }).join("");

  el.className = "site-header";
  el.innerHTML = `
    <div class="container site-header__inner">
      ${brandHtml()}
      <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">${icon("menu")}</button>
      <nav class="nav" id="primary-nav" aria-label="Primary">
        ${links}
        <a class="btn btn--primary" href="${SITE.donateUrl}">${icon("heart")} Donate</a>
      </nav>
    </div>`;

  const toggle = el.querySelector(".nav-toggle");
  const nav = el.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = icon(open ? "close" : "menu");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) toggle.click();
  });
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "site-footer";
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          ${brandHtml()}
          <p>A transitional employment program providing real jobs, real skills, and a path to stability for Utah County’s unhoused community.</p>
          <a class="footer-social" href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Follow us on Facebook">${fbIcon()}</a>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="stories.html">Meet our participants</a></li>
            <li><a href="about.html">About us</a></li>
            <li><a href="how-it-works.html">How it works</a></li>
          </ul>
        </div>
        <div>
          <h4>Get involved</h4>
          <ul>
            <li><a href="${SITE.donateUrl}">Donate</a></li>
            <li><a href="contact.html?subject=volunteer#contact-form">Volunteer</a></li>
            <li><a href="contact.html?subject=employment#contact-form">Join the program</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li>${SITE.address}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${SITE.name}</span>
        <span>In collaboration with BYU’s Department of Economics &amp; Record Linking Lab</span>
      </div>
    </div>`;
}

/* ---------- Participant cards ---------- */
function photoHtml(p, sizes = "") {
  if (p.photo) {
    const pos = p.photoPosition ? ` style="object-position:${p.photoPosition}"` : "";
    return `<img src="${p.photo}" alt="Portrait of ${escapeHtml(p.name)}" loading="lazy"${pos}${sizes}>`;
  }
  return `<div class="photo-placeholder" role="img" aria-label="${escapeHtml(p.name)} — photo coming soon"><span>${escapeHtml(p.name.charAt(0))}</span><small>Photo coming soon</small></div>`;
}

function cardHtml(p) {
  return `
    <a class="p-card reveal" href="story.html?p=${encodeURIComponent(p.id)}">
      <div class="p-card__media">
        ${photoHtml(p)}
        <span class="p-card__tag">${escapeHtml(p.tag)}</span>
      </div>
      <div class="p-card__body">
        <h3 class="p-card__name">${escapeHtml(p.name)}</h3>
        <p class="p-card__blurb">${escapeHtml(p.blurb)}</p>
        <span class="text-link p-card__cta">Read ${escapeHtml(p.name)}’s story ${icon("arrow")}</span>
      </div>
    </a>`;
}

function renderCardGrids() {
  const people = window.HGI_PARTICIPANTS || [];
  document.querySelectorAll("[data-participants]").forEach((grid) => {
    const exclude = grid.dataset.exclude;
    const limit = parseInt(grid.dataset.limit, 10) || people.length;
    grid.innerHTML = people
      .filter((p) => p.id !== exclude)
      .slice(0, limit)
      .map(cardHtml)
      .join("");
  });
}

/* ---------- Story page ---------- */
function renderStory() {
  const root = document.getElementById("story-root");
  if (!root) return;
  const people = window.HGI_PARTICIPANTS || [];
  const id = new URLSearchParams(location.search).get("p");
  const p = people.find((x) => x.id === id);

  if (!p) {
    root.innerHTML = `
      <div class="container section narrow center">
        <h1>Story not found</h1>
        <p class="lead">We couldn’t find that participant’s story.</p>
        <a class="btn btn--primary" href="stories.html">See all participants</a>
      </div>`;
    return;
  }

  document.title = `${p.name}’s story — ${SITE.name}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", p.blurb);

  const body = p.story
    .map((para) => (typeof para === "object" && para.pull ? `<p class="story-pull">${escapeHtml(para.pull)}</p>` : `<p>${para}</p>`))
    .join("");
  const summary = p.summary
    ? `<div class="story-summary"><p>${p.summary}</p></div><h2>Expanded story</h2>`
    : "";

  root.innerHTML = `
    <section class="story-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a> / <a href="stories.html">Participants</a> / <span aria-current="page">${escapeHtml(p.name)}</span>
        </nav>
        <div class="story-layout">
          <aside class="story-aside">
            <div class="story-photo">${photoHtml(p)}</div>
            <div class="support-card">
              <h3>Help more people like ${escapeHtml(p.name)}</h3>
              <p>Your gift funds paid, flexible work, weekly training, and a path to stable employment for participants in the program.</p>
              <a class="btn btn--primary" href="${SITE.donateUrl}">${icon("heart")} Support the program</a>
              <p class="support-card__note">Donations support the whole program, not individual participants.</p>
            </div>
          </aside>
          <article>
            <header class="story-header">
              <span class="eyebrow">Participant story · ${escapeHtml(p.tag)}</span>
              <h1>Meet ${escapeHtml(p.name)}</h1>
              <p class="story-header__quote">“${escapeHtml(p.quote)}”</p>
            </header>
            <div class="story-body">
              ${summary}
              ${body}
            </div>
          </article>
        </div>
      </div>
    </section>
    <section class="section section--sand">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">Keep reading</span>
          <h2>More participant stories</h2>
        </div>
        <div class="card-grid" data-participants data-exclude="${escapeHtml(p.id)}" data-limit="4"></div>
      </div>
    </section>`;
}

/* ---------- Contact form ---------- */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Pre-select subject from ?subject=donations|volunteer|employment|general
  const subjectParam = new URLSearchParams(location.search).get("subject");
  const select = form.querySelector("#subject");
  if (subjectParam && select) {
    const opt = [...select.options].find((o) => o.value === subjectParam);
    if (opt) select.value = subjectParam;
  }

  const status = document.getElementById("form-status");
  const showStatus = (msg, ok) => {
    status.className = `form-status is-visible ${ok ? "form-status--ok" : "form-status--error"}`;
    status.innerHTML = msg;
  };

  const validators = {
    name: (v) => v.trim().length > 0 || "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email address.",
    subject: (v) => v !== "" || "Please choose a subject.",
    message: (v) => v.trim().length >= 5 || "Please write a short message.",
  };

  function validateField(field) {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const wrap = field.closest(".field");
    const err = wrap.querySelector(".field__error");
    if (result === true) {
      wrap.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
      return true;
    }
    wrap.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    err.textContent = result;
    return false;
  }

  form.querySelectorAll("input, select, textarea").forEach((f) => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => f.closest(".field").classList.contains("has-error") && validateField(f));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("input, select, textarea")].filter((f) => validators[f.name]);
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      form.querySelector(".has-error input, .has-error select, .has-error textarea")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const subjectLabel = select.options[select.selectedIndex].text;

    if (SITE.formEndpoint) {
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(SITE.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, subject: subjectLabel }),
        });
        if (!res.ok) throw new Error();
        form.reset();
        showStatus("<strong>Thank you!</strong> Your message has been sent. We’ll be in touch soon.", true);
      } catch {
        showStatus(`Sorry, something went wrong. Please email us directly at <a href="mailto:${SITE.email}">${SITE.email}</a>.`, false);
      } finally {
        btn.disabled = false;
      }
      return;
    }

    // No form service configured: open the visitor's email app, pre-filled.
    const subject = `[${subjectLabel}] Message from ${data.name}`;
    const bodyText = `${data.message}\n\n— ${data.name}\n${data.email}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    showStatus(
      `<strong>Almost done!</strong> Your email app should open with your message ready to send. If it doesn’t, email us at <a href="mailto:${SITE.email}">${SITE.email}</a>.`,
      true
    );
  });
}

/* ---------- Fill in site settings used in page markup ---------- */
function fillSiteSettings() {
  document.querySelectorAll("[data-site-email]").forEach((a) => {
    a.href = `mailto:${SITE.email}`;
    a.textContent = SITE.email;
  });
  document.querySelectorAll("[data-site-facebook]").forEach((a) => (a.href = SITE.facebook));
  document.querySelectorAll("[data-site-address]").forEach((el) => (el.textContent = SITE.address));
  document.querySelectorAll("[data-donate]").forEach((a) => (a.href = SITE.donateUrl));
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = el.dataset.icon === "facebook" ? fbIcon() : icon(el.dataset.icon);
  });
}

/* ---------- Reveal on scroll ---------- */
function setupReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  renderStory();
  renderCardGrids();
  fillSiteSettings();
  setupContactForm();
  setupReveal();

  // Re-apply #anchor scrolling now that the header and content are in place.
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
});
