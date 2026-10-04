"""Offline tests for scripts/civic_fetch.py. No network access."""
import importlib.util
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("civic_fetch", ROOT / "scripts" / "civic_fetch.py")
MOD = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = MOD
SPEC.loader.exec_module(MOD)

# A YouTube-style auto-caption VTT: each cue repeats the previous line (rolling captions).
VTT = """WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:03.000
I move to approve.

00:00:03.000 --> 00:00:05.000
I move to approve.
Second.

00:00:05.000 --> 00:00:30.000
Second.
All in favor? &gt;&gt; Aye.

00:00:50.000 --> 00:00:52.000
That carries 5 to 2.

00:10:00.000 --> 00:10:02.000
Next item. I move to table.

00:10:02.000 --> 00:10:04.000
Second.
"""


class VttTests(unittest.TestCase):
    def test_rolling_duplicates_removed_and_entities_decoded(self):
        blocks = MOD.vtt_to_blocks(VTT, block_seconds=45)
        text = " ".join(b["text"] for b in blocks)
        self.assertEqual(text.count("I move to approve."), 1)
        self.assertIn(">> Aye.", text)
        self.assertNotIn("&gt;", text)

    def test_real_repeat_far_apart_is_kept(self):
        # The second "Second." ten minutes later is a new statement, not a caption echo.
        text = " ".join(b["text"] for b in MOD.vtt_to_blocks(VTT, block_seconds=45))
        self.assertEqual(text.count("Second."), 2)

    def test_blocks_carry_start_timestamps(self):
        blocks = MOD.vtt_to_blocks(VTT, block_seconds=45)
        self.assertEqual(blocks[0]["start"], "00:00:01")
        self.assertTrue(any(b["start"] == "00:10:00" for b in blocks))
        self.assertTrue(any("That carries 5 to 2." in b["text"] for b in blocks))


class PortalTests(unittest.TestCase):
    def test_not_found_page_detected(self):
        page = b"<!DOCTYPE html><html><head><title>Document Not Found</title></head></html>"
        self.assertTrue(MOD.is_not_found_html(page))
        self.assertFalse(MOD.is_not_found_html(b"%PDF-1.7 ..."))

    def test_doc_url_uses_path_form(self):
        pg = MOD.PrimeGov("longmont", MOD.Log())
        self.assertEqual(pg.doc_url(18842),
                         "https://longmont.primegov.com/Public/CompiledDocument/18842?compileOutputType=1")
        self.assertEqual(pg.portal_page, "https://longmont.primegov.com/public/portal")

    def test_window_selection_by_meeting_and_publish_date(self):
        pg = MOD.PrimeGov("longmont", MOD.Log())
        archived = [
            {"id": 1, "dateTime": "2026-09-29T19:00:00", "documentList": []},
            {"id": 2, "dateTime": "2026-08-17T16:30:00",
             "documentList": [{"id": 9, "publishDate": "2026-10-02T15:00:00"}]},
            {"id": 3, "dateTime": "2026-08-01T10:00:00",
             "documentList": [{"id": 8, "publishDate": "2026-08-02T10:00:00"}]},
        ]
        upcoming = [{"id": 4, "dateTime": "2026-10-06T19:00:00",
                     "documentList": [{"id": 7, "publishDate": "2026-10-02T15:24:00"}]}]
        pg._json = lambda path: upcoming if "Upcoming" in path else archived
        d = MOD.dt.date
        plain = [m["id"] for m in pg.meetings(d(2026, 9, 27), d(2026, 10, 4), by_publish_date=False)]
        self.assertEqual(plain, [1])
        wide = [m["id"] for m in pg.meetings(d(2026, 9, 27), d(2026, 10, 4), by_publish_date=True)]
        self.assertEqual(wide, [2, 1, 4])


if __name__ == "__main__":
    unittest.main()
