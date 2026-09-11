const fs = require("fs");
function readJsonLoose(p){
  let s = fs.readFileSync(p,"utf8");
  // strip BOM
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  // trim anything before first { or [
  const i = Math.min(...["{","["].map(ch=>{ const k=s.indexOf(ch); return k<0?1e9:k;}));
  if (i===1e9) throw new Error("No JSON start found in "+p);
  s = s.slice(i);
  return JSON.parse(s);
}
module.exports = { readJsonLoose };
