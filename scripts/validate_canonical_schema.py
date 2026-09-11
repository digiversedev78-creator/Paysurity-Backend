import json, sys
from pathlib import Path
try:
    import jsonschema
except ImportError:
    print("Missing dependency: jsonschema"); sys.exit(2)

CANON = Path("Requirements/CANONICAL.json")
SCHEMA = Path("Requirements/CANONICAL.schema.json")

def main():
    if not CANON.exists(): print("Missing CANONICAL.json"); sys.exit(1)
    if not SCHEMA.exists(): print("Missing CANONICAL.schema.json"); sys.exit(1)
    jsonschema.validate(json.loads(CANON.read_text("utf-8")), json.loads(SCHEMA.read_text("utf-8")))
    print("OK: CANONICAL.json matches schema")

if __name__ == "__main__":
    main()
