# Developer guide

This guide is for someone taking over or contributing to the STEP website. Start with the [README](../README.md) for the overview and quick start. This page explains how the pieces fit together.

## The build, step by step

Everything happens in [build.py](../build.py), a single file of about 500 lines that uses only the Python standard library plus Pillow for photos. `main()` runs these steps in order:

1. **Start clean.** Delete `_site/` and copy `assets/` into it.
2. **Load participants.** Read each file in `content/participants/`, split the settings from the story text, and sort by `order`. For each photo, Pillow writes a compressed JPEG, WebP copies at 480px and full width, and a 1200×630 crop for link previews in `_site/assets/img/og/`.
3. **Fill the context.** Build one dictionary, `ctx`, holding every value a page may ask for. Repeating HTML, like participant cards and carousel slides, is generated in Python here and stored as finished strings.
4. **Render pages.** For each file in `src/pages/`, read the settings comment at the top, replace each `{{ placeholder }}` with its `ctx` value, then place the result inside `src/layout.html`.
5. **Render stories.** Turn each participant's text into HTML, fill `src/templates/story.html`, and wrap it in the layout.
6. **Write extras.** `sitemap.xml`, `robots.txt`, `.nojekyll`, and two redirect pages for old addresses.

The output is plain files. Any static host could serve `_site/`.

## Templates

Templates are ordinary HTML. The only special syntax is `{{ name }}`, which is replaced with a value. There are no loops, conditions or includes, by design: logic stays in `build.py`, and the HTML stays readable for non-programmers.

If a template uses a name that doesn't exist, the build stops with an error naming the file and the placeholder. That keeps typos off the live site.

### Page settings

Each file in `src/pages/` starts with an HTML comment holding its settings:

```html
<!--
title: How it works
description: STEP works in three stages: start working, build skills and stability, and move on to a lasting job.
current: how
-->
```

| Setting | Meaning |
| --- | --- |
| `title` | The browser tab title. Every page except Home gets " \| STEP" added. |
| `description` | Shown under the title in search results and link previews. Keep it under about 155 characters. |
| `current` | Underlines this page in the menu. One of `about`, `how`, `stories`, `hire`, `contact`. |
| `noindex` | Set to `yes` to keep a page out of search engines and the sitemap (used by the 404 page). |
| `og_title`, `og_image`, `og_image_alt`, `og_type` | Optional overrides for link previews. |

### Placeholders available on every page

| Placeholder | Value |
| --- | --- |
| `{{ base }}` | The site's root path: `/step/` live, `/` locally. Start every internal link with it. |
| `{{ site.<key> }}` | Any text setting from `site.json`, for example `{{ site.email }}`. |
| `{{ year }}` | The current year. |
| `{{ partial.<name> }}` | The contents of `src/partials/<name>.html`. |
| `{{ participants.all }}` | Cards for every participant, without the "Read story" button (Home). |
| `{{ participants.all_h2 }}` | The same cards with names as h2 headings (Stories page). |
| `{{ participants.all_cols }}` | `3` or `4`, the column count that leaves the fewest empty spots. |
| `{{ participants.carousel }}` | The home page photo carousel. |
| `{{ photo.<id>.<size> }}` | One participant's photo, for example `{{ photo.jan.quote }}`. Sizes are `card`, `hero`, `story` and `quote`. |

`src/layout.html` also receives `title`, `description`, `canonical`, `og_*`, `robots`, `jsonld` and `content` (the page itself).

### Placeholders on story pages

`src/templates/story.html` gets these extra values for the person being shown: `p.name`, `p.quote`, `p.photo`, `p.body`, `p.status`, `p.more` (cards for up to four other people), `p.more_cols`, `p.url`, `p.share_url`, `p.next_url`, `p.next_name` and `p.next_quote`.

### Story text format

Story files use a small subset of Markdown, handled by `markdown_blocks()` in `build.py`:

| Write | Get |
| --- | --- |
| A blank line between paragraphs | Separate paragraphs |
| `*words*` | Italics |
| A paragraph starting with `> ` | A large pull quote |
| A paragraph starting with `## ` | A heading, for example "Update: March 2027" |

