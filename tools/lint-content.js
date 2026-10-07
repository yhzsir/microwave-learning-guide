/* 内容质量校验：LaTeX 完整性、SVG id 唯一性、提示框标签合法性、标签配对 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'content');
const ALLOWED = new Set(['核心概念','公式推导','考点','易错点','工程应用','记忆技巧','思考','小结','小结与考点','分析','对比','复习要点','答题模板','课程信息','提示','核心思路']);
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md')).sort();
const rows = [];

for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const lines = src.split(/\r?\n/);
  const problems = [];
  const noCode = src.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const dollars = (noCode.match(/(?<!\\)\$/g) || []).length;
  if (dollars % 2 !== 0) problems.push('美元符号未配对（' + dollars + ' 个）');
  const dd = (noCode.match(/\$\$/g) || []).length;
  if (dd % 2 !== 0) problems.push('$$ 未配对（' + dd + ' 个）');

  // 注意顺序：本行若是 $$...$$ 的开标记同行式（如 "$$公式\tag{x}"），
  // 必须先让本行的开标记把状态置为「块内」，再判断 \tag。
  let inDisp = false, tagOutside = 0;
  for (const l of lines) {
    if (inDisp && /\\tag\{/.test(l)) { /* 块内，合法 */ }
    else if (!inDisp && /\\tag\{/.test(l) && !/^\s*\$\$[^$]*\\tag\{/.test(l)) tagOutside++;
    const marks = (l.match(/\$\$/g) || []).length;
    if (marks % 2 === 1) inDisp = !inDisp;
  }
  if (tagOutside) problems.push('\\tag 出现在 $$ 块外 ' + tagOutside + ' 处');

  const begins = (src.match(/\\begin\{(\w+)\}/g) || []).map(s => s.match(/\{(\w+)\}/)[1]);
  const ends = (src.match(/\\end\{(\w+)\}/g) || []).map(s => s.match(/\{(\w+)\}/)[1]);
  const bc = {}, ec = {};
  begins.forEach(b => bc[b] = (bc[b] || 0) + 1);
  ends.forEach(e => ec[e] = (ec[e] || 0) + 1);
  Object.keys(Object.assign({}, bc, ec)).forEach(k => {
    if ((bc[k] || 0) !== (ec[k] || 0)) problems.push('\\begin{' + k + '}x' + (bc[k] || 0) + ' != \\end{' + k + '}x' + (ec[k] || 0));
  });

  const ids = (src.match(/\sid="([^"]+)"/g) || []).map(s => s.match(/id="([^"]+)"/)[1]);
  const dupSet = Array.from(new Set(ids.filter((v, i) => ids.indexOf(v) !== i)));
  if (dupSet.length) problems.push('SVG id 重复: ' + dupSet.slice(0, 8).join(', ') + (dupSet.length > 8 ? ' ...' : ''));

  const refs = []; const re = /marker-(?:end|start)="url\(#([^)\s"]+)\)"/g; let m;
  while ((m = re.exec(src))) refs.push(m[1]);
  const missing = Array.from(new Set(refs)).filter(r => ids.indexOf(r) < 0);
  if (missing.length) problems.push('marker 引用缺失: ' + missing.join(', '));

  const labels = []; const re2 = /^\s*>\s*\*\*[【\[]([^】\]]+)[】\]]\*\*/gm; let m2;
  while ((m2 = re2.exec(src))) labels.push(m2[1].trim());
  const badLabels = labels.filter(l => !ALLOWED.has(l) && !/^例题\s/.test(l) && !/^阶段/.test(l) && !/^参考/.test(l) && !/^[0-9]/.test(l));
  if (badLabels.length) problems.push('未登记标签: ' + Array.from(new Set(badLabels)).join(' / '));

  if (!/^\uFEFF?---\r?\n[\s\S]*?\r?\n---/.test(src)) problems.push('缺少 front matter');
  ['title','minutes'].forEach(k => { if (!new RegExp('^' + k + ':', 'm').test(src)) problems.push('front matter 缺少 ' + k); });
  ['课件第','本AI','本 AI','作为一个AI','作为AI','as an AI','我是一个'].forEach(bad => {
    if (src.indexOf(bad) >= 0) problems.push('禁止表述「' + bad + '」');
  });

  const fences = (src.match(/^\s*(```|~~~)/gm) || []).length;
  if (fences % 2) problems.push('代码围栏未配对');
  const figOpen = (src.match(/<figure\b/g) || []).length, figClose = (src.match(/<\/figure>/g) || []).length;
  if (figOpen !== figClose) problems.push('<figure> ' + figOpen + ' != </figure> ' + figClose);
  const svgOpen = (src.match(/<svg\b/g) || []).length, svgClose = (src.match(/<\/svg>/g) || []).length;
  if (svgOpen !== svgClose) problems.push('<svg> ' + svgOpen + ' != </svg> ' + svgClose);
  const tblOpen = (src.match(/<table\b/g) || []).length, tblClose = (src.match(/<\/table>/g) || []).length;
  if (tblOpen !== tblClose) problems.push('<table> ' + tblOpen + ' != </table> ' + tblClose);

  const cn = (src.match(/[\u4e00-\u9fa5]/g) || []).length;
  const co = (src.match(/^\s*>\s*\*\*【/gm) || []).length;
  const ex = (src.match(/^\s*>\s*\*\*【例题/gm) || []).length;
  const tg = (src.match(/\\tag\{/g) || []).length;
  rows.push({ file: f, warn: false, problems: problems,
    stats: '汉字 ' + String(cn).padStart(6) + ' | SVG ' + String(svgOpen).padStart(2) +
      ' | 提示框 ' + String(co).padStart(3) + ' | 例题 ' + String(ex).padStart(2) +
      ' | 编号公式 ' + String(tg).padStart(3) });
  if (cn < 3000 && ['index.md','resources.md'].indexOf(f) < 0) {
    rows.push({ file: f, warn: true, problems: ['正文汉字偏少（' + cn + '）'], stats: null });
  }
}

console.log('内容结构校验');
console.log('='.repeat(106));
let tCn = 0, tSvg = 0, tCo = 0, tEx = 0, tTg = 0;
for (const r of rows) {
  if (!r.stats) continue;
  console.log('  ' + r.file.padEnd(15) + r.stats);
  tCn += parseInt(r.stats.match(/汉字\s+(\d+)/)[1], 10);
  tSvg += parseInt(r.stats.match(/SVG\s+(\d+)/)[1], 10);
  tCo += parseInt(r.stats.match(/提示框\s+(\d+)/)[1], 10);
  tEx += parseInt(r.stats.match(/例题\s+(\d+)/)[1], 10);
  tTg += parseInt(r.stats.match(/编号公式\s+(\d+)/)[1], 10);
}
console.log('-'.repeat(106));
console.log('  合计'.padEnd(17) + '汉字 ' + String(tCn).padStart(6) + ' | SVG ' + String(tSvg).padStart(2) +
  ' | 提示框 ' + String(tCo).padStart(3) + ' | 例题 ' + String(tEx).padStart(2) + ' | 编号公式 ' + String(tTg).padStart(3));
console.log('='.repeat(106));
const errs = rows.filter(r => r.problems.length && !r.warn);
const wrns = rows.filter(r => r.warn);
if (errs.length) {
  console.log('X 结构性问题 ' + errs.length + ' 处：');
  errs.forEach(r => console.log('   ' + r.file + ' -> ' + r.problems.join('; ')));
} else {
  console.log('OK 未发现结构性问题（LaTeX 配对 / $$ 块内 \\tag / SVG id 唯一性 / marker 引用 / 标签合法性 / 标签配对 全部通过）');
}
if (wrns.length) { console.log(''); console.log('提示 ' + wrns.length + ' 处：'); wrns.forEach(r => console.log('   ! ' + r.file + ' -> ' + r.problems.join('; '))); }
console.log('='.repeat(106));
process.exit(errs.length ? 1 : 0);