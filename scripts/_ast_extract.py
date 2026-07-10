#!/usr/bin/env python3
"""AST extraction para o graphify."""
import json
import sys
from pathlib import Path

from graphify.extract import collect_files, extract

PROJECT = Path(r"c:\Users\Sinval\Projetos\unidicas")
detect = json.loads((PROJECT / "graphify-out" / ".graphify_detect.json").read_text(encoding="utf-8"))

code_files = []
for f in detect.get("files", {}).get("code", []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    else:
        code_files.append(p)

print(f"code files: {len(code_files)}")

result = extract(code_files, cache_root=PROJECT)
out = PROJECT / "graphify-out" / ".graphify_ast.json"
out.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"AST: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
