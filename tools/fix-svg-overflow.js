/* 修复 SVG 内 <text> 越界：保证文字不被 viewBox 裁剪。
   策略（按优先级）：
     1) 起始 x < 8      → 平移到 x = 8；
     2) 右端超出 viewBox → 先尝试整体加宽 viewBox 宽度（保持其它元素绝对坐标不变）；
     3) 加宽幅度过大（>35%）或加宽仍不够 → 按比例缩小该元素 font-size（下限 9.5）；
     4) 最后仍不够 → 收紧 letter-spacing（负值）并在报告中标注，供人工复核。
   用法： node tools/fix-svg-overflow.js [--dry]
*/
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content');
const DRY = process.argv.indexOf('--dry') >= 0;

/* 宽度模型：ASCII 0.55em，CJK/全角 1.0em —— 偏保守（高估），保证不裁剪 */
function textWidth(str, fs) {
  let w = 0;
  for (const ch of str) {
    w += ch.codePointAt(0) < 0x2E80 ? 0.55 : 1.0;
  }
  return w * fs;
}
function plain(inner) {
  return inner.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

const report = [];
let filesChanged = 0;

for (const f of fs.readdirSync(DIR).filter(x => x.endsWith('.md')).sort()) {
  const p = path.join(DIR, f);
  const orig = fs.readFileSync(p, 'utf8');

  const src = orig.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg, svgOffset) => {
    const vbM = /viewBox="([\d.\-\s]+)"/.exec(svg);
    if (!vbM) return svg;
    const parts = vbM[1].trim().split(/\s+/).map(Number);
    const [VX, VY, VW, VH] = parts;

    let needW = VW;         // 需要的宽度
    const fixes = [];       // 本 SVG 内的文字修正记录

    // 先分析
    const texts = [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
    const plans = [];
    for (const m of texts) {
      const attrs = m[1];
      const inner = m[2];
      const plainTxt = plain(inner);
      if (!plainTxt.trim()) continue;
      const fs_ = parseFloat((/font-size="([\d.]+)"/.exec(attrs) || [0, '12'])[1]);
      const anchor = (/text-anchor="(\w+)"/.exec(attrs) || [0, 'start'])[1];
      const x = parseFloat((/\bx="([\d.\-]+)"/.exec(attrs) || [0, '0'])[1]);
      const w = textWidth(plainTxt, fs_);
      const x0 = anchor === 'middle' ? x - w / 2 : (anchor === 'end' ? x - w : x);
      const x1 = x0 + w;
      plans.push({ m, attrs, inner, plainTxt, fs: fs_, anchor, x, w, x0, x1 });
      if (x1 + 4 > needW) needW = x1 + 4;
    }
    if (!plans.length) return svg;

    // 判断是否需要加宽 / 移位
    const growth = (needW - VW) / VW;
    const useGrow = growth > 0 && growth <= 0.35;

    // 生成新 text 元素
    let out = svg;
    for (const pl of plans) {
      let newAttrs = pl.attrs;
      let newInner = pl.inner;
      const edits = [];

      // 1) 起始 x 过小 → 平移
      if (pl.x0 < 4 && pl.anchor !== 'middle') {
        const shift = 8 - pl.x0;
        newAttrs = newAttrs.replace(/\bx="([\d.\-]+)"/, (mm, v) => 'x="' + (Math.round((parseFloat(v) + shift) * 10) / 10) + '"');
        edits.push('x+' + Math.round(shift * 10) / 10);
      }

      // 2) 若未采用加宽，则需要缩字
      if (!useGrow) {
        const avail = VW - 4 - (pl.x0 < 4 ? 8 : pl.x0);
        if (pl.w > avail && avail > 20) {
          let newFs = Math.max(9.5, Math.floor((pl.fs * avail / pl.w) * 10) / 10);
          if (newFs < pl.fs) {
            newAttrs = newAttrs.replace(/font-size="[\d.]+"/, 'font-size="' + newFs + '"');
            edits.push('fs ' + pl.fs + '→' + newFs);
            pl.fs = newFs;
            pl.w = pl.w * newFs / pl.fs;
          }
        }
        // 仍然不够 → 收紧字距
        const avail2 = VW - 4 - (pl.x0 < 4 ? 8 : pl.x0);
        if (pl.w > avail2 && !/letter-spacing/.test(newAttrs)) {
          const shrink = Math.max(-0.6, (avail2 / pl.w - 1) * pl.fs / Math.max(1, pl.plainTxt.length));
          if (shrink < -0.05) {
            newAttrs = newAttrs.replace(/>$/, '') + ' letter-spacing="' + (Math.round(shrink * 100) / 100) + '">';
            newAttrs = newAttrs.replace(/([^>])>$/, '$1>');
            edits.push('ls' + (Math.round(shrink * 100) / 100));
          }
        }
      }

      if (edits.length) {
        fixes.push({ txt: pl.plainTxt.slice(0, 46), edits });
        const rebuilt = '<text' + newAttrs + '>' + newInner + '</text>';
        out = out.replace(pl.m[0], rebuilt);
      }
    }

    // 3) 加宽 viewBox
    if (useGrow) {
      const newVW = Math.ceil(needW);
      out = out.replace(vbM[0], 'viewBox="' + VX + ' ' + VY + ' ' + newVW + ' ' + VH + '"');
      fixes.push({ txt: '（viewBox 加宽）', edits: [VW + '→' + newVW] });
    }

    if (fixes.length) report.push({ f, fixes });
    return out;
  });

  if (src !== orig) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(p, src, 'utf8');
  }
}

console.log((DRY ? '[预演] ' : '') + 'SVG <text> 越界修复');
console.log('='.repeat(96));
if (!report.length) console.log('  无需修复');
else {
  const byFile = {};
  report.forEach(r => (byFile[r.f] = byFile[r.f] || []).push(...r.fixes));
  Object.keys(byFile).forEach(f => {
    console.log('\n  ' + f + '  (' + byFile[f].length + ' 处)');
    byFile[f].forEach(x => console.log('    [' + x.edits.join(', ') + ']  「' + x.txt + '」'));
  });
  console.log('\n  涉及 ' + filesChanged + ' 个文件');
}
console.log('='.repeat(96));
