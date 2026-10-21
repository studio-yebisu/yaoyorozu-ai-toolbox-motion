"""Build a dependency-free Japanese resource guide from its curated JSON."""
from __future__ import annotations

import collections
import datetime as dt
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO_URL = "https://github.com/studio-yebisu/awesome-claude-motion-design-ja"
SITE_URL = "https://studio-yebisu.github.io/awesome-claude-motion-design-ja/"
esc = html.escape
SOCIAL_IMAGE = SITE_URL + "assets/og-card-motion-v4.png"
SOCIAL_ALT = "モーショングラフィック制作ガイド。動く作例と6カテゴリの制作スタック。"


def social_metadata(path, title, description):
    url = SITE_URL + ("" if path == "index.html" else path)
    values = [
        ("property", "og:type", "website"),
        ("property", "og:locale", "ja_JP"),
        ("name", "author", "Studio Yebisu"),
        ("property", "og:site_name", "Claude モーション制作ガイド / Studio Yebisu"),
        ("property", "og:title", title),
        ("property", "og:description", description),
        ("property", "og:url", url),
        ("property", "og:image", SOCIAL_IMAGE),
        ("property", "og:image:secure_url", SOCIAL_IMAGE),
        ("property", "og:image:type", "image/png"),
        ("property", "og:image:width", "1200"),
        ("property", "og:image:height", "630"),
        ("property", "og:image:alt", SOCIAL_ALT),
        ("name", "twitter:card", "summary_large_image"),
        ("name", "twitter:site", "@studio_yebisu"),
        ("name", "twitter:title", title),
        ("name", "twitter:description", description),
        ("name", "twitter:image", SOCIAL_IMAGE),
        ("name", "twitter:image:alt", SOCIAL_ALT),
    ]
    return f'<link rel="canonical" href="{url}">\n' + "\n".join(
        f'<meta {kind}="{key}" content="{esc(value, quote=True)}">'
        for kind, key, value in values
    )


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def preview_markup(preview, project):
    if not preview:
        return '<p class="preview-pending">作例の制作中</p>'
    v=preview
    title=f"{project['name']}｜{v['title']}"
    description=f"{project['summary']} このデモで使った機能：{v['description']} 実行範囲：{v['scope']}"
    source=f"{REPO_URL}/blob/main/{v['source_file']}"
    native=f'<a href="{v["native_output"]["path"]}">{esc(v["native_output"].get("label", "処理した元ファイル ↗"))}</a>' if v.get('native_output') else ''
    interactive=v.get('interactive_page')
    interactive_attr=f' data-interactive-page="{esc(interactive["path"],quote=True)}"' if interactive else ''
    live_button=f'<button class="preview-live-opener" type="button" data-open-interactive>{esc(interactive.get("label","サイトを操作"))} ↗</button>' if interactive else ''
    return f'''<figure class="specimen"><div class="specimen-screen"><video data-preview data-src="{v['files']['mp4']['path']}" poster="{v['files']['webp']['path']}" preload="none" muted loop playsinline aria-label="{esc(title,quote=True)}"></video><button class="preview-opener" type="button" data-open-preview="{v['files']['mp4']['path']}"{interactive_attr} data-title="{esc(title,quote=True)}" data-description="{esc(description,quote=True)}" data-gif="{v['files']['gif']['path']}" data-source="{source}" aria-label="{esc(title,quote=True)}を拡大再生"><span>拡大して再生 ↗</span></button></div><figcaption><span class="preview-role">{esc(v['role'])}</span><strong>デモ：{esc(v['title'])}</strong><p>{esc(v['description'])}</p><p class="preview-scope"><b>実行範囲</b> {esc(v['scope'])}</p><div class="preview-links">{live_button}<a href="{v['files']['gif']['path']}">GIF ↗</a><a href="{source}" target="_blank" rel="noopener noreferrer">制作コード ↗</a>{native}<span>{round(v['duration'],1):g}秒 / {v['version']}</span></div></figcaption></figure>'''


