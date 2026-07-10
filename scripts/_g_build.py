#!/usr/bin/env python3
"""Steps 4-5: build, cluster, analyze, label."""
import json
from pathlib import Path

from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

PROJECT = Path(r"c:\Users\Sinval\Projetos\unidicas")
INPUT_PATH = str(PROJECT)

ast = json.loads((PROJECT / "graphify-out" / ".graphify_ast.json").read_text(encoding="utf-8"))
# semantica vazia (code-only, pulamos Gemini)
sem = {"nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}
(Path(PROJECT / "graphify-out" / ".graphify_semantic.json")).write_text(json.dumps(sem), encoding="utf-8")

# Part C: merge
seen = {n["id"] for n in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for n in sem["nodes"]:
    if n["id"] not in seen:
        merged_nodes.append(n)
        seen.add(n["id"])
merged_edges = ast["edges"] + sem["edges"]
merged_hyperedges = sem.get("hyperedges", [])
merged = {
    "nodes": merged_nodes,
    "edges": merged_edges,
    "hyperedges": merged_hyperedges,
    "input_tokens": 0,
    "output_tokens": 0,
}
(PROJECT / "graphify-out" / ".graphify_extract.json").write_text(
    json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8"
)
print(f"Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges")

# Step 4: build + cluster
detection = json.loads((PROJECT / "graphify-out" / ".graphify_detect.json").read_text(encoding="utf-8"))

G = build_from_json(merged, root=INPUT_PATH, directed=False)
if G.number_of_nodes() == 0:
    print("ERROR: empty graph")
    raise SystemExit(1)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {"input": 0, "output": 0}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: f"Community {cid}" for cid in communities}
questions = suggest_questions(G, communities, labels)

wrote = to_json(G, communities, str(PROJECT / "graphify-out" / "graph.json"), force=True)
if not wrote:
    print("ERROR: refused to shrink graph.json (existing has more nodes)")
    raise SystemExit(1)

report = generate(
    G, communities, cohesion, labels, gods, surprises, detection, tokens, INPUT_PATH,
    suggested_questions=questions
)
(PROJECT / "graphify-out" / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

analysis = {
    "communities": {str(k): v for k, v in communities.items()},
    "cohesion": {str(k): v for k, v in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions,
}
(PROJECT / "graphify-out" / ".graphify_analysis.json").write_text(
    json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8"
)

print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities")
print("\nCommunities (auto-labels):")
for cid, nodes in communities.items():
    print(f"  {cid}: {len(nodes)} nodes")

# Step 5: sugere labels baseados nos top nodes de cada comunidade
print("\nSugestoes de label por comunidade (baseado nos top nodes):")
import collections
new_labels = {}
for cid, nodes in communities.items():
    counts = collections.Counter(nodes)
    top = [n for n, _ in counts.most_common(8)]
    new_labels[cid] = f"Community {cid}: {', '.join(top[:4])}"

# Regenerar relatorio com labels melhores
report2 = generate(
    G, communities, cohesion, new_labels, gods, surprises, detection, tokens, INPUT_PATH,
    suggested_questions=questions
)
(PROJECT / "graphify-out" / "GRAPH_REPORT.md").write_text(report2, encoding="utf-8")
(PROJECT / "graphify-out" / ".graphify_labels.json").write_text(
    json.dumps({str(k): v for k, v in new_labels.items()}, ensure_ascii=False), encoding="utf-8"
)
print(f"Labels saved: {new_labels}")
