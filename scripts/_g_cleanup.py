#!/usr/bin/env python3
"""Step 9: manifest + cost tracker + cleanup."""
import json
from datetime import datetime, timezone
from pathlib import Path

from graphify.detect import save_manifest

PROJECT = Path(r"c:\Users\Sinval\Projetos\unidicas")
detect = json.loads((PROJECT / "graphify-out" / ".graphify_detect.json").read_text(encoding="utf-8"))
save_manifest(detect.get("all_files") or detect["files"], root=str(PROJECT))

extract = json.loads((PROJECT / "graphify-out" / ".graphify_extract.json").read_text(encoding="utf-8"))
in_tok = extract.get("input_tokens", 0)
out_tok = extract.get("output_tokens", 0)

cost_path = PROJECT / "graphify-out" / "cost.json"
if cost_path.exists():
    cost = json.loads(cost_path.read_text(encoding="utf-8"))
else:
    cost = {"runs": [], "total_input_tokens": 0, "total_output_tokens": 0}

cost["runs"].append({
    "date": datetime.now(timezone.utc).isoformat(),
    "input_tokens": in_tok,
    "output_tokens": out_tok,
    "files": detect.get("total_files", 0),
})
cost["total_input_tokens"] += in_tok
cost["total_output_tokens"] += out_tok
cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"This run: {in_tok:,} in / {out_tok:,} out tokens")
print(f"All time: {cost['total_input_tokens']:,} in / {cost['total_output_tokens']:,} out ({len(cost['runs'])} runs)")

# cleanup
for f in [".graphify_detect.json", ".graphify_extract.json", ".graphify_ast.json",
         ".graphify_semantic.json", ".graphify_analysis.json"]:
    p = PROJECT / "graphify-out" / f
    if p.exists(): p.unlink()
print("Cleanup done")
