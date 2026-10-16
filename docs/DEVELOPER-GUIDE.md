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
| `current` | Underlines this page in the menu. Matches a `page` value in `site.json` → `menu`. |
| `noindex` | Set to `yes` to keep a page out of search engines and the sitemap (used by the 404 page). |
| `og_title`, `og_image`, `og_image_alt`, `og_type` | Optional overrides for link previews. |
| `support_heading`, `support_text`, `support_button`, `support_button_2` | Change the blue support band's wording on this page only. See [The support band](#the-support-band). |

### Placeholders available on every page

| Placeholder | Value |
| --- | --- |
| `{{ base }}` | The site's root path: `/step/` live, `/` locally. Start every internal link with it. |
| `{{ site.<key> }}` | Any text setting from `site.json`, for example `{{ site.email }}`. |
| `{{ year }}` | The current year. |
| `{{ partial.support }}` | The blue support band, worded for this page. |
| `{{ partial.<name> }}` | Any other file in `src/partials/`. |
| `{{ participants.all }}` | Cards for every participant, without the "Read story" button (Home). |
| `{{ participants.all_h2 }}` | The same cards with names as h2 headings (Stories page). |
| `{{ participants.all_cols }}` | `3` or `4`, the column count that leaves the fewest empty spots. |
| `{{ participants.carousel }}` | The home page photo carousel. |
| `{{ photo.<id>.<size> }}` | One participant's photo, for example `{{ photo.jan.quote }}`. Sizes are `card`, `hero`, `story` and `quote`. |
| `{{ person.<id>.name }}` | A participant's name, for example `{{ person.jan.name }}`. |
| `{{ person.<id>.link }}` | A "Read Jan’s story" link to their page. `{{ person.<id>.url }}` is just the address. |
| `{{ person.<id>.<setting> }}` | Any setting in their file ending in `quote`, for example `{{ person.jan.about_quote }}`. |

`src/layout.html` also receives `title`, `description`, `canonical`, `og_*`, `robots`, `jsonld`, `nav.header`, `nav.footer` and `content` (the page itself).

### Quoting a participant on a page

Quotes live only in the participant's own file, so a correction there updates every page. The convention is one setting per place the quote appears:

| Setting | Where it shows |
| --- | --- |
| `quote` | Top of their story page |
| `card_quote` | Their card |
| `hero_quote` | Home page carousel |
| `home_quote` | Other spots on the Home page |
| `about_quote` | About page, "What participants want you to know" |
| `how_quote` | How it works page |

To quote someone in a new place, add a setting such as `hire_quote:` to their file and use `{{ person.<id>.hire_quote }}` on the page. If the setting is missing, the build stops and names it.

### The menu

The header menu and the footer's "Explore" list both come from `site.json` → `menu`:

```json
{"label": "Employers", "footer_label": "For employers", "href": "hire.html", "page": "hire"}
```

| Field | Meaning |
| --- | --- |
| `label` | Link text. |
| `href` | Address from the site root, like `about.html` or `stories/`. |
| `page` | Matches the `current` setting of the page, to underline it. |
| `footer_label` | Optional different text in the footer. |
| `header` / `footer` | Set to `false` to leave the link out of one of them. |

### The support band

The blue "Help someone take the next step" band at the bottom of several pages uses one template, `src/partials/support.html`. Its default wording and buttons are in `site.json` → `support`. A page changes any of them in its settings:

```html
<!--
title: For employers
support_heading: Have a role to fill?
support_text: Tell us about it, and we’ll let you know if someone in the program may be a fit.
support_button: Contact us | contact.html?subject=hiring#contact-form
support_button_2: none
-->
```

Buttons are written `Label | link`. The link `donate` means `site.json`'s `donate_url`, and `none` hides the button.

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
2. If it belongs in the menu, add it to `site.json` → `menu` with a `page` value, and put the same value in the page's `current` setting.
3. Rebuild. The page is added to the sitemap automatically.

## CSS

All styles are in [assets/css/styles.css](../assets/css/styles.css). The comment at the top lists its sections in order.

- **Variables first.** Every color, text size, shadow and radius is defined once in `:root` at the top. Rules use the variables, never typed-in values, so a brand color or the overall text size changes in one line.
- **Colors** are named for what they are: `--navy`, `--blue`, `--blue-light`, plus groups for neutrals, text on dark backgrounds, and form messages. The only typed-in colors left are a few see-through white overlays used once each.
- **Text sizes** use a scale from `--text-2xs` (12px) to `--text-2xl` (26px), plus `--text-h1`, `--text-h2` and two sizes for big numbers. A handful of headings and quotes keep their own sizes because they scale with the screen width in their own way.
- **Breakpoints** are five widths: 1100px (small laptops), 900px (tablets), 760px (phone menu), 560px (phones) and 420px (small phones). CSS can't store these in variables, so stick to these numbers when adding rules.
- **Class names** follow `block__part--variant`, for example `.stair`, `.stair__bar`, `.stair--2`.
- **Responsive rules** sit in `@media (max-width: …)` blocks directly under the rules they change, so everything about one component is in one place.
- **No preprocessor or build step.** Edit and rebuild.

The build adds a short content hash to the CSS and JS links (`styles.css?v=1a2b3c4d`). Browsers fetch the new file as soon as it changes, so there is no need to clear caches by hand.

## JavaScript

[assets/js/main.js](../assets/js/main.js) is the only script. It has no dependencies. The comment at the top lists what each part does.

Every page works without it. The script only adds the phone menu, the carousel's rotation, the growing step bars, form checks and the copy-link button. Each part checks that its elements exist before running, so one file serves every page.

## Fonts and images

- **Fonts** are self-hosted variable fonts under the SIL Open Font License: Newsreader for headings and quotes, Public Sans for everything else. They cover Latin characters only.
- **The fonts are trimmed** to the weights the site uses (Newsreader 400–600, italic 400–500, Public Sans 400–700), which makes them about a third smaller. [tools/trim_fonts.py](../tools/trim_fonts.py) does this. To use a weight outside those ranges, download the full font from Google Fonts into `assets/fonts/`, widen the range in the script, run it, and update the `font-weight` in the `@font-face` rules at the top of the stylesheet. Otherwise the browser fakes the weight, and it looks wrong.
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
