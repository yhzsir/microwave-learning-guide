/* 把 content/*.md 中 <svg> 内 <text> 元素的 $...$ 数学表达式
   转换为 Unicode 纯文本（SVG 内 MathJax 不排版，必须用纯文本）。

   设计原则：
   1. 只修改 <svg>...</svg> 内部 <text>...</text> 的文本内容，绝不动正文公式；
   2. 采用「全标记」策略：任何未被规则识别的 LaTeX 命令都保留原样并计入报告，
      以便人工复核（宁可报告，不可静默产出畸形文本）；
   3. 幂等：已转换的文本不再含 $，重复运行无副作用。

   用法： node tools/fix-svg-math.js [--dry]
*/
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content');
const DRY = process.argv.indexOf('--dry') >= 0;

/* ---------- 符号表 ---------- */
const GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', Gamma: 'Γ', delta: 'δ', Delta: 'Δ',
  epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', Theta: 'Θ',
  kappa: 'κ', lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  Pi: 'Π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', phi: 'φ', varphi: 'φ',
  Phi: 'Φ', chi: 'χ', psi: 'ψ', Psi: 'Ψ', omega: 'ω', Omega: 'Ω'
};
const SYM = {
  times: '×', div: '÷', pm: '±', mp: '∓', cdot: '·', cdots: '⋯', ldots: '…',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈',
  equiv: '≡', sim: '∼', propto: '∝', infty: '∞', rightarrow: '→', to: '→',
  Rightarrow: '⇒', leftarrow: '←', leftrightarrow: '↔', longrightarrow: '⟶',
  Longrightarrow: '⟹', implies: '⟹', iff: '⟺', Leftrightarrow: '⇔',
  partial: '∂', nabla: '∇', int: '∫', oint: '∮', sum: 'Σ', prod: 'Π',
  sqrt: '√', angle: '∠', perp: '⊥', parallel: '∥', in: '∈', notin: '∉',
  subset: '⊂', cup: '∪', cap: '∩', empty: '∅', forall: '∀', exists: '∃',
  Re: 'Re', Im: 'Im', quad: '  ', qquad: '    ', ',': ' ', ';': ' ', '!': '',
  ll: '≪', gg: '≫', simeq: '≃', cong: '≅', therefore: '∴', because: '∵',
  /* 数学函数名：原样输出，后接参数时加空格分隔 */
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
  arcsin: 'arcsin', arccos: 'arccos', arctan: 'arctan',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh',
  log: 'log', ln: 'ln', lg: 'lg', exp: 'exp', lim: 'lim',
  max: 'max', min: 'min', det: 'det', sgn: 'sgn', mod: 'mod', abs: 'abs',
  sinc: 'sinc', erf: 'erf'
};
const SUB = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆',
  '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍',
  ')': '₎', a: 'ₐ', e: 'ₑ', n: 'ₙ', o: 'ₒ', x: 'ₓ', c: 'c', i: 'ᵢ',
  j: 'ⱼ', m: 'ₘ', g: 'g', p: 'ₚ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', w: 'w', z: 'z'
};
const SUP = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶',
  '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽',
  ')': '⁾', n: 'ⁿ', i: 'ⁱ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ',
  g: 'ᵍ', j: 'ʲ', k: 'ᵏ', m: 'ᵐ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ',
  u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ', '′': '′'
};
/* \mathrm{...} / \text{...} 内部允许的字符直通映射 */
const PLAIN = { in: 'in', max: 'max', min: 'min', TE: 'TE', TM: 'TM', TEM: 'TEM', Re: 'Re', Im: 'Im' };

const unrecognized = new Map();

/* ---------- 花括号配对 ---------- */
function matchBrace(s, i) {
  if (s[i] !== '{') return -1;
  let d = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '\\') { k++; continue; }
    if (s[k] === '{') d++;
    else if (s[k] === '}') { d--; if (d === 0) return k; }
  }
  return -1;
}

/* 取出紧跟在 i 之后的 {...} 或单字符 */
function arg(s, i) {
  while (s[i] === ' ') i++;
  if (s[i] === '{') {
    const e = matchBrace(s, i);
    if (e < 0) return null;
    return { body: s.slice(i + 1, e), next: e + 1 };
  }
  if (i < s.length) return { body: s[i], next: i + 1 };
  return null;
}

/* 下标/上标转换：尽量用 Unicode，做不到就用普通字符 */
function toScript(body, table, fallback) {
  if (body === '') return '';
  let out = '';
  for (const ch of body) {
    if (table[ch] !== undefined) out += table[ch];
    else if (/^[0-9]$/.test(ch)) out += ch;
    else return fallback + body;   // 有不可映射字符 → 退化为括号写法
  }
  return out;
}

