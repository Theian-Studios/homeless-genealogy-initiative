#!/usr/bin/env python3
"""Build the Homeless Genealogy Initiative website into _site/.

    python3 build.py               # build for the live site
    python3 build.py --base /      # build for local preview at http://localhost:8080/

Sources:
    site.json                    site-wide settings (email, donate link, ...)
    content/participants/*.md    one file per participant story
    src/layout.html              shared <head>, header and footer
    src/pages/**.html            page bodies
    src/partials/*.html          snippets reused across pages
    src/templates/story.html     participant story page
    assets/                      CSS, JS and images (copied as-is)

Pillow is optional. When installed, photos are resized and converted to WebP
and social-sharing images are generated; without it, photos are copied as-is.
"""

import argparse
import datetime
import hashlib
import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import quote, urlparse

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    Image = None

ROOT = Path(__file__).parent
OUT = ROOT / "_site"
IMG_SRC = ROOT / "assets" / "img"
IMG_OUT = OUT / "assets" / "img"

PLACEHOLDER = re.compile(r"\{\{\s*([\w.\-]+)\s*\}\}")


# --------------------------------------------------------------------------- helpers

def esc(text):
    return html.escape(str(text), quote=True)


def render(template, ctx, source="template"):
    def sub(match):
        key = match.group(1)
        if key not in ctx:
            raise KeyError(f"Unknown placeholder {{{{ {key} }}}} in {source}")
        return str(ctx[key])

    return PLACEHOLDER.sub(sub, template)


def split_front_matter(text, comment=False):
    """Return (meta, body) from '---' front matter (Markdown) or an HTML comment."""
    pattern = r"\A<!--\s*\n(.*?)\n-->\s*\n" if comment else r"\A---\s*\n(.*?)\n---\s*\n"
    match = re.match(pattern, text, re.S)
    if not match:
        return {}, text
    meta = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, text[match.end():]


def inline_md(text):
    return re.sub(r"\*(.+?)\*", r"<em>\1</em>", esc(text).replace("&#x27;", "’"))


def markdown_blocks(text):
    """Paragraphs separated by blank lines; '> ' is a pull quote, '## ' a heading."""
    out = []
    for block in re.split(r"\n\s*\n", text.strip()):
        block = " ".join(line.strip() for line in block.splitlines())
        if block.startswith("> "):
            out.append(f'<p class="pull-quote">{inline_md(block[2:])}</p>')
        elif block.startswith("## "):
            out.append(f"<h2>{inline_md(block[3:])}</h2>")
        else:
            out.append(f"<p>{inline_md(block)}</p>")
    return "\n        ".join(out)


def first_paragraph(text):
    for block in re.split(r"\n\s*\n", text.strip()):
        if not block.startswith((">", "#")):
            return " ".join(block.split())
    return ""


def truncate(text, limit=155):
    text = re.sub(r"\*", "", text)
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"


# --------------------------------------------------------------------------- images

class Photos:
    """Builds responsive versions of each participant photo."""

    WIDTHS = (480,)

    def __init__(self):
        self.info = {}

    def prepare(self, filename, position, og_name):
        if filename in self.info:
            return self.info[filename]
        src = IMG_SRC / filename
        stem = src.stem
        info = {"jpg": f"assets/img/{filename}", "webp": [], "size": None}
        if Image is not None:
            with Image.open(src) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                w, h = im.size
                info["size"] = (w, h)
                im.save(IMG_OUT / filename, "JPEG", quality=80, optimize=True, progressive=True)
                for width in [x for x in self.WIDTHS if x < w] + [w]:
                    name = f"{stem}-{width}.webp"
                    resized = im if width == w else im.resize((width, round(h * width / w)), Image.LANCZOS)
                    resized.save(IMG_OUT / name, "WEBP", quality=78, method=6)
                    info["webp"].append((name, width))
                self._og_image(im, position, og_name)
        self.info[filename] = info
        return info

    @staticmethod
    def _og_image(im, position, og_name):
        """1200x630 crop for link previews, keeping the face area."""
        w, h = im.size
        target = 1200 / 630
        y_pct = 0.3
        m = re.search(r"(\d+)%\s*$", position or "")
        if m:
            y_pct = int(m.group(1)) / 100
        crop_h = round(w / target)
        if crop_h <= h:
            top = round((h - crop_h) * y_pct)
            box = (0, top, w, top + crop_h)
        else:
            crop_w = round(h * target)
            left = (w - crop_w) // 2
            box = (left, 0, left + crop_w, h)
        (IMG_OUT / "og").mkdir(parents=True, exist_ok=True)
        im.crop(box).resize((1200, 630), Image.LANCZOS).save(
            IMG_OUT / "og" / og_name, "JPEG", quality=82, optimize=True, progressive=True
        )


