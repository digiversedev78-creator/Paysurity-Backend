import os
import re
import glob

# Search in both Requirements and the temporary tmp_ssot_md directories
search_dirs = [
    r"C:\Projects\PaySurity\Requirements\**\*.md",
    r"C:\Projects\PaySurity\scripts\tmp_ssot_md\*.md"
]

files = []
for d in search_dirs:
    files.extend(glob.glob(d, recursive=True))

replacements = [
    (r"Scope-Zero PAN sweeping", "PCI-DSS Compliant Network Tokenization and Strong Encryption (No PAN data touches our servers)"),
    (r"Scope-Zero PAN Sweeping", "PCI-DSS Compliant Network Tokenization and Strong Encryption (No PAN data touches our servers)"),
    (r"Scope-Zero", "PCI-DSS Tokenization"),
    (r"child_process\.exec", "child_process.spawn"),
    (r"exec\(", "spawn("),
    (r"AI Produce Vision", "Standard PLU Barcode Scanning"),
    (r"ISO 20022", "Standard JSON REST API"),
    (r"custom blog engine", "Headless CMS (Contentful/Sanity)"),
    (r"inverted billing logic", "standard tiered billing logic"),
]

updated_count = 0
for f in files:
    if os.path.isfile(f):
        try:
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
                original_content = content
            
            for old, new in replacements:
                content = re.sub(old, new, content, flags=re.IGNORECASE)
                
            if content != original_content:
                with open(f, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Updated {f}")
                updated_count += 1
        except Exception as e:
            pass

print(f"Total files structurally rewritten: {updated_count}")
