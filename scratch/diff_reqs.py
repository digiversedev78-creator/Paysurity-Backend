import json
import re

with open("c:/Projects/PaySurity/Requirements/MASTER_LEDGER.json", "r", encoding="utf-8") as f:
    master_ledger = json.load(f)

master_ids = set()
for category in master_ledger.get("ledger", []):
    for req in category.get("requirements", []):
        master_ids.add(req["id"])

with open("c:/Projects/PaySurity/full_texts_utf8.txt", "r", encoding="utf-8") as f:
    full_text = f.read()

# Look for patterns like ### REQ-WEB-001: or ### MST-001: or just bold items like **ADV-005**
# Let's extract lines that define a requirement.
old_reqs = []
lines = full_text.split('\n')
for line in lines:
    # Match headers like `### REQ-WEB-001: Core Site Structure & SEO Baseline`
    # or `### MST-001: Tenant microsite auto-provisioning on tenant signup`
    # or `**ADV-005 [Speed-Onboarding]:**`
    match1 = re.match(r'^###\s+([A-Z0-9\-]+):\s+(.*)', line.strip())
    if match1:
        req_id = match1.group(1)
        title = match1.group(2)
        old_reqs.append((req_id, title))
        continue
    
    match2 = re.match(r'^\*\*([A-Z0-9\-]+)\s+\[([^\]]+)\]:\*\*', line.strip())
    if match2:
        req_id = match2.group(1)
        title = match2.group(2)
        old_reqs.append((req_id, title))
        continue

    # Also match table rows if any, but let's stick to explicit headers first.
    # What about REQ-POSR-011 etc.? Let's also just look for REQ-[A-Z]+-\d+ in headings
    match3 = re.match(r'^##\s+([A-Z0-9\-]+):\s+(.*)', line.strip())
    if match3:
        req_id = match3.group(1)
        title = match3.group(2)
        old_reqs.append((req_id, title))
        continue

print(f"Found {len(old_reqs)} requirements in old text.")

leaked = []
for req_id, title in old_reqs:
    if req_id not in master_ids:
        leaked.append((req_id, title))

print(f"Found {len(leaked)} leaked requirements:")
for req_id, title in leaked:
    print(f"- {req_id}: {title}")

# Also just look for any standalone REQ-xxx or MST-xxx tags to be sure we aren't missing any format
all_tags = re.findall(r'\b(?:REQ|MST|ADV|DEF|OP)-[A-Z0-9\-]+\b', full_text)
unique_tags = set(all_tags)
print(f"\nTotal unique requirement-like tags found: {len(unique_tags)}")
untracked_tags = unique_tags - master_ids
print(f"Tags completely untracked in master ledger: {len(untracked_tags)}")
for t in sorted(untracked_tags):
    print(t)
