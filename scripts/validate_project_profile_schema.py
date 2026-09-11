import json, sys
from pathlib import Path
try:
    import jsonschema
except ImportError:
    print("Missing dependency: jsonschema"); sys.exit(2)

PROFILE = Path("Requirements/PROJECT_PROFILE.json")
SCHEMA  = Path("Requirements/PROJECT_PROFILE.schema.json")

def main():
    if not PROFILE.exists(): print("Missing PROJECT_PROFILE.json"); sys.exit(1)
    if not SCHEMA.exists(): print("Missing PROJECT_PROFILE.schema.json"); sys.exit(1)
    jsonschema.validate(json.loads(PROFILE.read_text("utf-8")), json.loads(SCHEMA.read_text("utf-8")))
    print("OK: PROJECT_PROFILE.json matches schema")

if __name__ == "__main__":
    main()