Straight apostrophes are turned into curly ones. Bullet lists, links and bold are not supported in stories.

## Adding a new page

1. Create `src/pages/new-page.html` with a settings comment and the page body. It will be published as `new-page.html`.
2. If it belongs in the menu, add a link in `src/layout.html` in both the header and the footer. To underline it when active, add its key to the `for key in (...)` list in `main()` and use `{{ current.<key> }}` on the link.
3. Rebuild. The page is added to the sitemap automatically.

## CSS

All styles are in [assets/css/styles.css](../assets/css/styles.css). The comment at the top lists its sections in order.

- **Variables first.** Colors, fonts, radii and shadows are defined once in `:root`. Each color notes its contrast ratio.
- **Class names** follow `block__part--variant`, for example `.stair`, `.stair__bar`, `.stair--2`.
- **Responsive rules** sit in `@media (max-width: …)` blocks directly under the rules they change, so everything about one component is in one place.
- **No preprocessor or build step.** Edit and rebuild.

The build adds a short content hash to the CSS and JS links (`styles.css?v=1a2b3c4d`). Browsers fetch the new file as soon as it changes, so there is no need to clear caches by hand.

## JavaScript

[assets/js/main.js](../assets/js/main.js) is the only script. It has no dependencies. The comment at the top lists what each part does.

Every page works without it. The script only adds the phone menu, the carousel's rotation, the growing step bars, form checks and the copy-link button. Each part checks that its elements exist before running, so one file serves every page.

## Fonts and images

- **Fonts** are self-hosted variable fonts under the SIL Open Font License: Newsreader for headings and quotes, Public Sans for everything else. They cover Latin characters only.
- **Participant photos** go in `assets/img/` at roughly 900×1200. The build makes the smaller copies, so don't commit resized versions.
- **Page photos** (About, Employers, How it works) were resized ahead of time into `-600`, `-900` and `-1200` WebP files next to the JPEG. Do the same for any new page photo.
- **Logos** in `assets/img/partners/` are SVG. The Record Linking Lab logo was traced from the lab's own image because no vector version is published.

## Design rules

These keep the site consistent. Changes that break them have usually been tried and rejected.

- **Colors:** BYU navy `#002e5d` for the header, headings and dark panels, and BYU royal blue `#0062b8` for links and buttons. The Donate button is light blue `#99c0e3` with dark text. Backgrounds are white and light gray `#f3f4f6`.
- **No** gradients, decorative icons, or arrows after links. Avoid blue-and-green color pairings.
- **Motion is minimal:** only the home page step bars grow and the carousel slides. Anyone with "reduce motion" turned on sees no animation.
- **Text contrast** stays at 4.5:1 or higher. Check it after any color change.
- **Participants** appear by first name only. Publish only photos and stories they have agreed to share. Quotes are their own words, unedited.
- **Plain language.** Short sentences, no jargon, no fundraising clichés.

## Accessibility built in

- A "Skip to content" link, one h1 per page, and headings in order.
- Alt text on every image. Decorative SVGs are hidden from screen readers.
- The carousel pauses on hover and keyboard focus, and is labeled for screen readers.
- Form errors are announced as they appear, and focus moves to the first problem.
- FAQ answers use the native `<details>` element, which works with keyboards and screen readers without extra code.

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| Build stops with `Unknown placeholder {{ x }} in page.html` | A typo in a placeholder, or a name that doesn't exist. Check the tables above. |
| A participant's photo doesn't show | The `photo:` file name must match exactly, including capital letters. GitHub's servers are case-sensitive even when a Mac isn't. |
| A change isn't on the live site | Check the **Actions** tab on GitHub for a failed run. If it succeeded, wait a few minutes: GitHub Pages caches pages for up to 10 minutes. |
| Photos look large or slow locally | Pillow isn't installed. Run `.venv/bin/pip install -r requirements.txt`. |
| Links are broken locally | Build with `--base /`. Without it, links point to `/step/`. |
| Link previews on Facebook show old content | Paste the page address into Facebook's Sharing Debugger and click "Scrape Again". |