def picture(base, info, alt, sizes, position="", eager=False):
    style = f' style="object-position:{esc(position)}"' if position else ""
    dims = f' width="{info["size"][0]}" height="{info["size"][1]}"' if info["size"] else ""
    loading = ' fetchpriority="high"' if eager else ' loading="lazy"'
    source = ""
    if info["webp"]:
        srcset = ", ".join(f"{base}assets/img/{name} {width}w" for name, width in info["webp"])
        source = f'<source type="image/webp" srcset="{srcset}" sizes="{sizes}">'
    return (
        f'<picture>{source}<img src="{base}{info["jpg"]}" alt="{esc(alt)}"{dims}'
        f'{loading} decoding="async"{style}></picture>'
    )


SIZES = {
    "card": "(max-width: 600px) 100vw, (max-width: 960px) 50vw, 300px",
    "featured": "(max-width: 900px) 100vw, 520px",
    "hero": "(max-width: 900px) 100vw, 520px",
    "story": "(max-width: 960px) 100vw, 360px",
    "quote": "240px",
}


# --------------------------------------------------------------------------- participants

def load_participants(photos, base):
    people = []
    for path in sorted((ROOT / "content" / "participants").glob("*.md")):
        meta, body = split_front_matter(path.read_text(encoding="utf-8"))
        pid = path.stem
        p = {
            "id": pid,
            "name": meta.get("name", pid.title()),
            "order": int(meta.get("order", 99)),
            "quote": meta.get("quote", ""),
            "featured": meta.get("featured", "no").lower() in ("yes", "true"),
            "summary": meta.get("summary", ""),
            "position": meta.get("photo_position", "50% 30%"),
            "body_md": body,
            "photo_file": meta.get("photo", ""),
            "status": meta.get("status", ""),
        }
        p["excerpt"] = p["summary"] or first_paragraph(body)
        p["info"] = None
        if not (p["photo_file"] and (IMG_SRC / p["photo_file"]).exists()):
            # Participants appear on the site once they have a photo.
            print(f"  Skipping {pid}: no photo yet")
            continue
        p["info"] = photos.prepare(p["photo_file"], p["position"], f"{pid}.jpg")
        people.append(p)
    people.sort(key=lambda x: (x["order"], x["name"]))
    return people


def photo_for(p, base, variant):
    eager = variant in ("hero", "story")
    return picture(base, p["info"], f"Portrait of {p['name']}", SIZES[variant], p["position"], eager)


def card(p, base):
    status = f'<span class="status-badge">{esc(p["status"])}</span>' if p["status"] else ""
    return f"""<a class="card" href="{base}stories/{p['id']}.html">
        <div class="card__photo">{photo_for(p, base, 'card')}{status}</div>
        <h3 class="card__name">{esc(p['name'])}</h3>
        <p class="card__quote">“{esc(p['quote'])}”</p>
        <span class="card__more">Read {esc(p['name'])}’s story</span>
      </a>"""


def grid_cols(n):
    """Pick 3 or 4 columns so the last row of cards isn't a lone straggler."""
    if n <= 3:
        return "3"
    fill = lambda c: (n % c or c) / c  # how full the last row is
    return "4" if fill(4) >= fill(3) else "3"


def featured(p, base):
    return f"""<article class="featured">
      <div class="featured__photo">{photo_for(p, base, 'featured')}</div>
      <div class="featured__text">
        <h3>{esc(p['name'])}</h3>
        <p class="featured__quote">“{esc(p['quote'])}”</p>
        <p>{inline_md(p['excerpt'])}</p>
        <a class="link-arrow" href="{base}stories/{p['id']}.html">Read {esc(p['name'])}’s story</a>
      </div>
    </article>"""


