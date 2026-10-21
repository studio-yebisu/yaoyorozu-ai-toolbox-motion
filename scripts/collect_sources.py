"""Collect public primary-source snapshots without installing linked projects."""
from __future__ import annotations

import argparse
import base64
import concurrent.futures
import datetime as dt
import json
import pathlib
import subprocess
from urllib.parse import quote

REPOSITORIES = [
    "mrdoob/three.js", "motiondivision/motion", "fabricjs/fabric.js",
    "ffmpegwasm/ffmpeg.wasm", "visgl/deck.gl", "catdad/canvas-confetti",
    "pmndrs/drei", "shuding/cobe", "greggman/twgl.js", "rive-app/rive-runtime",
    "heygen-com/hyperframes", "remotion-dev/remotion", "motion-canvas/motion-canvas",
    "microsoft/playwright", "FFmpeg/FFmpeg", "Vanilagy/mediabunny",
    "greensock/GSAP", "juliangarnier/anime", "airbnb/lottie-web",
    "pmndrs/react-three-fiber", "pixijs/pixijs", "d3/d3", "ManimCommunity/manim",
    "remotion-dev/skills", "emilkowalski/skills", "charlie947/motion-graphics-skills",
    "whaleyxbt/claude-motion", "howseen-ai/claude-motion-design",
    "abhimahamkali/claude-motion-skill", "iart-ai/motion-skills",
    "apimodels/claude-opus-5-5-video-prompts",
    "code-video-model/CodeVideoModel",
    "wheresryan22/anatomy",
    "mermaid-js/mermaid", "chartjs/Chart.js", "apache/echarts",
    "xyflow/xyflow", "plotly/plotly.js", "plouc/nivo",
    "antvis/G6", "cytoscape/cytoscape.js", "vasturiano/3d-force-graph",
]


def gh(endpoint: str, raw: bool = False):
    args = ["gh", "api", endpoint]
    if raw:
        args += ["-H", "Accept: application/vnd.github.raw+json"]
    result = subprocess.run(args, check=True, capture_output=True, encoding="utf-8")
    return result.stdout if raw else json.loads(result.stdout)


def collect(name: str, evidence: pathlib.Path):
    metadata = gh(f"repos/{name}")
    canonical = metadata["full_name"]
    commit = gh(f"repos/{canonical}/commits/{metadata['default_branch']}")["sha"]
    folder = evidence / canonical.replace("/", "__")
    folder.mkdir(parents=True, exist_ok=True)
    readme_info = gh(f"repos/{canonical}/readme?ref={commit}")
    readme = base64.b64decode(readme_info["content"]).decode("utf-8", errors="replace")
    (folder / "README.md").write_text(readme, encoding="utf-8")
    root = gh(f"repos/{canonical}/contents/?ref={commit}")
    licenses = [item for item in root if item["type"] == "file" and
                item["name"].lower().split(".")[0] in {"license", "licence", "copying"}]
    license_paths = []
    for item in licenses:
        content = gh(f"repos/{canonical}/contents/{item['path']}?ref={commit}")
        body = base64.b64decode(content["content"]).decode("utf-8", errors="replace")
        (folder / item["name"]).write_text(body, encoding="utf-8")
        license_paths.append(item["path"])
    snapshot = {
        "requested_repository": name,
        "repository": canonical,
        "url": metadata["html_url"],
        "homepage": metadata["homepage"],
        "stars": metadata["stargazers_count"],
        "archived": metadata["archived"],
        "pushed_at": metadata["pushed_at"],
        "default_branch": metadata["default_branch"],
        "commit_sha": commit,
        "github_license": (metadata.get("license") or {}).get("spdx_id", "UNSPECIFIED"),
        "license_paths": license_paths,
        "readme_path": readme_info["path"],
        "readme_url": f"https://github.com/{canonical}/blob/{commit}/{quote(readme_info['path'], safe='/')}",
        "verified_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "verification": "Public GitHub API, README and root license files; not a runtime test",
    }
    (folder / "metadata.json").write_text(json.dumps(snapshot, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return snapshot


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence-dir", type=pathlib.Path, required=True,
                        help="Store copyrighted upstream snapshots outside the public site.")
    parser.add_argument("--output", type=pathlib.Path, required=True)
    parser.add_argument("--repair-readme-paths", action="store_true",
                        help="Resolve original README case/filename for an existing snapshot.")
    args = parser.parse_args()
    if args.repair_readme_paths:
        payload = json.loads(args.output.read_text(encoding="utf-8"))
        def repair(record):
            info = gh(f"repos/{record['repository']}/readme?ref={record['commit_sha']}")
            record["readme_path"] = info["path"]
            record["readme_url"] = f"{record['url']}/blob/{record['commit_sha']}/{quote(info['path'], safe='/')}"
            snapshot = args.evidence_dir / record["repository"].replace("/", "__") / "metadata.json"
            snapshot.write_text(json.dumps(record, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
            return record
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            payload["sources"] = list(executor.map(repair, payload["sources"]))
        args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
        unusual = [p["repository"]+":"+p["readme_path"] for p in payload["sources"] if p["readme_path"] != "README.md"]
        print(f"Resolved {len(payload['sources'])} README paths. Nonstandard: {', '.join(unusual) or 'none'}")
        return
    records, errors = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(collect, name, args.evidence_dir): name for name in REPOSITORIES}
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                record = future.result()
                records.append(record)
                print(f"OK {record['repository']} | {record['github_license']} | stars {record['stars']}", flush=True)
            except Exception as error:
                errors.append({"repository": name, "error": str(error)})
                print(f"FAILED {name}: {error}", flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    checked_on = dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).date().isoformat()
    payload = {"checked_on": checked_on, "timezone": "Asia/Tokyo",
               "sources": sorted(records, key=lambda item: item["repository"].lower()), "errors": errors}
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