/* ---------- 主转换 ---------- */
function convert(tex) {
  let s = tex;
  let out = '';
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    /* 反斜杠命令 */
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      if (!m) { out += c; i++; continue; }
      const name = m[1];
      let j = i + m[0].length;

      /* 显式间距 */
      if (name === ',' || name === ';' || name === ':' || name === '!' || name === ' ') { i = j; continue; }

      /* 结构命令 */
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const a = arg(s, j); if (!a) { out += name; i = j; continue; }
        const b = arg(s, a.next); if (!b) { out += name; i = j; continue; }
        const A = convert(a.body), B = convert(b.body);
        var simpleA = /^[A-Za-zα-ωΑ-Ω0-9]+$/.test(A), simpleB = /^[A-Za-zα-ωΑ-Ω0-9]+$/.test(B);
        out += (simpleA && simpleB) ? (A + '/' + B)
             : (simpleA ? A + '/(' + B + ')' : (simpleB ? '(' + A + ')/' + B : '(' + A + ')/(' + B + ')'));
        i = b.next; continue;
      }
      if (name === 'sqrt') {
        const a = arg(s, j); if (!a) { out += '√'; i = j; continue; }
        out += '√(' + convert(a.body) + ')'; i = a.next; continue;
      }
      if (name === 'text' || name === 'mathrm' || name === 'operatorname' || name === 'mbox' || name === 'mathbf' || name === 'boldsymbol' || name === 'mathit') {
        const a = arg(s, j); if (!a) { out += name; i = j; continue; }
        out += convert(a.body); i = a.next; continue;
      }
      if (name === 'boxed' || name === 'left' || name === 'right' || name === 'displaystyle' || name === 'limits') {
        const a = name === 'left' || name === 'right' ? null : arg(s, j);
        if (a) { out += convert(a.body); i = a.next; } else { i = j; }
        continue;
      }
      if (name === 'hat' || name === 'bar' || name === 'vec' || name === 'tilde' || name === 'dot') {
        const a = arg(s, j); if (!a) { i = j; continue; }
        const mark = { hat: '^', bar: '̄', vec: '→', tilde: '~', dot: '·' }[name];
        out += convert(a.body) + mark; i = a.next; continue;
      }
      if (name === 'begin' || name === 'end') {
        const a = arg(s, j);
        i = a ? a.next : j;
        if (name === 'begin') out += '[ ';
        else out += ' ]';
        continue;
      }
      /* 换行/对齐命令：转成空格 */
      if (name === '\\' || name === 'cr' || name === 'newline') { out += ' '; i = j; continue; }

      /* 希腊字母 */
      if (GREEK[name]) { out += GREEK[name]; i = j; continue; }
      /* 符号 */
      if (SYM[name] !== undefined) { out += SYM[name]; i = j; continue; }

      /* 未识别：原样保留（去掉反斜杠更易读）并记录 */
      unrecognized.set(name, (unrecognized.get(name) || 0) + 1);
      out += name;
      i = j;
      continue;
    }

    /* 下标 */
    if (c === '_') {
      const a = arg(s, i + 1);
      if (a) {
        const body = a.body;
        /* 纯单字符数字/字母 → Unicode 下标；否则退化为普通文本 */
        if (/^[0-9]{1,2}$/.test(body) || /^[a-zA-Z]$/.test(body)) {
          const conv = toScript(body, SUB, '');
          if (conv) { out += conv; i = a.next; continue; }
        }
        /* 多字符下标：TEmn 之类的缩写整体输出，不加括号以保持图内紧凑 */
        if (body === 'c') { out += 'c'; i = a.next; continue; }
        out += body; i = a.next; continue;
      }
      i++; continue;
    }

    /* 上标 */
    if (c === '^') {
      const a = arg(s, i + 1);
      if (a) {
        if (/^[0-9]{1,2}$/.test(a.body) || /^[a-zA-Z]$/.test(a.body) || /^[+-]$/.test(a.body)) {
          const conv = toScript(a.body, SUP, '');
          if (conv) { out += conv; i = a.next; continue; }
        }
        out += '^' + a.body; i = a.next; continue;
      }
      i++; continue;
    }

    /* 花括号：直接剥掉（其内容已由命令处理） */
    if (c === '{' || c === '}') { i++; continue; }

    /* 普通字符 */
    out += c;
    i++;
  }

  /* 收尾整理 */
  out = out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:)])/g, '$1')
    .replace(/\\/g, '')
    .trim();
  return out;
}

/* ---------- 处理文件 ---------- */
let totalFiles = 0, totalExpr = 0, totalSvg = 0;
const perFile = [];

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.md')).sort()) {
  const p = path.join(DIR, f);
  let src = fs.readFileSync(p, 'utf8');
  let fileExpr = 0;
  const orig = src;

  src = src.replace(/<svg\b[\s\S]*?<\/svg>/g, svgBlock => {
    totalSvg++;
    return svgBlock.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (whole, attrs, inner) => {
      if (inner.indexOf('$') < 0) return whole;
      const converted = inner.replace(/(?<!\\)\$([^$\n]+)\$/g, (mm, tex) => {
        fileExpr++;
        return convert(tex);
      });
      return '<text' + attrs + '>' + converted + '</text>';
    });
  });

  if (src !== orig) {
    totalFiles++;
    if (!DRY) fs.writeFileSync(p, src, 'utf8');
  }
  totalExpr += fileExpr;
  perFile.push([f, fileExpr]);
}

console.log((DRY ? '[预演] ' : '') + 'SVG 图内公式 → Unicode 转换');
console.log('='.repeat(72));
perFile.forEach(([f, n]) => console.log('  ' + f.padEnd(16) + (n ? n + ' 处已转换' : '—')));
console.log('-'.repeat(72));
console.log('  涉及文件 ' + totalFiles + ' 个，转换表达式 ' + totalExpr + ' 处，扫描 <svg> ' + totalSvg + ' 个');

/* 复检：SVG 内是否还有残留 $ */
let residual = 0;
for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.md'))) {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  const re = /<svg\b[\s\S]*?<\/svg>/g; let m;
  while ((m = re.exec(s))) residual += (m[0].match(/\$/g) || []).length;
}
console.log('  复检：SVG 内残留 $ 符号 ' + residual + ' 个');

if (unrecognized.size) {
  console.log('\n未识别的 LaTeX 命令（已原样保留，建议人工核对）：');
  [...unrecognized.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('   ' + k + '  ×' + v));
} else {
  console.log('\n所有 LaTeX 命令均已识别。');
}
console.log('='.repeat(72));
