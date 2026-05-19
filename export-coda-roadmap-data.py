#!/usr/bin/env python3
"""
Export Coda roadmap milestones into static JSON for GitHub Pages.

The browser reads the generated JSON file. The Coda API key stays local in
sync-coda-milestones.py and is never written to the generated output.
"""

import argparse
import importlib.util
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import requests


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "coda-roadmap-data.json"
SYNC_SCRIPT = ROOT / "sync-coda-milestones.py"
BASE = "https://coda.io/apis/v1"
DOC_ID = "GDLsJnP2Ir"


PROGRAM_SPECS = [
    {
        "key": "R18",
        "name": "R18",
        "title": "R18 PMB Milestones",
        "page_id": "canvas-hPZQWg49Wp",
        "table_id": "grid-AQ9AjbDyvO",
        "source_url": "https://coda.io/d/SIT-PMB-Roadmap_dGDLsJnP2Ir/R18-PMB-Milestones_sujMr0sb#R18-Program-Milestones_tujbDyvO",
    },
    {
        "key": "R19",
        "name": "R19",
        "title": "R19 PMB Milestones",
        "page_id": "canvas-s7TIoUT9Ft",
        "table_id": "",
        "source_url": "https://coda.io/d/_dGDLsJnP2Ir/_suy-VjF9",
    },
    {
        "key": "L3",
        "name": "L3 AML",
        "title": "L3 AML PMB Milestones",
        "page_id": "canvas-3DxuFh60wq",
        "table_id": "grid-e6ubzXfI7a",
        "source_url": "https://coda.io/d/_dGDLsJnP2Ir/_suFxKoG1",
    },
]


def get_api_key():
    key = os.environ.get("CODA_API_KEY")
    if key:
        return key
    if SYNC_SCRIPT.exists():
        spec = importlib.util.spec_from_file_location("sync_coda_milestones", SYNC_SCRIPT)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if getattr(module, "CODA_API_KEY", ""):
            return module.CODA_API_KEY
    raise RuntimeError("Set CODA_API_KEY or keep sync-coda-milestones.py beside this exporter.")


class CodaClient:
    DOC_ID = DOC_ID

    def __init__(self, api_key):
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def api_get(self, path, params=None):
        for attempt in range(4):
            response = requests.get(f"{BASE}{path}", headers=self.headers, params=params, timeout=30)
            if response.status_code == 429:
                time.sleep((attempt + 1) * 15)
                continue
            response.raise_for_status()
            return response.json()
        raise RuntimeError("Exceeded retry limit on Coda GET")

    def fetch_all_rows(self, table_id, value_format="simpleWithArrays"):
        rows, page_token = [], None
        while True:
            params = {"limit": 500, "valueFormat": value_format}
            if page_token:
                params["pageToken"] = page_token
            data = self.api_get(f"/docs/{self.DOC_ID}/tables/{table_id}/rows", params)
            rows.extend(data.get("items", []))
            page_token = data.get("nextPageToken")
            if not page_token:
                break
        return rows


def scalar(value):
    if value is None:
        return ""
    if isinstance(value, list):
        parts = [scalar(item) for item in value]
        return "; ".join(part for part in parts if part)
    if isinstance(value, dict):
        for key in ("name", "display", "value", "id"):
            if value.get(key):
                return scalar(value[key])
        return ""
    return str(value).strip()


def norm_name(name):
    return re.sub(r"[^a-z0-9]+", "", str(name or "").lower())


def find_col(columns, names):
    wanted = [norm_name(name) for name in names]
    for name in wanted:
        if name in columns:
            return columns[name]
    for col_name, col_id in columns.items():
        if any(name and name in col_name for name in wanted):
            return col_id
    return ""


