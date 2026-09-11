import json, sys
from pathlib import Path

PROFILE = Path("Requirements/PROJECT_PROFILE.json")
USAGE   = Path("AgentOutput/openai_usage.jsonl")

def main():
    if not PROFILE.exists():
        print("Missing PROJECT_PROFILE.json"); return 1

    prof = json.loads(PROFILE.read_text("utf-8"))
    budget = prof.get("budget", {})
    enforce = bool(budget.get("enforce", False))
    max_cost = float(budget.get("max_cost_usd", 0))
    max_slices = int(budget.get("max_slices_total", 0))

    if not enforce:
        print("OK: Budget enforcement disabled."); return 0

    if not USAGE.exists():
        print("FAIL: Budget enforcement enabled but AgentOutput/openai_usage.jsonl missing."); return 2

    total_cost = 0.0
    max_slice_seen = 0
    for line in USAGE.read_text("utf-8").splitlines():
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except Exception: continue
        total_cost += float(obj.get("cost_usd", 0.0))
        max_slice_seen = max(max_slice_seen, int(obj.get("slice", 0)))

    if (max_cost > 0 and total_cost > max_cost) or (max_slices > 0 and max_slice_seen > max_slices):
        print("FAIL: Budget cap exceeded.")
        print(f"Total cost: ${total_cost:.2f} (cap ${max_cost:.2f})")
        print(f"Slices used: {max_slice_seen} (cap {max_slices})")
        return 3

    print("OK: Budget cap within limits.")
    print(f"Total cost: ${total_cost:.2f} / cap ${max_cost:.2f}")
    print(f"Slices used: {max_slice_seen} / cap {max_slices}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
