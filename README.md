# The Homeless Genealogy Initiative — Website

Live site: https://theian-studios.github.io/homeless-genealogy-initiative/

A static website for the Homeless Genealogy Initiative ("Putting Down Roots"). A small Python script (`build.py`) turns the content files into finished HTML pages. GitHub runs it automatically on every push to `main` and publishes the result with GitHub Pages.

## Where things live

| What | File |
| --- | --- |
| Participant stories | `content/participants/<name>.md` (one file per person) |
| Participant photos | `assets/img/` |
| Email, Donate link, Facebook, address, live URL | `site.json` |
| Home, About, How it works, Contact, 404 pages | `src/pages/` |
| Participants list page | `src/pages/stories/index.html` |
| Story page layout | `src/templates/story.html` |
| Header, footer, `<head>` tags shared by every page | `src/layout.html` |
| "Support the program" banner | `src/partials/support.html` |
| Styles | `assets/css/styles.css` |
| Mobile menu and contact form behavior | `assets/js/main.js` |

## Adding or editing a participant

You can do this directly on GitHub in the browser. Within a minute or two of saving, the site rebuilds itself.

1. Upload their photo to `assets/img/`, for example `maria.jpg`. A portrait about 900×1200 px works best.
2. Create `content/participants/maria.md`. The file name becomes the page address (`stories/maria.html`).

```markdown
---
name: Maria
order: 6
photo: maria.jpg
photo_position: 50% 30%
quote: A short quote in Maria’s own words.
featured: no
---

First paragraph of the story.

Second paragraph. Use *asterisks* for italics.

> “A line starting with > becomes a large pull quote.”
```

- `order` sets the position in the list.
- `photo_position` controls which part of the photo stays visible when it's cropped. The second number moves the crop up or down.
- `featured: yes` gives that person the large spot on the home page. Only one person should have it.
- Leave `photo:` empty if there's no photo yet. The site shows their initial instead.
- `summary:` is optional. When present, it appears in a box above the full story.

## Donate link and contact form

Edit `site.json`:

- `donate_url`: Donate buttons open the contact form with "Donations" selected. Replace this with a real giving page link when you have one.
- `form_endpoint`: blank means the form opens the visitor's own email app with their message filled in. To have messages sent straight from the site, create a free form at Web3Forms or Formspree and paste its URL here.
- `url`: the site's public address. Change it if you set up a custom domain.

## Building locally

```bash
python3 -m venv .venv && .venv/bin/pip install pillow
```

```bash
.venv/bin/python build.py --base / && python3 -m http.server 8080 -d _site
```

Then open http://localhost:8080. Pillow resizes the photos, converts them to WebP and creates the link-preview images. Without it, the build still works, but photos are copied at full size.

## What the build produces

- A complete HTML page for every page and every participant. Nothing depends on JavaScript to show up.
- Link-preview tags for Facebook, iMessage and other apps, with a cropped photo for each story page and `assets/img/og-home.jpg` for everything else.
- Resized WebP photos, so phones download small images.
- `sitemap.xml`, `robots.txt`, and a 404 page.
- Redirects from the old addresses (`story.html?p=jan` and `stories.html`).
