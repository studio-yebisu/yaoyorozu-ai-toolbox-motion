"""Fetch the pinned Anatomy drawing kit outside the published source tree."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
COMMIT = "e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f"
UPSTREAM = "wheresryan22/anatomy"
DESTINATION = ROOT / ".qa/anatomy"


def prepare():
    receipts = {}
    for name in ("kit/iso-kit.mjs", "LICENSE", "scripts/line-ends.mjs"):
        url = f"https://raw.githubusercontent.com/{UPSTREAM}/{COMMIT}/{name}"
        with urlopen(Request(url, headers={"User-Agent": "motion-guide-example"}), timeout=30) as response:
            body = response.read()
        target = DESTINATION / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(body)
        receipts[name] = {"url": url, "sha256": hashlib.sha256(body).hexdigest()}
    (DESTINATION / "UPSTREAM.json").write_text(
        json.dumps({"repository": UPSTREAM, "commit": COMMIT, "files": receipts}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Prepared Anatomy {COMMIT[:7]}: {DESTINATION}")


if __name__ == "__main__":
    prepare()
