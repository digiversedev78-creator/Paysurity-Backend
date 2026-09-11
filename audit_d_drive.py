import os
import json
from pathlib import Path

TARGET_DIRS = [
    r"D:\.gemini",
    r"D:\.gemini_brain",
    r"D:\npm-cache",
    r"D:\pnpm-cache",
    r"D:\pnpm-store",
    r"D:\Projects\PaySurity-Mother Folder"
]

IGNORE_DIRS = {'node_modules', '.git', 'dist', 'build', '.cache', 'temp', 'tmp'}
INTERESTING_EXTS = {'.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.yml', '.yaml', '.html', '.css', '.env'}

results = {
    "potential_source_code": [],
    "shareholder_demo_candidates": [],
    "agent_artifacts": []
}

for root_dir in TARGET_DIRS:
    if not os.path.exists(root_dir):
        continue
        
    for root, dirs, files in os.walk(root_dir):
        # Mutate dirs in-place to ignore specified directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            file_name = file.lower()
            
            # Check for Demo/Shareholder specifically
            if 'demo' in file_name or 'shareholder' in file_name or 'stakeholder' in file_name:
                results["shareholder_demo_candidates"].append(file_path)
            
            # If we are in the cache dirs, skip deep file analysis unless it has demo in the name
            if "cache" in root_dir.lower() or "store" in root_dir.lower():
                continue
                
            # If we are in gemini folders, look for scratch files or artifacts
            if ".gemini" in root_dir.lower():
                if "scratch" in root.lower() or "artifacts" in root.lower() or file.endswith('.md'):
                    if 'demo' in file_name or 'shareholder' in file_name or 'gap' in file_name or 'plan' in file_name:
                        results["agent_artifacts"].append(file_path)
                continue
            
            # If in Projects folder, look for source code
            if any(file.endswith(ext) for ext in INTERESTING_EXTS):
                if "PaySurity-Mother Folder" in root_dir:
                    # Just flag anything that looks like it belongs to a missing app
                    if "apps\\" in root:
                        app_name = root.split("apps\\")[1].split("\\")[0]
                        if "demo" in app_name.lower() or "shareholder" in app_name.lower():
                            if file_path not in results["shareholder_demo_candidates"]:
                                results["shareholder_demo_candidates"].append(file_path)

# Write results to output
with open(r"C:\Projects\PaySurity\audit_results.json", "w") as f:
    json.dump(results, f, indent=4)

print("Audit complete. Found {} potential demo files and {} agent artifacts.".format(
    len(results["shareholder_demo_candidates"]),
    len(results["agent_artifacts"])
))
