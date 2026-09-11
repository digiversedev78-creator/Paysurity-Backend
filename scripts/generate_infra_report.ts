import * as fs from "fs";
import * as path from "path";

const root = process.cwd();
const exists = (p:string)=>fs.existsSync(p);
const list = (p:string)=>exists(p)?fs.readdirSync(p,{withFileTypes:true}).map(d=>({name:d.name,isDir:d.isDirectory()})):[];
const listDirs=(p:string)=>list(p).filter(d=>d.isDir).map(d=>path.join(p,d.name));

const appsDir = path.join(root,"apps");
const packagesDir = path.join(root,"packages");

const report:any = {
  meta: { generated_at: new Date().toISOString(), monorepo_root: root.replace(/\\\\/g,"/") },
  repos: [{ name: path.basename(root) }],
  apps: exists(appsDir) ? listDirs(appsDir).map(p=>({ name: path.basename(p), path: p.replace(/\\\\/g,"/") })) : [],
  packages: exists(packagesDir) ? listDirs(packagesDir).map(p=>({ name: path.basename(p), path: p.replace(/\\\\/g,"/") })) : [],
  payments: { processor: process.env.PAYMENT_PROCESSOR || "fluidpay", adapters: [] as string[] },
  unresolved_references: []
};

const adaptersDir = path.join(root,"packages","payments-core","src","adapters");
if (exists(adaptersDir)) {
  report.payments.adapters = fs.readdirSync(adaptersDir)
    .filter(f=>/\.(ts|js)$/.test(f))
    .map(f=>f.replace(/\.(ts|js)$/,""));
}

process.stdout.write(JSON.stringify(report,null,2));
