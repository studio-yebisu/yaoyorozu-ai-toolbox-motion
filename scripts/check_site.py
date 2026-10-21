"""Check catalog records, links and share cards in the generated site."""
from __future__ import annotations
import json
import pathlib
import re
import subprocess
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT = pathlib.Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.lang = path, [], [], None
        self.meta, self.canonical = {}, []
        self.h1 = 0
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html": self.lang = attrs.get("lang")
        if tag == "h1": self.h1 += 1
        if tag == "meta" and (attrs.get("property") or attrs.get("name")):
            key = attrs.get("property") or attrs["name"]
            assert key not in self.meta, f"Duplicate meta tag: {self.path.name} -> {key}"
            self.meta[key] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs["href"])
        if "id" in attrs: self.ids.append(attrs["id"])
        for attr in ("href", "src", "poster", "data-src", "data-open-preview", "data-gif", "data-interactive-page"):
            if attrs.get(attr): self.links.append(attrs[attr])
        if tag == "img":
            assert "alt" in attrs, f"Image missing alt: {self.path.name}"


def main():
    data = json.loads((ROOT/"data/projects.json").read_text(encoding="utf-8"))
    records = data["projects"]
    verification = json.loads((ROOT/"data/verification.json").read_text(encoding="utf-8"))
    assert not verification["errors"]
    curation = json.loads((ROOT/"data/curation.json").read_text(encoding="utf-8"))
    assert len(records) == len(curation["projects"])
    assert {p["id"] for p in records} == {p["id"] for p in curation["projects"]}
    assert len(set(p["repository"] for p in records)) == len(records)
    assert len(set(p["id"] for p in records)) == len(records)
    assert len(data["categories"]) == 6
    assert {p["repository"] for p in records} == {p["repository"] for p in verification["sources"]}
    for p in records:
        assert re.fullmatch(r"[a-f0-9]{40}",p["commit_sha"])
        assert p["readme_path"]
        assert p["commit_sha"] in p["readme_url"]
        assert isinstance(p["stars"],int) and p["stars"] >= 0
        assert p["license_url"].startswith("https://")
        for field in ("summary","use_case","requirements","caution","opus_relation","license_label"):
            assert p[field], (p["id"],field)
    pages = {path.resolve():Page(path) for path in (ROOT/"index.html",ROOT/"projects.html",ROOT/"guide.html",ROOT/"examples/seek-demo/index.html",ROOT/"examples/machine-skill/index.html")}
    checked = 0
    for path, page in pages.items():
        assert page.lang == "ja" and page.h1 == 1, path
        assert len(page.ids) == len(set(page.ids)), f"Duplicate HTML id: {path}"
        assert "{{" not in path.read_text(encoding="utf-8"), path
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc: continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(ROOT), (path.name,link)
            if target.is_dir(): target = target / "index.html"
            assert target.is_file(), f"Missing local link: {path.name} -> {link}"
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, f"Missing anchor: {link}"
            checked += 1
    for p in records:
        assert p["id"] in pages[(ROOT/"projects.html").resolve()].ids
    for path in [ROOT/"README.md",ROOT/"CONTRIBUTING.md",*(ROOT/"docs").glob("*.md")]:
        assert path.exists(),path
        for link in re.findall(r"\]\(([^)]+)\)",path.read_text(encoding="utf-8")):
            url = urlsplit(link)
            if url.scheme or url.netloc: continue
            target = (path.parent/unquote(url.path)).resolve() if url.path else path
            assert target.exists(),f"Missing Markdown link: {path.name} -> {link}"
    for path in [ROOT/"assets/site.js",ROOT/"assets/previews.js",ROOT/"examples/seek-demo/scene.js",ROOT/"examples/motion-reel/scene.js"]:
        subprocess.run(["node","--check",str(path)],check=True,capture_output=True,text=True)
    from PIL import Image
    for filename in ("og-card.png", "og-card-motion-v4.png"):
        with Image.open(ROOT/"assets"/filename) as image:
            assert image.size == (1200,630)
            image.verify()
    site = "https://studio-yebisu.github.io/awesome-claude-motion-design-ja/"
    for filename in ("index.html", "projects.html", "guide.html"):
        page = pages[(ROOT/filename).resolve()]
        url = site + ("" if filename == "index.html" else filename)
        assert page.canonical == [url], (filename, page.canonical)
        for key in ("og:title", "og:description", "og:type", "og:locale", "og:site_name", "og:image:alt", "twitter:image:alt"):
            assert page.meta.get(key), (filename,key)
        assert page.meta["og:url"] == url
        assert page.meta["og:image"] == page.meta["twitter:image"] == site + "assets/og-card-motion-v4.png"
        assert page.meta["og:image:secure_url"] == page.meta["og:image"]
        assert page.meta["og:image:type"] == "image/png"
        assert (page.meta["og:image:width"],page.meta["og:image:height"]) == ("1200","630")
        assert page.meta["twitter:card"] == "summary_large_image"
        assert page.meta["twitter:title"] == page.meta["og:title"]
        assert page.meta["twitter:description"] == page.meta["og:description"]
    print(f"PASS: {len(records)} unique repositories, 6 categories.")
    print(f"PASS: {checked} local HTML links, HTML anchors, Markdown links, 4 JavaScript syntax checks, OG PNG.")
    print("PASS: canonical + Open Graph + large-image Twitter cards on all 3 public pages.")
    print("License classes:",dict(Counter(p["license_class"] for p in records)))


if __name__ == "__main__":
    main()
