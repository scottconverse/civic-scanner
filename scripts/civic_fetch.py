#!/usr/bin/env python3
"""civic_fetch: pull public meeting documents and recording captions.

This is the fetch layer the civic-scanner agent used by hand in the
2026-10-04 Longmont run, written down as one repeatable tool.

What it does:
  1. Lists meetings from a PrimeGov public portal (JSON API) for a date window.
  2. Downloads each published agenda / packet / minutes PDF and converts it to
     text with pdftotext, whole file and one file per page.
  3. For each meeting with a YouTube link, downloads the auto-generated
     English captions with yt-dlp (no video) and converts them to a
     timestamped transcript in fixed time blocks.
  4. Writes manifest.json: every request, URL, status, fetch time, SHA-256,
     page count, and every failure. Nothing is silently dropped.

What it does NOT do:
  - It does not read, judge, or summarize anything. The reporter does that.
  - It does not file records requests or pay fees.
  - It does not go around a site that blocks access. A block is logged as a gap.

Requirements: Python 3.9+, `pdftotext`, `pdfinfo` and `pdftoppm` (poppler-utils),
`yt-dlp` (pip install yt-dlp) for captions, and optionally `tesseract` for --ocr.
No third-party Python packages are imported.

YouTube note: YouTube often blocks cloud-server IP addresses with a "confirm
you're not a bot" check. It worked from the cloud at 2026-10-04 ~21:30 UTC and
was blocked at ~23:19 UTC the same day. The tool reports this as
`blocked_bot_check`. A home computer, or --cookies-from-browser, usually works.

Examples:
  python civic_fetch.py meetings --portal longmont --from 2026-09-27 --to 2026-10-04
  python civic_fetch.py run --portal longmont --from 2026-09-27 --to 2026-10-04 \
      --by-publish-date --out ./run-2026-10-04
  python civic_fetch.py doc --portal longmont --id 18842 --out ./docs
  python civic_fetch.py captions --video https://youtube.com/watch?v=fWMTQj830Ho --out ./tx
  python civic_fetch.py vtt2txt --input meeting.en.vtt --block-seconds 45

Citation note: download links of the form /Public/CompiledDocument/{id} are
working links, not durable citations. Cite the portal, meeting, document
title, and page number. The manifest keeps both.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

VERSION = "1.0.0"
USER_AGENT = "civic-scanner-fetch/1.0 (+https://github.com/scottconverse/civic-scanner)"
PDF_OUTPUT = 1   # compileOutputType for PDF documents
HTML_OUTPUT = 3  # compileOutputType for HTML agendas (often not downloadable)


# ---------------------------------------------------------------- utilities

def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


class Log:
    """Collects every request and outcome for the manifest."""

    def __init__(self) -> None:
        self.requests: list[dict] = []
        self.failures: list[dict] = []

    def req(self, url: str, status, note: str = "", **extra) -> None:
        self.requests.append({"url": url, "status": status, "fetched_at": now_iso(), "note": note, **extra})

    def fail(self, what: str, url: str, reason: str) -> None:
        self.failures.append({"item": what, "url": url, "reason": reason, "at": now_iso()})
        print(f"  ! {what}: {reason}", file=sys.stderr)


def http_get(url: str, log: Log, timeout: int = 180, retries: int = 2) -> tuple[int, str, bytes]:
    """GET with retries. Returns (status, content_type, body). Honors HTTPS_PROXY env."""
    last_err = ""
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = r.read()
                ctype = r.headers.get("Content-Type", "")
                log.req(url, r.status, bytes=len(body), content_type=ctype)
                return r.status, ctype, body
        except urllib.error.HTTPError as e:
            log.req(url, e.code, note="http error")
            if e.code in (403, 404, 410):
                return e.code, "", b""
            last_err = f"HTTP {e.code}"
            if e.code == 429:
                wait = int(e.headers.get("Retry-After", "10") or 10)
                time.sleep(min(wait, 60))
        except Exception as e:  # network, TLS, timeout
            last_err = f"{type(e).__name__}: {e}"
            log.req(url, "error", note=last_err)
        time.sleep(2 * (attempt + 1))
    return -1, "", last_err.encode()


# ---------------------------------------------------------------- PrimeGov

class PrimeGov:
    """Read-only client for a PrimeGov public portal (e.g. longmont.primegov.com)."""

    def __init__(self, portal: str, log: Log) -> None:
        self.base = f"https://{portal}.primegov.com" if "." not in portal else f"https://{portal}"
        self.log = log

    @property
    def portal_page(self) -> str:
        return f"{self.base}/public/portal"

    def _json(self, path: str):
        url = f"{self.base}{path}"
        status, _, body = http_get(url, self.log)
        if status != 200:
            self.log.fail("meeting list", url, f"status {status} {body[:120]!r}")
            return []
        try:
            return json.loads(body)
        except json.JSONDecodeError as e:
            self.log.fail("meeting list", url, f"bad JSON: {e}")
            return []

    def meetings(self, start: dt.date, end: dt.date, by_publish_date: bool) -> list[dict]:
        seen: dict[int, dict] = {}
        for year in sorted({start.year, end.year}):
            for m in self._json(f"/api/v2/PublicPortal/ListArchivedMeetings?year={year}"):
                seen[m["id"]] = m
        # Upcoming meetings are always listed: their packets may already be posted.
        for m in self._json("/api/v2/PublicPortal/ListUpcomingMeetings"):
            seen[m["id"]] = m
        out = []
        for m in seen.values():
            day = dt.date.fromisoformat(m["dateTime"][:10])
            in_window = start <= day <= end
            # With by_publish_date, meetings outside the window whose documents were
            # PUBLISHED in the window also count: e.g. a packet posted Oct 2 for an
            # Oct 6 meeting carries prior minutes; late minutes for an old meeting.
            published_in_window = any(
                d.get("publishDate") and start <= dt.date.fromisoformat(d["publishDate"][:10]) <= end
                for d in m.get("documentList", [])
            )
            if in_window or (by_publish_date and published_in_window):
                m["_in_window"] = in_window
                m["_published_in_window"] = published_in_window
                out.append(m)
        return sorted(out, key=lambda m: m["dateTime"])

    def doc_url(self, doc_id: int, output_type: int = PDF_OUTPUT) -> str:
        # The path form works. The ?meetingTemplateId= query form returned
        # "Document Not Found" on longmont.primegov.com (2026-10-04).
        return f"{self.base}/Public/CompiledDocument/{doc_id}?compileOutputType={output_type}"


def is_not_found_html(body: bytes) -> bool:
    head = body[:2000].lower()
    return b"<html" in head and b"document not found" in head


# ---------------------------------------------------------------- PDFs

def pdf_to_text(pdf: Path, outdir: Path, log: Log, ocr: bool = False) -> dict:
    """Whole-file text plus one text file per page (for page-accurate citation)."""
    info = {"pages": None, "text": None, "page_dir": None}
    if not shutil.which("pdftotext"):
        log.fail("pdftotext", str(pdf), "pdftotext not installed (poppler-utils)")
        return info
    try:
        meta = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True, timeout=60).stdout
        m = re.search(r"^Pages:\s+(\d+)", meta, re.M)
        pages = int(m.group(1)) if m else None
    except Exception:
        pages = None
    whole = outdir / (pdf.stem + ".txt")
    subprocess.run(["pdftotext", "-layout", str(pdf), str(whole)], timeout=600)
    info["text"] = str(whole)
    info["pages"] = pages
    if pages:
        pdir = outdir / (pdf.stem + "_pages")
        pdir.mkdir(exist_ok=True)
        for p in range(1, pages + 1):
            subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), str(pdf),
                            str(pdir / f"p{p:04d}.txt")], timeout=120)
        info["page_dir"] = str(pdir)
    if whole.exists() and whole.stat().st_size < 50 * max(pages or 1, 1) and (pages or 0) > 0:
        if ocr and shutil.which("tesseract") and shutil.which("pdftoppm"):
            info.update(ocr_pdf(pdf, outdir, pages, log))
        else:
            log.fail("text layer", str(pdf),
                     "little or no text; may be scanned; rerun with --ocr (needs tesseract) or read on screen")
    return info


def ocr_pdf(pdf: Path, outdir: Path, pages: int, log: Log) -> dict:
    """OCR a scanned PDF page by page. OCR text is a finding aid: check numbers and names."""
    pdir = outdir / (pdf.stem + "_pages")
    pdir.mkdir(exist_ok=True)
    texts = []
    for p in range(1, pages + 1):
        base = outdir / f"{pdf.stem}_ocr_p{p:04d}"
        subprocess.run(["pdftoppm", "-r", "300", "-gray", "-png", "-f", str(p), "-l", str(p),
                        "-singlefile", str(pdf), str(base)], timeout=300)
        png = Path(str(base) + ".png")
        if not png.exists():
            log.fail("ocr", str(pdf), f"could not render page {p}")
            continue
        r = subprocess.run(["tesseract", str(png), "-", "--psm", "6"], capture_output=True, text=True, timeout=300)
        (pdir / f"p{p:04d}.txt").write_text(r.stdout, encoding="utf-8")
        texts.append(f"\f{r.stdout}" if p > 1 else r.stdout)
        png.unlink(missing_ok=True)
    whole = outdir / (pdf.stem + ".txt")
    whole.write_text("".join(texts), encoding="utf-8")
    return {"text": str(whole), "page_dir": str(pdir), "ocr": True,
            "ocr_warning": "Text came from OCR. Verify every number, name and quote against the PDF."}


def fetch_doc(pg: PrimeGov, doc: dict, meeting: dict | None, outdir: Path, log: Log, ocr: bool = False) -> dict:
    doc_id = doc["id"]
    out_type = doc.get("compileOutputType", PDF_OUTPUT)
    url = pg.doc_url(doc_id, out_type)
    rec = {
        "doc_id": doc_id,
        "template": doc.get("templateName"),
        "output_type": out_type,
        "publish_date": doc.get("publishDate"),
        "download_url": url,
        "cite_as": None,
        "status": None,
    }
    if meeting:
        rec["cite_as"] = (f"{pg.portal_page} :: {meeting.get('title')} :: "
                          f"{meeting.get('date')} :: {doc.get('templateName')} (doc {doc_id})")
    status, ctype, body = http_get(url, log)
    if status != 200 or not body:
        rec["status"] = f"failed ({status})"
        log.fail(f"doc {doc_id}", url, f"status {status}")
        return rec
    if is_not_found_html(body):
        rec["status"] = "not found (portal returned 'Document Not Found' page)"
        log.fail(f"doc {doc_id}", url, "portal returned 'Document Not Found'")
        return rec
    is_pdf = body[:5] == b"%PDF-"
    ext = ".pdf" if is_pdf else ".html"
    path = outdir / f"{doc_id}{ext}"
    path.write_bytes(body)
    rec.update(status="ok", file=str(path), bytes=len(body), sha256=sha256_file(path), content_type=ctype)
    if is_pdf:
        rec.update(pdf_to_text(path, outdir, log, ocr))
    return rec


# ---------------------------------------------------------------- captions

def _sec(ts: str) -> int:
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + int(float(s))


def _fmt(sec: int) -> str:
    return f"{sec // 3600:02d}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


def vtt_to_blocks(vtt_text: str, block_seconds: int = 45, echo_seconds: int = 30) -> list[dict]:
    """Turn a YouTube auto-caption VTT into timestamped text blocks.

    YouTube auto-captions repeat each line across rolling cues. A line is
    dropped only if the same text was kept less than `echo_seconds` earlier.
    (The first hand run used a global "seen" set, which could also drop a real
    repeat such as a second "Second." much later. This version fixes that.)
    """
    lines: list[tuple[int, str]] = []
    cur = None
    last_kept: dict[str, int] = {}
    for raw in vtt_text.splitlines():
        m = re.match(r"(\d\d:\d\d:\d\d)\.\d+\s+-->", raw)
        if m:
            cur = _sec(m.group(1))
            continue
        if cur is None or not raw.strip() or raw.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        text = re.sub(r"<[^>]+>", "", raw).strip()
        text = text.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&")
        if not text or (text in last_kept and cur - last_kept[text] < echo_seconds):
            continue
        lines.append((cur, text))
        last_kept[text] = cur
    blocks: list[dict] = []
    start = None
    buf: list[str] = []
    for t, text in lines:
        if start is None:
            start = t
        buf.append(text)
        if t - start >= block_seconds:
            blocks.append({"start": _fmt(start), "text": " ".join(buf)})
            start, buf = None, []
    if buf:
        blocks.append({"start": _fmt(start or 0), "text": " ".join(buf)})
    return blocks


def write_transcript(blocks: list[dict], path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for b in blocks:
            f.write(f"[{b['start']}] {b['text']}\n")


def fetch_captions(video_url: str, outdir: Path, log: Log, lang: str = "en", block_seconds: int = 45,
                   cookies: str | None = None, cookies_from_browser: str | None = None) -> dict:
    rec = {"video_url": video_url, "status": None, "kind": None}
    ytdlp = shutil.which("yt-dlp")
    cmd_base = [ytdlp] if ytdlp else [sys.executable, "-m", "yt_dlp"]
    vid = re.search(r"(?:v=|youtu\.be/)([\w-]{6,})", video_url)
    stem = f"yt_{vid.group(1) if vid else 'video'}"
    auth: list[str] = []
    if cookies:
        auth = ["--cookies", cookies]
    elif cookies_from_browser:
        auth = ["--cookies-from-browser", cookies_from_browser]
    # Prefer human-made subtitles if they exist; fall back to auto captions.
    for kind, flag in (("manual", "--write-subs"), ("auto", "--write-auto-subs")):
        cmd = cmd_base + auth + ["--skip-download", flag, "--sub-langs", lang, "--sub-format", "vtt",
                          "--no-progress", "-o", str(outdir / f"{stem}.%(ext)s"), video_url]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        except FileNotFoundError:
            rec["status"] = "yt-dlp not installed"
            log.fail("captions", video_url, "yt-dlp not installed (pip install yt-dlp)")
            return rec
        except subprocess.TimeoutExpired:
            log.fail("captions", video_url, f"yt-dlp timed out ({kind})")
            continue
        log.req(video_url, p.returncode, note=f"yt-dlp {kind} captions")
        vtts = sorted(outdir.glob(f"{stem}*.vtt"))
        if vtts:
            vtt = vtts[0]
            blocks = vtt_to_blocks(vtt.read_text(encoding="utf-8", errors="ignore"), block_seconds)
            txt = outdir / f"{stem}.transcript.txt"
            write_transcript(blocks, txt)
            rec.update(status="ok", kind=kind, vtt=str(vtt), vtt_sha256=sha256_file(vtt),
                       transcript=str(txt), blocks=len(blocks),
                       last_timestamp=blocks[-1]["start"] if blocks else None,
                       warning=("Auto-captions are a finding aid. Confirm names, quotes and vote "
                                "tallies against the video or approved minutes.") if kind == "auto" else None)
            return rec
        if p.returncode != 0:
            err = (p.stderr or "").strip().splitlines()[-1:] or ["unknown error"]
            last = err[0][:300]
            if "not a bot" in last or "Sign in to confirm" in last:
                rec["status"] = "blocked_bot_check"
                rec["advice"] = ("YouTube refused this IP address (common for cloud servers). Run on a home "
                                 "computer, or pass --cookies-from-browser / --cookies. Do not treat as 'no captions'.")
                log.fail("captions", video_url, "blocked_bot_check: " + last)
                return rec
            if kind == "auto":
                rec["status"] = f"failed: {last}"
                log.fail("captions", video_url, last)
    if not rec["status"]:
        rec["status"] = "no captions available"
        log.fail("captions", video_url, "no manual or auto captions in requested language")
    return rec


# ---------------------------------------------------------------- commands

def parse_date(s: str) -> dt.date:
    return dt.date.fromisoformat(s)


def cmd_meetings(a) -> int:
    log = Log()
    pg = PrimeGov(a.portal, log)
    ms = pg.meetings(parse_date(a.date_from), parse_date(a.date_to), a.by_publish_date)
    for m in ms:
        docs = ", ".join(f"{d['templateName']}#{d['id']}" for d in m.get("documentList", []))
        flag = "" if m.get("_in_window") else " (docs published in window)"
        print(f"{m['dateTime']}  [{m['id']}]  {m['title']}{flag}\n    video: {m.get('videoUrl') or '-'}\n    docs: {docs or '-'}")
    if log.failures:
        return 2
    return 0


def cmd_doc(a) -> int:
    log = Log()
    pg = PrimeGov(a.portal, log)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    rec = fetch_doc(pg, {"id": a.id, "compileOutputType": a.output_type, "templateName": "document"}, None, out, log, a.ocr)
    print(json.dumps(rec, indent=2))
    return 0 if rec["status"] == "ok" else 2


def cmd_captions(a) -> int:
    log = Log()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    rec = fetch_captions(a.video, out, log, a.lang, a.block_seconds, a.cookies, a.cookies_from_browser)
    print(json.dumps(rec, indent=2))
    return 0 if rec["status"] == "ok" else 2


def cmd_vtt2txt(a) -> int:
    blocks = vtt_to_blocks(Path(a.input).read_text(encoding="utf-8", errors="ignore"), a.block_seconds)
    out = Path(a.output) if a.output else Path(a.input).with_suffix(".transcript.txt")
    write_transcript(blocks, out)
    print(f"{len(blocks)} blocks -> {out}")
    return 0


def cmd_run(a) -> int:
    log = Log()
    pg = PrimeGov(a.portal, log)
    out = Path(a.out)
    (out / "docs").mkdir(parents=True, exist_ok=True)
    (out / "captions").mkdir(parents=True, exist_ok=True)
    start, end = parse_date(a.date_from), parse_date(a.date_to)
    title_re = re.compile(a.include, re.I) if a.include else None
    manifest = {
        "tool": "civic_fetch.py", "version": VERSION, "started_at": now_iso(),
        "portal": pg.portal_page, "window": {"from": str(start), "to": str(end)},
        "by_publish_date": a.by_publish_date, "meetings": [],
    }
    meetings = pg.meetings(start, end, a.by_publish_date)
    print(f"{len(meetings)} meetings selected from {pg.portal_page}")
    for m in meetings:
        if title_re and not title_re.search(m.get("title", "")):
            continue
        print(f"- {m['dateTime']} {m['title']}")
        mrec = {
            "meeting_id": m["id"], "title": m.get("title"), "datetime": m.get("dateTime"),
            "in_window": m.get("_in_window"), "published_in_window": m.get("_published_in_window"),
            "video_url": m.get("videoUrl"), "documents": [], "captions": None,
        }
        for d in m.get("documentList", []):
            if d.get("compileOutputType") == HTML_OUTPUT and not a.try_html:
                mrec["documents"].append({"doc_id": d["id"], "template": d.get("templateName"),
                                          "status": "skipped (HTML agenda; PDF version used)"})
                continue
            mrec["documents"].append(fetch_doc(pg, d, m, out / "docs", log, a.ocr))
            time.sleep(a.delay)
        if m.get("videoUrl") and not a.no_captions:
            mrec["captions"] = fetch_captions(m["videoUrl"], out / "captions", log, a.lang, a.block_seconds,
                                              a.cookies, a.cookies_from_browser)
        manifest["meetings"].append(mrec)
    manifest["finished_at"] = now_iso()
    manifest["requests"] = log.requests
    manifest["failures"] = log.failures
    manifest["summary"] = {
        "meetings": len(manifest["meetings"]),
        "documents_ok": sum(1 for mm in manifest["meetings"] for d in mm["documents"] if d.get("status") == "ok"),
        "documents_failed": sum(1 for mm in manifest["meetings"] for d in mm["documents"]
                                if str(d.get("status", "")).startswith(("failed", "not found"))),
        "captions_ok": sum(1 for mm in manifest["meetings"] if (mm["captions"] or {}).get("status") == "ok"),
        "captions_failed": sum(1 for mm in manifest["meetings"]
                               if mm["captions"] and mm["captions"].get("status") != "ok"),
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    s = manifest["summary"]
    print(f"\nDone. meetings={s['meetings']} docs_ok={s['documents_ok']} docs_failed={s['documents_failed']} "
          f"captions_ok={s['captions_ok']} captions_failed={s['captions_failed']}")
    print(f"Manifest: {out / 'manifest.json'}")
    return 0 if not log.failures else 2


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--version", action="version", version=VERSION)
    sub = ap.add_subparsers(dest="cmd", required=True)

    def window(p):
        p.add_argument("--portal", required=True, help="PrimeGov subdomain, e.g. longmont")
        p.add_argument("--from", dest="date_from", required=True, help="YYYY-MM-DD")
        p.add_argument("--to", dest="date_to", required=True, help="YYYY-MM-DD")
        p.add_argument("--by-publish-date", action="store_true",
                       help="also include meetings outside the window whose documents were published in it")

    def cookie_args(p):
        p.add_argument("--cookies", help="Netscape cookies.txt for YouTube (use your own account)")
        p.add_argument("--cookies-from-browser", help="e.g. chrome, firefox, edge (runs on your computer only)")

    p = sub.add_parser("meetings", help="list meetings and documents in a window")
    window(p)
    p.set_defaults(func=cmd_meetings)

    p = sub.add_parser("run", help="fetch all documents and captions for a window, write manifest.json")
    window(p)
    p.add_argument("--out", required=True)
    p.add_argument("--include", help="regex on meeting title, e.g. 'City Council|Planning'")
    p.add_argument("--no-captions", action="store_true")
    p.add_argument("--try-html", action="store_true", help="also try HTML agendas (usually 'Not Found')")
    p.add_argument("--lang", default="en")
    p.add_argument("--block-seconds", type=int, default=45)
    p.add_argument("--delay", type=float, default=1.0, help="seconds between document requests")
    p.add_argument("--ocr", action="store_true", help="OCR scanned PDFs with tesseract")
    cookie_args(p)
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("doc", help="fetch one compiled document by id")
    p.add_argument("--portal", required=True)
    p.add_argument("--id", type=int, required=True)
    p.add_argument("--output-type", type=int, default=PDF_OUTPUT)
    p.add_argument("--out", required=True)
    p.add_argument("--ocr", action="store_true", help="OCR scanned PDFs with tesseract")
    p.set_defaults(func=cmd_doc)

    p = sub.add_parser("captions", help="fetch captions for one video and build a transcript")
    p.add_argument("--video", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--lang", default="en")
    p.add_argument("--block-seconds", type=int, default=45)
    cookie_args(p)
    p.set_defaults(func=cmd_captions)

    p = sub.add_parser("vtt2txt", help="convert a saved .vtt file to a timestamped transcript")
    p.add_argument("--input", required=True)
    p.add_argument("--output")
    p.add_argument("--block-seconds", type=int, default=45)
    p.set_defaults(func=cmd_vtt2txt)

    a = ap.parse_args(argv)
    return a.func(a)


if __name__ == "__main__":
    sys.exit(main())
