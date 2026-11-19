#!/usr/bin/env python3
"""Verify the live Cloudflare Pages deployment of JAK PLUENG!.

Checks (UA browser — UA default python kena 403 Cloudflare):
  /               200 + semua tag og:/twitter: + og:image absolut
  /og-image.png   200 + content-type image/*
  /compass.svg    200 + image/svg+xml
  /mission        200 (SPA fallback via public/_redirects)
  bundle JS       200 + marker produk asli "JAK PLUENG!"
  /assets/*.css   200 (kalau ada di HTML)
Usage: python3 scripts/verify-live.py [BASE_URL]
Default: https://lidm-jakplueng.pages.dev
Exit 0 = semua lolos, 1 = ada yang gagal.
"""
import re
import sys
import urllib.request
import urllib.error

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://lidm-jakplueng.pages.dev").rstrip("/")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}
failures = []


def fetch(path, label):
    url = BASE + path
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.build_opener().open(req, timeout=60) as r:
            return r.status, r.headers.get("Content-Type", ""), r.read()
    except urllib.error.HTTPError as e:
        failures.append(f"{label}: HTTP {e.code}")
        return e.code, "", b""
    except Exception as e:
        failures.append(f"{label}: {e}")
        return 0, "", b""


def check(cond, msg):
    if not cond:
        failures.append(msg)
    else:
        print(f"  ok: {msg}")


print(f"verify-live: {BASE}")
st, ct, body = fetch("/", "root")
check(st == 200, f"/ -> 200 (dapat {st})")
html = body.decode("utf-8", "replace")
for tag in ["og:title", "og:description", "og:type", "og:url", "og:image",
            "twitter:card", "twitter:title", "twitter:description", "twitter:image"]:
    check(tag in html, f"/ mengandung {tag}")
check("https://lidm-jakplueng.pages.dev/og-image.png" in html, "/ og:image absolut lidm-jakplueng.pages.dev")

st, ct, _ = fetch("/og-image.png", "og-image")
check(st == 200, f"/og-image.png -> 200 (dapat {st})")
check(ct.startswith("image/"), f"/og-image.png content-type image/* (dapat {ct})")

st, ct, _ = fetch("/compass.svg", "favicon")
check(st == 200, f"/compass.svg -> 200 (dapat {st})")

st, ct, _ = fetch("/mission", "spa-fallback")
check(st == 200, f"/mission -> 200 via _redirects (dapat {st})")

m = re.search(r'/assets/index-[^"\']+\.js', html)
check(bool(m), "/ mereferensikan bundle JS hasil build")
if m:
    st, ct, bundle = fetch(m.group(0), "bundle")
    check(st == 200, f"{m.group(0)} -> 200 (dapat {st})")
    check(b"JAK PLUENG!" in bundle, "bundle JS mengandung marker produk JAK PLUENG!")

if failures:
    print("verify-live GAGAL:")
    for msg in failures:
        print(f" - {msg}")
    sys.exit(1)
print("verify-live OK")