def to_iso_date(value):
    text = scalar(value)
    if not text or text.lower() in {"na", "n/a", "tbd", "none", "-"}:
        return ""
    if re.match(r"^\d{4}-\d{2}-\d{2}", text):
        return text[:10]
    for fmt in ("%m/%d/%Y", "%m-%d-%Y", "%Y/%m/%d", "%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        return ""


def status_key(status):
    text = scalar(status).lower()
    if not text:
        return "unspecified"
    if "complete" in text and "in progress" not in text:
        return "complete"
    if "block" in text:
        return "blocked"
    if "not start" in text:
        return "notstarted"
    if "wip" in text and "delayed" in text:
        return "wip_delayed"
    if "wip" in text and "track" in text:
        return "wip_ontrack"
    if "deferred" in text:
        return "deferred"
    if "de-scoped" in text or "descoped" in text:
        return "descoped"
    if "progress" in text:
        return "progress"
    return "unspecified"


def table_columns(coda, table_id):
    columns = {}
    data = coda.api_get(f"/docs/{coda.DOC_ID}/tables/{table_id}/columns", {"limit": 100})
    for col in data.get("items", []):
        columns[norm_name(col.get("name"))] = col.get("id")
    return columns


def discover_table(coda, page_id):
    token = None
    while True:
        params = {"limit": 100}
        if token:
            params["pageToken"] = token
        data = coda.api_get(f"/docs/{coda.DOC_ID}/tables", params)
        for table in data.get("items", []):
            parent = table.get("parent") or {}
            parent_id = parent.get("id") if isinstance(parent, dict) else parent
            if parent_id != page_id:
                continue
            name = str(table.get("name") or "").lower()
            if "milestone" in name:
                return table.get("id")
        token = data.get("nextPageToken")
        if not token:
            return ""


def fetch_program(coda, spec):
    table_id = spec.get("table_id") or discover_table(coda, spec["page_id"])
    program = {
        "key": spec["key"],
        "name": spec["name"],
        "title": spec["title"],
        "sourceUrl": spec["source_url"],
        "tableId": table_id,
        "l1": [],
        "l2": [],
        "note": "",
    }
    if not table_id:
        program["note"] = "No Coda milestone table is published for this program yet."
        return program

    columns = table_columns(coda, table_id)
    col = {
        "milestone": find_col(columns, ["Milestone", "Milestones", "Name"]),
        "level": find_col(columns, ["Level"]),
        "parent": find_col(columns, ["Parent Milestone", "Parent"]),
        "workstream": find_col(columns, ["Workstream", "Stream"]),
        "pic": find_col(columns, ["PIC", "Owner"]),
        "status": find_col(columns, ["Status"]),
        "start": find_col(columns, ["Start Date", "Start"]),
        "target": find_col(columns, ["End Date", "ETC", "Target"]),
        "dependency": find_col(columns, ["Dependency", "Blocked Reason", "Depends On"]),
        "comments": find_col(columns, ["Comments", "Notes"]),
    }

    rows = coda.fetch_all_rows(table_id, value_format="simpleWithArrays")
    for row in rows:
        values = row.get("values", {})
        label = scalar(values.get(col["milestone"]))
        if not label:
            continue
        parent = scalar(values.get(col["parent"]))
        level = scalar(values.get(col["level"])).upper()
        if level not in {"L1", "L2"}:
            level = "L2" if parent else "L1"
        status_text = scalar(values.get(col["status"]))
        milestone = {
            "label": label,
            "ws": scalar(values.get(col["workstream"])) or "-",
            "pic": scalar(values.get(col["pic"])) or "-",
            "startDate": to_iso_date(values.get(col["start"])),
            "date": to_iso_date(values.get(col["target"])),
            "initialDate": "",
            "statusText": status_text,
            "st": status_key(status_text),
            "dependency": scalar(values.get(col["dependency"])),
            "parent": parent,
            "level": level,
            "comments": scalar(values.get(col["comments"])),
        }
        if level == "L1":
            program["l1"].append(milestone)
        else:
            program["l2"].append(milestone)

    program["l1"].sort(key=lambda item: (item["date"] or "9999-12-31", item["label"]))
    program["l2"].sort(key=lambda item: (item["date"] or "9999-12-31", item["label"]))
    program["stats"] = {
        "l1": len(program["l1"]),
        "l2": len(program["l2"]),
        "datedL1": sum(1 for item in program["l1"] if item.get("date")),
        "datedL2": sum(1 for item in program["l2"] if item.get("date")),
    }
    return program


def main():
    parser = argparse.ArgumentParser(description="Export Coda roadmap data for GitHub Pages")
    parser.add_argument("--output", default=str(OUTPUT), help="Output JSON path")
    args = parser.parse_args()

    coda = CodaClient(get_api_key())
    programs = {}
    for spec in PROGRAM_SPECS:
        programs[spec["key"]] = fetch_program(coda, spec)

    r18 = programs.get("R18", {})
    payload = {
        "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source": "Coda SIT PMB Roadmap",
        "sourceUrl": "https://coda.io/d/SIT-PMB-Roadmap_dGDLsJnP2Ir",
        "programOrder": [spec["key"] for spec in PROGRAM_SPECS],
        "programs": programs,
        "l1": r18.get("l1", []),
        "l2": r18.get("l2", []),
    }

    out_path = Path(args.output)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")
    for key in payload["programOrder"]:
        program = programs[key]
        print(f"{key}: {len(program['l1'])} L1, {len(program['l2'])} L2")


if __name__ == "__main__":
    main()
