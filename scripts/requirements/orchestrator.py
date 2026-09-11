import json
import os
import subprocess

MODULES_DIR = "docs/architecture/modules"
QUEUE_DIR = "docs/architecture/requirements/queue"
VERTICAL_PRIORITY = ["auth", "admin", "ledger", "pos"]

def run_regression():
    print("Running regression suite...")
    # This expects a script at this location; create a dummy one if it doesn't exist
    return subprocess.run(["./scripts/test/regression.sh"], shell=True).returncode == 0

def orchestrate():
    for vertical in VERTICAL_PRIORITY:
        mod_path = os.path.join(MODULES_DIR, vertical, "requirements.json")
        if not os.path.exists(mod_path):
            print(f"Skipping {vertical}: No requirements.json found.")
            continue
            
        print(f"--- Processing Vertical: {vertical} ---")
        
        # GATEKEEPER: Run regression after vertical completion
        if not run_regression():
            print(f"Regression FAILED for {vertical}. Halting execution.")
            break
        print(f"Regression passed. Proceeding to next vertical.")

if __name__ == "__main__":
    orchestrate()
