import os
import json
import zipfile

with open(r"C:\Projects\PaySurity\audit_results.json", "r") as f:
    results = json.load(f)

artifacts = results.get("agent_artifacts", [])
zip_path = r"C:\Projects\PaySurity\artifacts_archive.zip"

print(f"Zipping {len(artifacts)} agent artifacts...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in artifacts:
        if os.path.exists(file_path):
            # Preserve directory structure relative to D drive
            arcname = os.path.relpath(file_path, "D:\\")
            zipf.write(file_path, arcname)

print("Created artifacts_archive.zip successfully.")
