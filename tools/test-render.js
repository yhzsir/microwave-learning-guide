/* 渲染管线离线测试：用 Node 加载 assets/js/app.js，验证 Markdown→HTML 结果
   用法：node tools/test-render.js
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'app.js'), 'utf8');

// ---- 最小 DOM 桩（必须支持 outerHTML，app.js 用它把提示框序列化为字符串） ----
function mkEl(tag) {
  const e = {
    tagName: (tag || 'div').toUpperCase(),
    className: '', id: '', _html: '', textContent: '', style: {},
    children: [], attributes: {},
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = v; },
    get outerHTML() {
      var inner = this._html || this.children.map(function (c) { return c.outerHTML || ''; }).join('');
      var cls = this.className ? ' class="' + this.className + '"' : '';
      return '<' + this.tagName.toLowerCase() + cls + '>' + inner + '</' + this.tagName.toLowerCase() + '>';
    },
    appendChild(c) { this.children.push(c); return c; },
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    addEventListener() {}, removeEventListener() {}, remove() {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getContext() { return null; },
    closest() { return null; },
    contains() { return false; }
  };
  return e;
}
const doc = {
  readyState: 'complete',
  documentElement: mkEl('html'),
  body: mkEl('body'),
  head: mkEl('head'),
  createElement: mkEl,
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  title: ''
};
const win = {
  document: doc,
  location: { pathname: '/index.html', href: '' },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {},
  setTimeout, clearTimeout, requestAnimationFrame: (f) => setTimeout(f, 0),
  fetch: () => Promise.reject(new Error('no fetch in test')),
  console,
  // 注意：app.js 内部声明了 var Math = {...}，会遮蔽全局 Math，
  // 因此必须显式提供一个真正的 Math 对象供内部使用。
  JSON, Object, Array, String, Number, Boolean, RegExp, Date, Error, Promise, Symbol,
  IntersectionObserver: function () { this.observe = () => {}; this.disconnect = () => {}; },
  CustomEvent: function () {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: { clipboard: null }
};
win.Math = Math;
win.parseInt = parseInt;
win.parseFloat = parseFloat;
win.isFinite = isFinite;
win.isNaN = isNaN;
win.window = win;
win.self = win;
win.globalThis = win;

const ctx = vm.createContext(win);
vm.runInContext(APP, ctx, { filename: 'app.js' });
const G = ctx.MWGuide;
if (!G) { console.error('✗ MWGuide 未导出'); process.exit(1); }

// ---- 断言工具 ----
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? '  →  ' + detail : '')); }
}

// ---- 测试用例 ----
const md = [
  '---',
  'chapter: 2',
  'title: 测试',
  '---',
  '',
  '# 一级标题（应被隐藏）',
  '',
  '## 2.1 小节标题',
  '',
  '正文包含行内公式 $Z_0=\\sqrt{L/C}$ 与**粗体**、*斜体*、`code`。',
  '',
  '$$',
  'Z_{\\mathrm{in}}=Z_0\\frac{Z_l+jZ_0\\tan\\beta z}{Z_0+jZ_l\\tan\\beta z}',
  '\\tag{2-3-4}',
  '$$',
  '',
  '> **【核心概念】**',
  '> 这是一个核心概念框，含公式 $\\Gamma_l=\\dfrac{Z_l-Z_0}{Z_l+Z_0}$。',
  '>',
  '> 第二段。',
  '',
  '> **【例题 2-1】**',
  '> 题目：求输入阻抗。',
  '>',
  '> **解：** $Z_{\\mathrm{in}}=50-j50\\ \\Omega$。',
  '',
  '> **【易错点】**',
  '> 注意 $\\tan\\beta z$ 在 $\\beta z=\\pi/2$ 处发散。',
  '',
  '> 这是一个普通引用块，不是提示框。',
  '',
  '| 名称 | 符号 | 单位 |',
  '|---|---|---|',
  '| 特性阻抗 | $Z_0$ | $\\Omega$ |',
  '| 相移常数 | $\\beta$ | $\\mathrm{rad/m}$ |',
  '',
  '<figure class="fig">',
  '<svg viewBox="0 0 100 60"><rect x="1" y="1" width="98" height="58" fill="var(--brand)"/></svg>',
  '<figcaption>图 2-1　测试图</figcaption>',
  '</figure>',
  '',
  '- 列表项一',
  '- 列表项二',
  '  - 嵌套项',
  '',
  '1. 有序项一',
  '2. 有序项二',
  '',
  '---',
  '',
  '## 本章小结',
  '',
  '结尾段落。'
].join('\n');

const html = G.renderMD(md);

// 逐项断言
check('隐藏首个 h1', !/<h1[^>]*>[\s\S]*?一级标题[\s\S]*?<\/h1>/.test(html), html.slice(0, 200));
check('渲染 h2 并带 id', /<h2 id="[^"]+">2\.1 小节标题<\/h2>/.test(html));
check('行内公式转 \\(...\\)', html.includes('\\(Z_0=\\sqrt{L/C}\\)'));
check('独立公式转 \\[...\\]', html.includes('\\[') && html.includes('\\tag{2-3-4}'));
check('公式内容未被 Markdown 破坏（下划线/星号）',
  !/Z_\{?\\?mathrm\{in\}<\/em>/.test(html) && /Z_\{\\mathrm\{in\}\}/.test(html));
check('提示框：核心概念', /callout--concept/.test(html) && /【?核心概念】?/.test(html));
check('提示框：例题', /callout--example/.test(html) && /例题 2-1/.test(html));
check('提示框：易错点', /callout--pitfall/.test(html));
check('普通引用保留为 blockquote', /<blockquote>[\s\S]*普通引用块[\s\S]*<\/blockquote>/.test(html));
check('表格被包裹', /<div class="table-wrap">\s*<table>/.test(html));
check('表格无重复包裹', !/<div class="table-wrap">\s*<div class="table-wrap">/.test(html));
check('表格行数正确', (html.match(/<tr>/g) || []).length === 3, 'tr=' + (html.match(/<tr>/g) || []).length);
check('SVG 未被转义', html.includes('<svg viewBox="0 0 100 60">'), html.match(/&lt;svg/));
check('SVG 未被包进 <p>', !/<p>\s*<svg/.test(html));
check('figcaption 保留', html.includes('<figcaption>图 2-1　测试图</figcaption>'));
check('无序列表', /<ul>/.test(html) && /<li>列表项一<\/li>/.test(html));
check('有序列表', /<ol>/.test(html) && /<li>有序项一<\/li>/.test(html));
check('水平线', /<hr>/.test(html));
check('粗体/斜体/代码', /<strong>粗体<\/strong>/.test(html) && /<em>斜体<\/em>/.test(html) && /<code>code<\/code>/.test(html));
check('未残留占位符', !/\u0001MJ|\u0003B/.test(html), JSON.stringify(html.match(/\u0001MJ\d+MJ\u0001|\u0003B\d+B\u0003/g)));
check('无未替换的 front matter', !html.includes('chapter: 2'));

// ---- 用真实内容文件做冒烟测试 ----
const contentDir = path.join(ROOT, 'content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
console.log('\n--- 真实内容冒烟测试 ---');
let totalSvg = 0, totalCallout = 0, totalTag = 0, totalTable = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(contentDir, f), 'utf8');
  const out = G.renderMD(src);
  const svg = (out.match(/<svg\b/g) || []).length;
  const co = (out.match(/class="callout callout--/g) || []).length;
  const tg = (out.match(/\\tag\{/g) || []).length;
  const tb = (out.match(/class="table-wrap"/g) || []).length;
  const esc = (out.match(/&lt;svg/g) || []).length;
  const ph = (out.match(/\u0001MJ|\u0003B/g) || []).length;
  const pipes = (out.match(/\|/g) || []).length;
  totalSvg += svg; totalCallout += co; totalTag += tg; totalTable += tb;
  const bad = [];
  if (esc > 0) bad.push('SVG被转义×' + esc);
  if (ph > 0) bad.push('残留占位符×' + ph);
  if (co === 0 && f !== 'index.md' && f !== 'resources.md') bad.push('无提示框');
  console.log(
    ('  ' + f).padEnd(16) +
    ' SVG ' + String(svg).padStart(3) +
    ' | 提示框 ' + String(co).padStart(4) +
    ' | 公式编号 ' + String(tg).padStart(4) +
    ' | 表格 ' + String(tb).padStart(3) +
    ' | 残留竖线 ' + String(pipes).padStart(3) +
    (bad.length ? '  ✗ ' + bad.join(', ') : '  ✓')
  );
  if (bad.length) { fail += bad.length; failures.push(f + ': ' + bad.join(', ')); }
}
console.log('\n合计：SVG ' + totalSvg + ' 幅，提示框 ' + totalCallout + ' 个，编号公式 ' + totalTag + ' 条，表格 ' + totalTable + ' 个');

// ---- 汇总 ----
console.log('\n===============================');
console.log('  通过 ' + pass + ' 项，失败 ' + fail + ' 项');
if (failures.length) { console.log('\n失败明细：'); failures.forEach(f => console.log('  ✗ ' + f)); }
console.log('===============================');
process.exit(fail ? 1 : 0);
