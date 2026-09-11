import os

def generate_tree(dir_path, prefix=""):
    lines = []
    if not os.path.isdir(dir_path):
        return [f"{dir_path} [Not Found]"]
    
    lines.append(os.path.basename(dir_path.rstrip("/\\")))
    
    try:
        entries = sorted(os.listdir(dir_path))
    except Exception as e:
        return lines + [f"Error reading directory: {e}"]
        
    for i, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        is_last = (i == len(entries) - 1)
        connector = "└── " if is_last else "├── "
        
        lines.append(f"{prefix}{connector}{entry}")
        
        if os.path.isdir(path):
            extension = "    " if is_last else "│   "
            lines.extend(generate_tree(path, prefix=prefix + extension)[1:])
            
    return lines

old_req = "C:/Projects/PaySurity/OLD REQUIREMENTS"
req = "C:/Projects/PaySurity/Requirements"

with open("C:/Projects/PaySurity/raw_tree.txt", "w", encoding="utf-8") as f:
    f.write(old_req + "\n")
    f.write("\n".join(generate_tree(old_req)))
    f.write("\n\n" + req + "\n")
    f.write("\n".join(generate_tree(req)))