def project_card(project, categories):
    p = project
    checked = dt.datetime.fromisoformat(p["verified_at"]).astimezone(dt.timezone(dt.timedelta(hours=9)))
    checked_label = f"{checked.year}年{checked.month}月{checked.day}日"
    license_url = p["license_url"]
    tags = "".join(f'<span>{esc(tag)}</span>' for tag in p["tags"])
    search = " ".join(str(p[k]) for k in ("name", "repository", "summary", "use_case", "opus_relation")) + " " + " ".join(p["tags"])
    search += " " + " ".join(p.get("preview", {}).get(k, "") for k in ("title", "description", "role", "scope"))
    preview = preview_markup(p.get("preview"), p)
    command = f'<div class="install"><code>{esc(p["install"])}</code><button type="button" data-copy-command aria-label="{esc(p["name"])}の導入コマンドをコピー">コピー</button></div>' if p.get("install") else ""
    return f'''<article class="project-card" id="{esc(p['id'])}" data-project data-category="{esc(p['category'])}" data-license="{esc(p['license_class'])}" data-search="{esc(search.lower(), quote=True)}" style="--accent:{categories[p['category']]['color']}">
      <div class="project-top"><span class="project-kind">{esc(p['kind'])}</span></div>
      <h2><a href="{p['url']}" target="_blank" rel="noopener noreferrer">{esc(p['name'])}<span aria-hidden="true"> ↗</span></a></h2>
      <p class="repo-name">{esc(p['repository'])}</p><p class="project-summary">{esc(p['summary'])}</p>
      {preview}
      <p class="use-case"><b>使いどころ</b>{esc(p['use_case'])}</p><div class="tags">{tags}</div>
      <div class="project-meta"><a href="{license_url}" target="_blank" rel="noopener noreferrer">{esc(p['license_label'])}</a><span title="GitHubのstar数（{checked_label}時点）">★ {p['stars']:,}</span></div>
      <details><summary>使い方・導入のヒント</summary><div class="detail-body"><p><b>必要な環境</b> {esc(p['requirements'])}</p><p><b>Claudeと使うなら</b> {esc(p['opus_relation'])}</p><p><b>導入のポイント</b> {esc(p['caution'])}</p>{command}<a href="{p['readme_url']}" target="_blank" rel="noopener noreferrer">プロジェクトのREADME ↗</a> <span class="commit-label">{p['commit_sha'][:7]}</span></div></details>
    </article>'''