# --------------------------------------------------------------------------- build

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", help="URL path the site is served from, e.g. / for local preview")
    args = parser.parse_args()

    site = json.loads((ROOT / "site.json").read_text(encoding="utf-8"))
    site_url = site["url"].rstrip("/") + "/"
    base = args.base if args.base is not None else (urlparse(site_url).path or "/")
    if not base.endswith("/"):
        base += "/"

    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "assets", OUT / "assets", ignore=shutil.ignore_patterns(".DS_Store"))

    photos = Photos()
    people = load_participants(photos, base)

    donate = site["donate_url"]
    if not re.match(r"^(https?:|mailto:)", donate):
        donate = base + donate

    ctx = {
        "base": base,
        "year": datetime.date.today().year,
        "site.donate_url": esc(donate),
        **{f"site.{k}": esc(v) for k, v in site.items() if k != "donate_url"},
    }
    # Content hashes so browsers fetch new CSS/JS as soon as they change.
    for key, rel in (("css", "assets/css/styles.css"), ("js", "assets/js/main.js")):
        ctx[f"version.{key}"] = hashlib.sha1((ROOT / rel).read_bytes()).hexdigest()[:8]
    for key in ("stories", "about", "how", "hire", "contact"):
        ctx[f"current.{key}"] = ""

    for path in (ROOT / "src" / "partials").glob("*.html"):
        ctx[f"partial.{path.stem}"] = render(path.read_text(encoding="utf-8"), ctx, path.name)

    feat = next((p for p in people if p["featured"] and p["info"]), people[0])
    ctx["participants.featured"] = featured(feat, base)
    rest = [p for p in people if p is not feat]
    ctx["participants.not_featured"] = "\n      ".join(card(p, base) for p in rest)
    ctx["participants.all"] = "\n      ".join(card(p, base) for p in people)
    ctx["participants.not_featured_cols"] = grid_cols(len(rest))
    ctx["participants.all_cols"] = grid_cols(len(people))
    for p in people:
        for variant in SIZES:
            ctx[f"photo.{p['id']}.{variant}"] = photo_for(p, base, variant)

    layout = (ROOT / "src" / "layout.html").read_text(encoding="utf-8")
    default_og = f"{site_url}assets/img/og-home.jpg"
    sitemap = []

    def write_page(out_path, meta, content):
        url_path = out_path.replace("index.html", "")
        page_ctx = dict(ctx)
        if meta.get("current"):
            page_ctx[f"current.{meta['current']}"] = ' aria-current="page"'
        is_home = out_path == "index.html"
        title = meta["title"] if is_home else f"{meta['title']} | {site['short_name']}"
        page_ctx.update({
            "title": esc(title),
            "og_title": esc(meta.get("og_title", meta["title"])),
            "description": esc(meta["description"]),
            "canonical": esc(site_url + url_path),
            "og_type": meta.get("og_type", "website"),
            "og_image": esc(meta.get("og_image", default_og)),
            "og_image_alt": esc(meta.get("og_image_alt", site["name"])),
            "robots": '<meta name="robots" content="noindex">' if meta.get("noindex") else "",
        })
        page_ctx["content"] = render(content, page_ctx, out_path)
        dest = OUT / out_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(render(layout, page_ctx, "layout.html"), encoding="utf-8")
        if not meta.get("noindex"):
            sitemap.append(site_url + url_path)

    # Regular pages
    pages_dir = ROOT / "src" / "pages"
    for path in sorted(pages_dir.rglob("*.html")):
        meta, body = split_front_matter(path.read_text(encoding="utf-8"), comment=True)
        write_page(path.relative_to(pages_dir).as_posix(), meta, body)

    # Participant story pages
    story_tpl = (ROOT / "src" / "templates" / "story.html").read_text(encoding="utf-8")
    for i, p in enumerate(people):
        nxt = people[(i + 1) % len(people)]
        body = markdown_blocks(p["body_md"])
        if p["summary"]:
            body = f'<p class="story__summary">{inline_md(p["summary"])}</p>\n        <h2>Expanded story</h2>\n        {body}'
        others = [q for q in people if q is not p][:4]
        story_ctx_cols = grid_cols(len(others))
        story_ctx = {
            "p.name": esc(p["name"]),
            "p.quote": esc(p["quote"]),
            "p.photo": photo_for(p, base, "story"),
            "p.body": body,
            "p.more": "\n      ".join(card(q, base) for q in others),
            "p.more_cols": story_ctx_cols,
            "p.url": esc(f"{site_url}stories/{p['id']}.html"),
            "p.share_url": quote(f"{site_url}stories/{p['id']}.html", safe=""),
            "p.next_url": f"{base}stories/{nxt['id']}.html",
            "p.next_name": esc(nxt["name"]),
            "p.next_quote": esc(nxt["quote"]),
            "p.status": f'<p class="status-badge status-badge--inline">{esc(p["status"])}</p>' if p["status"] else "",
        }
        meta = {
            "title": f"{p['name']}’s story",
            "og_title": f"Meet {p['name']}: “{p['quote']}”",
            "description": truncate(p["excerpt"]),
            "current": "stories",
            "og_type": "article",
        }
        if p["info"] and Image is not None:
            meta["og_image"] = f"{site_url}assets/img/og/{p['id']}.jpg"
            meta["og_image_alt"] = f"Portrait of {p['name']}"
        write_page(f"stories/{p['id']}.html", meta, render(story_tpl, {**ctx, **story_ctx}, "story.html"))

    # Old story links (story.html?p=jan) forward to the new pages.
    (OUT / "story.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Redirecting…</title>"
        f"<script>var p=new URLSearchParams(location.search).get('p');"
        f"location.replace('{base}stories/'+(p?encodeURIComponent(p)+'.html':''));</script>",
        encoding="utf-8",
    )
    (OUT / "stories.html").write_text(
        f'<!doctype html><meta charset=utf-8><meta http-equiv="refresh" content="0; url={base}stories/">'
        f'<link rel="canonical" href="{site_url}stories/"><title>Redirecting…</title>',
        encoding="utf-8",
    )

    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{esc(u)}</loc></url>\n" for u in sitemap)
        + "</urlset>\n",
        encoding="utf-8",
    )
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site_url}sitemap.xml\n", encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built {len(sitemap)} pages into {OUT.relative_to(ROOT)}/ (base {base})"
          + ("" if Image else " — Pillow not installed, images copied without resizing"))


if __name__ == "__main__":
    main()
