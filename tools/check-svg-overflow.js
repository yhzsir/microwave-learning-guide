/* 检查内联 SVG 中 <text> 是否超出 viewBox 宽度（粗估：CJK 按字号，ASCII 按 0.56×字号） */
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..', 'content');
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(DIR).filter(f => f.endsWith('.md'));
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, path.basename(f)), 'utf8');
  const svgs = src.match(/<svg[\s\S]*?<\/svg>/g) || [];
  svgs.forEach((svg, i) => {
    const vb = (svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) || []);
    const W = vb[1] ? parseFloat(vb[1]) : 720;
    const H = vb[2] ? parseFloat(vb[2]) : 300;
    const texts = svg.match(/<text[^>]*>[\s\S]*?<\/text>/g) || [];
    for (const t of texts) {
      const x = parseFloat((t.match(/x="([-\d.]+)"/) || [0, 0])[1]);
      const y = parseFloat((t.match(/y="([-\d.]+)"/) || [0, 0])[1]);
      const fs2 = parseFloat((t.match(/font-size="([\d.]+)"/) || [0, 12])[1]) || 12;
      const anchor = (t.match(/text-anchor="(\w+)"/) || [0, 'start'])[1];
      const content = t.replace(/^<text[^>]*>/, '').replace(/<\/text>$/, '')
        .replace(/&[a-z]+;/g, 'x');
      let w = 0;
      for (const ch of content) w += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? fs2 : fs2 * 0.56;
      let x0 = x, x1 = x + w;
      if (anchor === 'middle') { x0 = x - w / 2; x1 = x + w / 2; }
      if (anchor === 'end') { x0 = x - w; x1 = x; }
      if (x0 < -2 || x1 > W + 2 || y > H + 2 || y < 0) {
        bad++;
        console.log(`${path.basename(f)} svg#${i + 1} y=${y} x0=${x0.toFixed(0)} x1=${x1.toFixed(0)} W=${W} H=${H} :: ${content.slice(0, 60)}`);
      }
    }
  });
}
console.log(bad ? `\n共 ${bad} 处可能溢出` : '\n未发现文字溢出');
