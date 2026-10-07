/* 统一显示公式排版：把「$$ 公式 \tag{...} $$」单行形式规范化为多行形式
     $$
     公式
     \tag{...}
     $$
   这样 \tag 位于显示块内部的独立行，语义最清晰、渲染最稳定。

   只处理同一行内既出现 $$ 开标记又出现 \tag 且 $$ 闭合的情况；
   保留块引用（> ）前缀。幂等：已规范化的内容不会再被改动。

   用法： node tools/normalize-equations.js [--dry]
*/
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content');
const DRY = process.argv.indexOf('--dry') >= 0;

let files = 0, total = 0;
const detail = [];

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.md')).sort()) {
  const p = path.join(DIR, f);
  const orig = fs.readFileSync(p, 'utf8');
  const lines = orig.split('\n');
  const out = [];
  let n = 0;
  let inDisp = false;

  for (const line of lines) {
    const pre = (/^\s*>\s?/.exec(line) || [''])[0];       // 块引用前缀，如 "> "
    const preT = pre.replace(/\s+$/, '');
    const raw = line.slice(pre.length);

    const marks = (raw.match(/\$\$/g) || []).length;
    const isInlinePair = !inDisp && marks === 2 && /^\s*\$\$/.test(raw) && /\\tag\{/.test(raw);

    if (isInlinePair) {
      const closeIdx = raw.indexOf('$$', 2);
      const expr = raw.slice(2, closeIdx).trim();
      const tail = raw.slice(closeIdx + 2);
      const m = /\\tag\{[^}]*\}/.exec(expr);
      if (m) {
        const before = expr.slice(0, m.index).trim();
        const after = expr.slice(m.index + m[0].length).trim();
        out.push(preT);
        out.push(preT + '$$');
        if (before) out.push(preT + before);
        out.push(preT + m[0]);
        if (after) out.push(preT + after);
        out.push(preT + '$$');
        if (tail.trim()) out.push(pre + tail.trim());
        n++; total++;
        continue;
      }
    }

    if (marks % 2 === 1) inDisp = !inDisp;
    out.push(line);
  }

  if (out.join('\n') !== orig) {
    files++;
    if (!DRY) fs.writeFileSync(p, out.join('\n'), 'utf8');
    detail.push([f, n]);
  }
}

console.log((DRY ? '[预演] ' : '') + '显示公式规范化（$$...\\tag{}...$$ → 多行形式）');
console.log('='.repeat(66));
detail.forEach(([f, n]) => console.log('  ' + f.padEnd(16) + n + ' 处'));
console.log('-'.repeat(66));
console.log('  涉及 ' + files + ' 个文件，共规范化 ' + total + ' 处');
console.log('='.repeat(66));
