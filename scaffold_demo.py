import os
import shutil
import textwrap

# Paths
source_base = r"D:\Projects\PaySurity-Mother Folder\PaySurity-Legacy-Archive"
target_base = r"C:\Projects\PaySurity\shareholder-demo"
public_dir = os.path.join(target_base, "public")

# Create directories
os.makedirs(public_dir, exist_ok=True)

# Define items to copy
items_to_copy = [
    "Investor_Demos",
    "Tenant_Microsites",
    "index.html",
    "DEMO_LINKS.md",
    "EXECUTIVE_DISCLOSURE.md"
]

# Copy items
for item in items_to_copy:
    src_path = os.path.join(source_base, item)
    dst_path = os.path.join(public_dir, item)
    if os.path.exists(src_path):
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path, dirs_exist_ok=True)
            print(f"Copied directory {item} to public folder.")
        else:
            shutil.copy2(src_path, dst_path)
            print(f"Copied file {item} to public folder.")

# Generate server.js
server_js = textwrap.dedent("""\
    const express = require('express');
    const path = require('path');
    const app = express();
    const PORT = process.env.PORT || 8080;

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.listen(PORT, () => {
        console.log(`Shareholder Demo Portal listening on port ${PORT}`);
    });
""")
with open(os.path.join(target_base, "server.js"), "w") as f:
    f.write(server_js)

# Generate package.json
package_json = textwrap.dedent("""\
    {
      "name": "shareholder-demo",
      "version": "1.0.0",
      "description": "Unified Shareholder Demo Portal for PaySurity",
      "main": "server.js",
      "scripts": {
        "start": "node server.js"
      },
      "dependencies": {
        "express": "^4.18.2"
      }
    }
""")
with open(os.path.join(target_base, "package.json"), "w") as f:
    f.write(package_json)

# Generate Dockerfile
dockerfile = textwrap.dedent("""\
    FROM node:18-alpine
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install --production
    COPY . .
    EXPOSE 8080
    CMD [ "npm", "start" ]
""")
with open(os.path.join(target_base, "Dockerfile"), "w") as f:
    f.write(dockerfile)

print("Scaffolded shareholder-demo application successfully.")
