import os
import json
import time

QUEUE_DIR = "docs/architecture/requirements/queue"
RTM_FILE = "docs/architecture/requirements/matrix/RTM.json"

def process_queue():
    for filename in os.listdir(QUEUE_DIR):
        if filename.endswith(".json"):
            print(f"Processing: {filename}")
            # Logic to append to RTM.json would go here
            os.remove(os.path.join(QUEUE_DIR, filename))

if __name__ == "__main__":
    print("Watcher started...")
    process_queue()