def build():
    curation = read_json("data/curation.json")
    verification = read_json("data/verification.json")
    production = read_json("data/preview-production.json")["previews"]
    assert not verification["errors"], verification["errors"]
    sources = {p["repository"]: p for p in verification["sources"]}
    categories = {c["id"]: c for c in curation["categories"]}
    assert len({p["id"] for p in curation["projects"]}) == len(curation["projects"])
    projects = []
    overrides = {
        "greensock/GSAP": "https://gsap.com/community/standard-license/",
        "ffmpegwasm/ffmpeg.wasm": "https://ffmpegwasm.netlify.app/docs/faq/#what-is-the-license-of-ffmpegwasm",
    }
    for p in curation["projects"]:
        metadata = sources[p["repository"]]
        assert p["category"] in categories
        assert not metadata["archived"], p["repository"]
        item = {**p, **metadata}
        license_path = next((path for path in metadata["license_paths"] if path.lower().split(".")[0] in {"license","licence"}), (metadata["license_paths"] or [None])[0])
        item["license_url"] = overrides.get(p["repository"]) or (
            f"{metadata['url']}/blob/{metadata['commit_sha']}/{license_path}" if license_path else metadata["readme_url"])
        item["preview"] = production.get(p["id"])
        projects.append(item)
    counts = collections.Counter(p["category"] for p in projects)
    total = len(projects)
    curation["projects"] = projects
    (ROOT / "data/projects.json").write_text(json.dumps(curation, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    representatives={"skills":"remotion-skills","render":"hyperframes","ui":"gsap","three":"three","vector":"pixi","data":"deck"}
    by_id={p["id"]:p for p in projects}
    cards = []
    for category in categories.values():
        kind = category["id"]
        representative=by_id[representatives[kind]]
        cards.append(f'''<article class="category-card" style="--accent:{category['color']}"><div class="category-top"><span>{category['label']}</span><span>{counts[kind]}件</span></div><p class="category-demo-tool"><a href="projects.html#{representative['id']}">{esc(representative['name'])}の機能デモ</a></p>{preview_markup(representative.get("preview"),representative)}<div class="category-body"><h3><a href="projects.html?category={kind}">{category['name']}</a></h3><p>{category['description']}</p><p class="category-examples">{category['examples']}</p><a class="category-action" href="projects.html?category={kind}">一覧を見る<span aria-hidden="true">→</span></a></div></article>''')
    filters = '<button class="filter-chip active" type="button" data-category-filter="all" aria-pressed="true">すべて <span>'+str(total)+'</span></button>'
    filters += "".join(f'<button class="filter-chip" type="button" data-category-filter="{c["id"]}" aria-pressed="false">{c["short"]} <span>{counts[c["id"]]}</span></button>' for c in categories.values())
    creator = curation["creator"]
    replacements = {"{{TOTAL}}":str(total), "{{PREVIEW_TOTAL}}":str(len(production)), "{{CATEGORY_CARDS}}":"\n".join(cards), "{{FILTERS}}":filters, "{{PROJECT_CARDS}}":"\n".join(project_card(p,categories) for p in projects), "{{SITE_URL}}":SITE_URL, "{{REPO_URL}}":REPO_URL}
    social_pages = {'index.html': ('Claude モーショングラフィック制作ガイド｜Studio Yebisu', '{{TOTAL}}本の作例から選ぶモーショングラフィック制作ガイド。GIF・コード付きでツールと手法を比較。'), 'projects.html': ('スキル・ツールとデモ｜Claude モーショングラフィック制作ガイド', '{{TOTAL}}件のスキル・ツール・資料を用途から検索。元の役割と、機能デモで使った部分を紹介。'), 'guide.html': ('制作の始め方｜Claude モーショングラフィック制作ガイド', 'モーショングラフィック制作の始め方。HTML動画、React動画、Web UI、解説動画の4ルートを解説。')}
    for name in ("index.html", "projects.html", "guide.html"):
        text = (ROOT / "templates" / name).read_text(encoding="utf-8")
        text = text.replace("{{SOCIAL_META}}", social_metadata(name, *social_pages[name]))
        for key,value in replacements.items():
            text = text.replace(key,value)
        assert "{{" not in text, name
        (ROOT / name).write_text(text,encoding="utf-8")
    table = []
    for category in categories.values():
        table += [f"\n### {category['name']}（{counts[category['id']]}件）\n", "| スキル・ツール | 使いどころ | ライセンス |\n| --- | --- | --- |"]
        for p in projects:
            if p["category"] == category["id"]:
                table.append(f"| [{p['name']}]({p['url']}) | {p['use_case']} | [{p['license_label']}]({p['license_url']}) |")
    readme = (ROOT / "templates/README.md").read_text(encoding="utf-8")
    for key, value in {**replacements, "{{README_TABLE}}": "\n".join(table)}.items():
        readme = readme.replace(key, value)
    assert "{{" not in readme
    (ROOT / "README.md").write_text(readme,encoding="utf-8")
    # Keep the requested Markdown mapping aligned with the same data as the cards.
    skill_inputs = read_json("data/skill-inputs.json")
    correspondence=[]
    def md(value):
        return value.replace("|", "&#124;").replace("\n", " ")
    for category in categories.values():
        correspondence += [f"## {category['name']}\n", "| 掲載項目・一次資料 | 元の役割 | デモ・制作コード | 実際に使った機能 | 実行範囲 |", "| --- | --- | --- | --- | --- |"]
        for p in projects:
            if p["category"] != category["id"]:
                continue
            v=p["preview"]
            references=[f"[README]({p['readme_url']})"]
            references += [f"[スキル原文]({s['source_url']})" for s in skill_inputs if s["preview_id"]==p["id"]]
            name=f"<a id=\"{p['id']}\"></a>**{md(p['name'])}**<br>{md(p['kind'])}<br>"+" · ".join(references)
            demo=f"[{md(v['title'])}](../{v['files']['mp4']['path']})<br>[制作コード](../{v['source_file']})<br>{md(v['role'])}"
            correspondence.append(f"| {name} | {md(p['summary'])} | {demo} | {md(v['description'])} | {md(v['scope'])} |")
        correspondence.append("")
    report=(ROOT/"templates/demo-correspondence.md").read_text(encoding="utf-8")
    for key,value in {**replacements,"{{DEMO_CORRESPONDENCE}}":"\n".join(correspondence)}.items():
        report=report.replace(key,value)
    assert "{{" not in report
    (ROOT/"docs/ツールと作例の対応.md").write_text(report,encoding="utf-8")
    print(f"Built {total} entries across {len(categories)} categories for {creator['name']}.")


if __name__ == "__main__":
    build()
