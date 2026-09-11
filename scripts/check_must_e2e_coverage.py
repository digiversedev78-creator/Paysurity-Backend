import json, sys
from pathlib import Path

CANON = Path("Requirements/CANONICAL.json")
E2E_DIR = Path("e2e")

def is_must_flow(r):
    if (r.get("priority") or "").lower() != "must": return False
    rtype = (r.get("type") or "").lower()
    tags = [t.lower() for t in (r.get("tags") or [])]
    return (rtype == "flow") or ("flow" in tags)

def main():
    if not CANON.exists():
        print("Missing CANONICAL.json"); return 1
    canon = json.loads(CANON.read_text("utf-8"))
    failures = []
    for r in canon.get("requirements", []):
        if not is_must_flow(r): continue
        if (r.get("status") or "").lower() != "done": continue

        rid = (r.get("id") or "").strip()
        tid = (r.get("e2e_test_id") or "").strip()
        if not tid:
            failures.append(f"{rid} missing e2e_test_id"); continue

        f = E2E_DIR / f"{tid}.spec.ts"
        if not f.exists():
            failures.append(f"{rid} missing E2E file: {f.as_posix()}"); continue

        txt = f.read_text(encoding="utf-8", errors="ignore")
        if (tid not in txt) and (rid not in txt):
            failures.append(f"{rid} E2E file missing traceability marker. File: {f.as_posix()}")

    if failures:
        print("FAIL: MUST flows marked done without compliant E2E coverage:")
        for x in failures: print(" -", x)
        return 2
    print("OK: MUST-flow E2E coverage gate passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
