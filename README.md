# The Homeless Genealogy Initiative — Website

A static website (plain HTML, CSS, and JavaScript, with no build step) for the Homeless Genealogy Initiative ("Putting Down Roots"). Its layout takes inspiration from Kiva: participant story cards, a story page for each person, and Donate buttons throughout. Donations go to the program as a whole, never to one participant.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Meet our participants | `stories.html` |
| A participant's story | `story.html?p=<id>` (for example `story.html?p=jan`) |
| About ("What is Putting Down Roots") | `about.html` |
| How it works | `how-it-works.html` |
| Contact | `contact.html` |

## Common updates

### Add or edit a participant
Everything about participants lives in **`assets/js/participants.js`**. Instructions are at the top of that file.

1. Put their photo in `assets/img/`. A portrait about 900×1200 px works best.
2. Copy an existing entry in `participants.js` and fill in `id`, `name`, `photo`, `tag`, `blurb`, `quote`, and `story`.
3. The new person shows up automatically on the home page, the participants page, and their own story page.

If someone has no photo yet, set `photo: null` and the site shows their initial instead.

### Change the Donate link, email, Facebook page, or address
Edit the `SITE` settings at the top of **`assets/js/main.js`**.

- `donateUrl`: no online giving page exists yet, so Donate buttons open the contact form with "Donations" selected. Paste a real giving link here once there is one.
- `formEndpoint`: the contact form has no email service connected yet. When someone presses Send, their own email app opens with the message already filled in and addressed to the program's email. To have messages sent straight from the site instead, create a free form at [Formspree](https://formspree.io) and paste its URL here.

### Change the navigation, header, or footer
These are written once, in `assets/js/main.js` (`NAV`, `renderHeader`, `renderFooter`), and shared by every page.

### Colors and fonts
Colors are variables at the top of `assets/css/styles.css`. Headings use Fraunces and body text uses DM Sans, both from Google Fonts.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Publish with GitHub Pages

1. Create a new repository on GitHub, for example `homeless-genealogy-initiative`.
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/<your-username>/homeless-genealogy-initiative.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, then branch **main** and folder **/ (root)**.
4. After a minute or two, the site is live at `https://<your-username>.github.io/homeless-genealogy-initiative/`.
