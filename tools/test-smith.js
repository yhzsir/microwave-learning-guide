/* 史密斯圆图交互工具的核心数学验证
   校验 app.js 中 zToG / gToZ 的正反变换、驻波比与导纳读数是否与解析公式一致。

   用法： node tools/test-smith.js
*/
const fs = require('fs');
const path = require('path');

/* ---- 与 app.js initSmith() 内完全一致的实现（独立复制，避免依赖 DOM） ---- */
function zToG(r, x) {
  const d = (r + 1) * (r + 1) + x * x;
  return [(r * r - 1 + x * x) / d, (2 * x) / d];
}
function gToZ(gr, gi) {
  const d = (1 - gr) * (1 - gr) + gi * gi;
  if (d < 1e-12) return [Infinity, 0];
  return [(1 - gr * gr - gi * gi) / d, (2 * gi) / d];
}

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) pass++; else { fail++; fails.push(name + (detail ? '  → ' + detail : '')); }
}
function close(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 1e-9 : tol); }

/* ---- 1) Γ ← z 的解析对照 ---- */
const cases = [
  [1, 0], [0, 0], [2, 0], [0.5, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [0.5, 0.5], [2, -1], [3, 4], [0.2, 0.8], [5, -2]
];
for (const [r, x] of cases) {
  const [gr, gi] = zToG(r, x);
  const d = (r + 1) ** 2 + x ** 2;
  const er = (r * r - 1 + x * x) / d, ei = 2 * x / d;
  ok(`Γ(z=${r}${x >= 0 ? '+' : ''}${x}j)`, close(gr, er) && close(gi, ei),
    `得 (${gr},${gi}) 期望 (${er},${ei})`);
}

/* ---- 2) 特征点 ---- */
ok('匹配点 z=1 → Γ=0', (() => { const g = zToG(1, 0); return close(g[0], 0) && close(g[1], 0); })());
ok('短路点 z=0 → Γ=-1', (() => { const g = zToG(0, 0); return close(g[0], -1) && close(g[1], 0); })());
ok('z=0+j1 → Γ=+j1', (() => { const g = zToG(0, 1); return close(g[0], 0) && close(g[1], 1); })());
ok('|Γ|≤1（对所有无源负载）', cases.every(([r, x]) => Math.hypot(...zToG(r, x)) <= 1 + 1e-12));

/* ---- 3) 正反变换互逆 ---- */
let inv = true, invDetail = '';
for (const [r, x] of cases) {
  const [gr, gi] = zToG(r, x);
  const [r2, x2] = gToZ(gr, gi);
  if (!(close(r, r2, 1e-9) && close(x, x2, 1e-9))) {
    inv = false; invDetail = `z=${r}+${x}j → Γ=(${gr},${gi}) → z=${r2}+${x2}j`;
  }
}
ok('Γ→z 为 Γ←z 的逆变换', inv, invDetail);
ok('z→∞（开路）的 Γ→+1', (() => { const g = zToG(1e12, 0); return close(g[0], 1, 1e-6); })());
ok('Γ=+1 反变换得到 ∞', (() => { const z = gToZ(1, 0); return !isFinite(z[0]); })());

/* ---- 4) 驻波比 ---- */
ok('ρ = (1+|Γ|)/(1-|Γ|)', cases.every(([r, x]) => {
  const gm = Math.hypot(...zToG(r, x));
  if (gm >= 1) return true;
  const rho = (1 + gm) / (1 - gm);
  return isFinite(rho) && rho >= 1;
}));
ok('匹配时 ρ=1', (() => { const gm = Math.hypot(...zToG(1, 0)); return close((1 + gm) / (1 - gm), 1); })());
ok('z=2 → ρ=2', (() => {
  const gm = Math.hypot(...zToG(2, 0));
  return close((1 + gm) / (1 - gm), 2, 1e-12);
})());
ok('z=0.5 → ρ=2', (() => {
  const gm = Math.hypot(...zToG(0.5, 0));
  return close((1 + gm) / (1 - gm), 2, 1e-12);
})());
/* R_max/Z0 = ρ，R_min/Z0 = 1/ρ —— 波腹/波节读数 */
ok('波腹 R_max/Z0 = ρ', close((1 + Math.hypot(...zToG(3, 4))) / (1 - Math.hypot(...zToG(3, 4))), (() => {
  const gm = Math.hypot(...zToG(3, 4)); return (1 + gm) / (1 - gm);
})(), 1e-12));

/* ---- 5) 导纳为阻抗的旋转 180°（Γ → -Γ） ---- */
let adm = true, admDetail = '';
for (const [r, x] of cases) {
  if (!isFinite(r) || (r === 0 && x === 0)) continue;
  const [gr, gi] = zToG(r, x);
  const [g2, b2] = gToZ(-gr, -gi);          // 旋转 180°
  const zr = r, zx = x;
  const den = zr * zr + zx * zx;
  const er = zr / den, eb = -zx / den;       // y = 1/z
  if (!(close(g2, er, 1e-9) && close(b2, eb, 1e-9))) {
    adm = false; admDetail = `z=${zr}+${zx}j → 旋转得 y=${g2}+${b2}j，期望 ${er}+${eb}j`;
  }
}
ok('导纳 = Γ 旋转 180°（y = 1/z）', adm, admDetail);

/* ---- 6) 课件/指南中的典型读数对照（例 2.2、例 2.3） ---- */
/* 例 2.2：Z0=50, Zl=100 → z=2 → Γ=1/3, ρ=2 */
ok('例2.2：z=2 → |Γ|=1/3', close(Math.hypot(...zToG(2, 0)), 1 / 3, 1e-12));
ok('例2.2：z=2 → ρ=2', close((1 + Math.hypot(...zToG(2, 0))) / (1 - Math.hypot(...zToG(2, 0))), 2, 1e-12));
/* 例 2.3：Z0=50, Zl=40-j30 → z=0.8-j0.6 → |Γ|=1/3 */
ok('例2.3：z=0.8-j0.6 → |Γ|=1/3', close(Math.hypot(...zToG(0.8, -0.6)), 1 / 3, 1e-12));
/* 例 2.5：z=0.6+j0.8 → y = 0.6-j0.8 */
ok('例2.5：z=0.6+j0.8 → y=0.6-j0.8', (() => {
  const [gr, gi] = zToG(0.6, 0.8);
  const [g, b] = gToZ(-gr, -gi);
  return close(g, 0.6, 1e-9) && close(b, -0.8, 1e-9);
})());
/* 例 2.6：Z0=75, Z=50+j50 → z=(2/3)(1+j)
   Γ = (-1+2j)/(5+2j) = (-1+12j)/29 → |Γ| = √145/29 ≈ 0.4152，ρ ≈ 2.42 */
ok('例2.6：z=(2/3)(1+j) → |Γ|=√145/29≈0.4152',
  close(Math.hypot(...zToG(2 / 3, 2 / 3)), Math.sqrt(145) / 29, 1e-12),
  '得 ' + Math.hypot(...zToG(2 / 3, 2 / 3)) + ' 期望 ' + (Math.sqrt(145) / 29));
ok('例2.6：ρ≈2.42', close((1 + Math.hypot(...zToG(2 / 3, 2 / 3))) / (1 - Math.hypot(...zToG(2 / 3, 2 / 3))), 2.42, 0.005));
ok('例2.6：Γ 实部/虚部与解析式一致（(-1+j12)/29）', (() => {
  const [gr, gi] = zToG(2 / 3, 2 / 3);
  return close(gr, -1 / 29, 1e-12) && close(gi, 12 / 29, 1e-12);
})());
/* 单枝节匹配例：ρ=2 → 等 |Γ|=1/3 */
ok('单枝节例：ρ=2 对应 |Γ|=1/3', close(1 / 3, (2 - 1) / (2 + 1), 1e-12));

/* ---- 汇总 ---- */
console.log('史密斯圆图核心数学验证');
console.log('='.repeat(62));
console.log('  通过 ' + pass + ' 项，失败 ' + fail + ' 项');
if (fails.length) {
  console.log('\n  失败明细：');
  fails.forEach(f => console.log('    X ' + f));
}
console.log('='.repeat(62));
process.exit(fail ? 1 : 0);
