import json
from pathlib import Path

PROFILE = Path("Requirements/PROJECT_PROFILE.json")

def main():
    prof = json.loads(PROFILE.read_text("utf-8"))
    platforms = prof.get("platforms", {})
    e2e = prof.get("e2e", {})
    acc = prof.get("accessibility", {})
    sec = prof.get("security", {})
    out = {
        "WEB_ENABLED": "true" if platforms.get("web", False) else "false",
        "MOBILE_ENABLED": "true" if platforms.get("mobile", False) else "false",
        "WEB_E2E_RUNNER": e2e.get("web_runner","none"),
        "MOBILE_E2E_RUNNER": e2e.get("mobile_runner","none"),
        "E2E_BASE_URL": e2e.get("base_url","http://localhost:3000"),
        "REQUIRE_E2E_PASS": "true" if e2e.get("require_pass_for_must_flows", True) else "false",
        "ACCESSIBILITY_ENABLED": "true" if acc.get("enabled", True) else "false",
        "GITLEAKS_ENABLED": "true" if sec.get("gitleaks", True) else "false",
        "OSV_ENABLED": "true" if sec.get("osv", True) else "false",
        "CODEQL_OPTIONAL": "true" if sec.get("codeql_optional", True) else "false",
    }
    for k,v in out.items():
        print(f"{k}={v}")

if __name__ == "__main__":
    main()
