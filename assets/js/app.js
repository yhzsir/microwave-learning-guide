/* ==========================================================================
   微波技术基础 · 在线学习指南  —  站点引擎
   纯静态：Markdown + MathJax + 自研提示框 / 目录 / 搜索 / 主题
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 0. 站点数据
   * ------------------------------------------------------------------ */
  var BASE = (function () {
    // 支持 /microwave-learning-guide/ 子路径部署
    var p = location.pathname;
    var i = p.indexOf('/content/');
    if (i >= 0) return p.slice(0, i + 1);
    return p.replace(/[^/]*$/, '');
  })();

  var CHAPTERS = [
    { n: 1, file: 'ch01', title: '绪论——微波与微波技术', short: '绪论', minutes: 60 },
    { n: 2, file: 'ch02', title: '均匀传输线理论', short: '传输线理论', minutes: 300 },
    { n: 3, file: 'ch03', title: '规则金属波导', short: '金属波导', minutes: 300 },
    { n: 4, file: 'ch04', title: '微波传输线', short: '传输线类型', minutes: 220 },
    { n: 5, file: 'ch05', title: '微波网络基础', short: '微波网络', minutes: 240 },
    { n: 6, file: 'ch06', title: '微波无源器件', short: '无源器件', minutes: 200 },
    { n: 7, file: 'ch07', title: '专题推导一：无耗网络 [Z] 矩阵', short: '专题·Z 矩阵', minutes: 90 },
    { n: 8, file: 'ch08', title: '专题推导二：网络对称性与 [S] 矩阵', short: '专题·S 矩阵', minutes: 90 }
  ];

  var CALLOUTS = {
    '核心概念': { cls: 'concept', icon: 'book' },
    '公式推导': { cls: 'derive', icon: 'sigma' },
    '考点': { cls: 'exam', icon: 'target' },
    '易错点': { cls: 'pitfall', icon: 'alert' },
    '工程应用': { cls: 'app', icon: 'chip' },
    '记忆技巧': { cls: 'mnemonic', icon: 'bulb' },
    '思考': { cls: 'think', icon: 'help' },
    '小结': { cls: 'summary', icon: 'list' },
    '小结与考点': { cls: 'summary', icon: 'list' }
  };
  var EXAM_RE = /^例题\s*([0-9]+[-–—][0-9]+|[0-9]+(?:\.[0-9]+)?)/;

  var ICONS = {
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v18H5.5A1.5 1.5 0 0 1 4 19.5v-15Z"/><path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H13v18h5.5a1.5 1.5 0 0 0 1.5-1.5v-15Z"/>',
    sigma: '<path d="M18 4H6l6 8-6 8h12"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    alert: '<path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M11 3v4M13 3v4M11 17v4M13 17v4M3 11h4M3 13h4M17 11h4M17 13h4"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.7"/><path d="M12 17.2h.01"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5.5 18h.01"/>',
    check: '<path d="M4 12.5 9.5 18 20 7"/>'
  };
  function icon(name, size) {
    var p = ICONS[name] || ICONS.book;
    return '<svg class="ci" width="' + (size || 15) + '" height="' + (size || 15) + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 1. 数学保护器
   *    把 $...$ / $$...$$ 抽成占位符，避免被 Markdown 破坏，
   *    渲染完成后再还原，交给 MathJax 排版。
   * ------------------------------------------------------------------ */
  var MathGuard = (function () {
    var store = [];
    function token(i) { return '\u0001MJ' + i + 'MJ\u0001'; }

    function protect(src) {
      store = [];
      var out = '';
      var i = 0, n = src.length;
      while (i < n) {
        var c = src[i];
        // 代码块 / 行内代码：原样保留
        if (c === '`') {
          var ticks = 0, j = i;
          while (j < n && src[j] === '`') { ticks++; j++; }
          var close = src.indexOf(new Array(ticks + 1).join('`'), j);
          if (close < 0) { out += src.slice(i); break; }
          out += src.slice(i, close + ticks);
          i = close + ticks;
          continue;
        }
        // 转义 \$ 不处理
        if (c === '\\' && src[i + 1] === '$') { out += '\\$'; i += 2; continue; }

        if (c === '$') {
          var disp = src[i + 1] === '$';
          var open = disp ? '$$' : '$';
          var k = i + open.length;
          var end = -1;
          while (k < n) {
            if (src[k] === '\\') { k += 2; continue; }
            if (disp) {
              if (src[k] === '$' && src[k + 1] === '$') { end = k; break; }
            } else {
              if (src[k] === '$') { end = k; break; }
              if (src[k] === '\n') break;           // 行内公式不跨行
            }
            k++;
          }
          if (end < 0) { out += c; i++; continue; }
          var body = src.slice(i + open.length, end);
          if (!body.trim()) { out += c; i++; continue; }
          store.push({ d: disp, b: body });
          out += token(store.length - 1);
          i = end + open.length;
          continue;
        }
        out += c;
        i++;
      }
      return out;
    }

    function restore(html) {
      return html.replace(/\u0001MJ(\d+)MJ\u0001/g, function (m, idx) {
        var it = store[+idx];
        if (!it) return m;
        return it.d ? '\\[' + it.b + '\\]' : '\\(' + it.b + '\\)';
      });
    }

    // 从源码中提取纯文本（用于搜索索引），公式保留可读形式
    function plain(src) {
      return src
        .replace(/\$\$([\s\S]*?)\$\$/g, ' $1 ')
        .replace(/\$([^$\n]+)\$/g, ' $1 ')
        .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[`*_>#|]/g, ' ')
        .replace(/\s+/g, ' ');
    }

    return { protect: protect, restore: restore, plain: plain };
  })();

  /* ------------------------------------------------------------------ *
   * 2. 极简 Markdown 解析器（marked.js 不可用时的本地兜底）
   * ------------------------------------------------------------------ */
  var FallbackMD = (function () {
    function esc(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function inline(s) {
      // 保护 code span
      var codes = [];
      s = s.replace(/`([^`]+)`/g, function (m, c) {
        codes.push(c); return '\u0002C' + (codes.length - 1) + 'C\u0002';
      });
      s = esc(s);
      s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
      s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
      s = s.replace(/\u0002C(\d+)C\u0002/g, function (m, i) { return '<code>' + esc(codes[+i]) + '</code>'; });
      return s;
    }
    function parse(src) {
      var lines = src.replace(/\r\n?/g, '\n').split('\n');
      var out = [], i = 0, n = lines.length, inCode = false, code = [], codeLang = '';
      var listStack = [];

      function closeLists(toDepth) {
        while (listStack.length > (toDepth || 0)) out.push('</' + listStack.pop() + '>');
      }

      while (i < n) {
        var line = lines[i];

        // 代码块
        var fence = line.match(/^\s*(```|~~~)(.*)$/);
        if (fence) {
          if (!inCode) { inCode = true; codeLang = fence[2].trim(); code = []; }
          else {
            out.push('<pre><code' + (codeLang ? ' class="language-' + esc(codeLang) + '"' : '') + '>' +
              esc(code.join('\n')) + '</code></pre>');
            inCode = false;
          }
          i++; continue;
        }
        if (inCode) { code.push(line); i++; continue; }

        // 空行
        if (!line.trim()) { closeLists(0); i++; continue; }

        // 标题
        var h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
          closeLists(0);
          var lv = h[1].length, txt = h[2].trim();
          var id = slug(txt);
          out.push('<h' + lv + ' id="' + id + '">' + inline(txt) + '</h' + lv + '>');
          i++; continue;
        }

        // 水平线
        if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) { closeLists(0); out.push('<hr>'); i++; continue; }

        // 块级 HTML（figure / svg / video / div / table 等）原样透传，不做转义
        if (/^[ \t]*<(\/?)(figure|svg|video|audio|div|table|details|summary|section|aside|iframe|picture|img|source|br|hr|style|script|ul|ol|li|blockquote|p|pre|h[1-6])\b/i.test(line)) {
          closeLists(0);
          var depth = 0, guard = 0;
          while (i < n && guard++ < 4000) {
            var blk = lines[i];
            out.push(blk);
            var opens = (blk.match(/<(figure|svg|video|div|table|section|details)\b[^>]*>/gi) || []).length;
            var closes = (blk.match(/<\/(figure|svg|video|div|table|section|details)>/gi) || []).length;
            depth += opens - closes;
            var selfClosed = /\/>\s*$/.test(blk.trim());
            i++;
            if (depth <= 0 && (selfClosed || closes > 0)) break;
            if (depth <= 0 && i < n && !lines[i].trim()) break;
          }
          continue;
        }

        // 表格
        if (line.indexOf('|') >= 0 && i + 1 < n && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
          closeLists(0);
          var head = splitRow(line);
          i += 2;
          var body = [];
          while (i < n && lines[i].indexOf('|') >= 0 && lines[i].trim()) { body.push(splitRow(lines[i])); i++; }
          var t = '<div class="table-wrap"><table><thead><tr>';
          head.forEach(function (c) { t += '<th>' + inline(c) + '</th>'; });
          t += '</tr></thead><tbody>';
          body.forEach(function (r) {
            t += '<tr>';
            for (var k = 0; k < head.length; k++) t += '<td>' + inline(r[k] === undefined ? '' : r[k]) + '</td>';
            t += '</tr>';
          });
          t += '</tbody></table></div>';
          out.push(t);
          continue;
        }

        // 引用块 -> 提示框
        if (/^\s*>/.test(line)) {
          closeLists(0);
          var buf = [];
          while (i < n && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
          out.push('\u0003BLOCK' + JSON.stringify(buf.join('\n')) + 'BLOCK\u0003');
          continue;
        }

        // 列表
        var li = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (li) {
          var indent = Math.floor(li[1].replace(/\t/g, '    ').length / 2);
          var ordered = /^\d/.test(li[2]);
          var tag = ordered ? 'ol' : 'ul';
          if (!listStack.length || indent > listStack.length - 1) {
            if (listStack.length && indent >= listStack.length) { out.push('<' + tag + '>'); listStack.push(tag); }
            else if (!listStack.length) { out.push('<' + tag + '>'); listStack.push(tag); }
            else { closeLists(indent); out.push('<' + tag + '>'); listStack.push(tag); }
          } else if (indent < listStack.length - 1) {
            closeLists(indent + 1);
            out.push('<' + tag + '>'); listStack.push(tag);
          } else if (listStack[listStack.length - 1] !== tag) {
            out.push('</' + listStack.pop() + '>'); out.push('<' + tag + '>'); listStack.push(tag);
          }
          out.push('<li>' + inline(li[3]) + '</li>');
          i++; continue;
        }

        // 段落
        closeLists(0);
        var p = [line];
        i++;
        while (i < n && lines[i].trim() &&
          !/^(\s*(#{1,6})\s|\s*>|\s*(```|~~~)|\s*([-*+]|\d+[.)])\s)/.test(lines[i]) &&
          !/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(lines[i])) {
          p.push(lines[i]); i++;
        }
        out.push('<p>' + inline(p.join('\n')) + '</p>');
      }
      closeLists(0);
      if (inCode && code.length) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
      return out.join('\n');
    }
    function splitRow(l) {
      return l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (s) { return s.trim(); });
    }
    return { parse: parse, inline: inline, esc: esc };
  })();

  /* ------------------------------------------------------------------ *
   * 3. 工具函数
   * ------------------------------------------------------------------ */
  function slug(text) {
    return String(text)
      .replace(/\u0001MJ\d+MJ\u0001/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[`*_~$\\{}[\]]/g, '')
      .replace(/[^\w\u4e00-\u9fa5\u0370-\u03ff.\- ]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase() || 'sec';
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function num(v, d) { var x = parseFloat(v); return isFinite(x) ? x : d; }

  function fmt(x, d) {
    if (!isFinite(x)) return '—';
    var s = Math.abs(x) < 1e-12 ? '0' : x.toFixed(d == null ? 4 : d);
    return s.replace(/\.?0+$/, function (m) { return m.indexOf('.') === 0 ? '' : m; });
  }

  /* ------------------------------------------------------------------ *
   * 4. 提示框构建
   * ------------------------------------------------------------------ */
  function kindOf(label) {
    if (CALLOUTS[label]) return CALLOUTS[label];
    var m = label.match(EXAM_RE);
    if (m) return { cls: 'example', icon: 'check', name: '例题 ' + m[1] };
    return null;
  }

  function parseCallout(rawLines) {
    // rawLines: 引用块内的原始行
    var first = (rawLines[0] || '').trim();
    var m = first.match(/^\*\*[【\[]([^】\]]+)[】\]]\*\*\s*(.*)$/);
    if (!m) return null;
    var label = m[1].trim();
    var k = kindOf(label);
    if (!k) return null;
    var rest = rawLines.slice(1);
    if (m[2]) rest.unshift(m[2]);
    // 去掉尾部空行
    while (rest.length && !rest[rest.length - 1].trim()) rest.pop();
    return { kind: k, label: k.name || label, body: rest.join('\n') };
  }

  function buildCallout(c) {
    var wrap = el('div', 'callout callout--' + c.kind.cls);
    wrap.appendChild(el('div', 'callout-title', icon(c.kind.icon) + '<span>' + FallbackMD.esc(c.label) + '</span>'));
    var body = el('div', 'callout-body');
    body.innerHTML = renderMD(c.body, { skipFront: true });
    wrap.appendChild(body);
    return wrap.outerHTML;
  }

  /* ------------------------------------------------------------------ *
   * 5. Markdown 渲染（marked 优先，失败用本地解析器）
   * ------------------------------------------------------------------ */
  var markedOK = false;

  function mdToHtml(src) {
    if (typeof window.marked !== 'undefined' && window.marked) {
      try {
        if (typeof window.marked.parse === 'function') return window.marked.parse(src);
        if (typeof window.marked === 'function') return window.marked(src);
      } catch (e) { /* 落到本地 */ }
    }
    return FallbackMD.parse(src);
  }

  function renderMD(src, opt) {
    opt = opt || {};
    var lines = String(src).replace(/\r\n?/g, '\n').split('\n');

    // front matter 剥离
    if (lines[0] && lines[0].trim() === '---') {
      var e = lines.indexOf('---', 1);
      if (e > 0) lines = lines.slice(e + 1);
    }

    // 引用块 → 提示框 / 普通引用
    var blocks = [];       // {type:'callout'|'quote', html}
    var out = [];
    var i = 0;
    while (i < lines.length) {
      if (/^\s*>/.test(lines[i])) {
        var buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        var c = parseCallout(buf);
        if (c) blocks.push({ type: 'callout', html: buildCallout(c) });
        else blocks.push({ type: 'quote', html: buildQuote(buf) });
        out.push('\u0003B' + (blocks.length - 1) + 'B\u0003');
      } else { out.push(lines[i]); i++; }
    }

    var html = mdToHtml(MathGuard.protect(out.join('\n')));
    html = MathGuard.restore(html);

    // 还原提示框
    html = html.replace(/<p>\s*\u0003B(\d+)B\u0003\s*<\/p>/g, function (m, k) {
      return blocks[+k] ? blocks[+k].html : '';
    }).replace(/\u0003B(\d+)B\u0003/g, function (m, k) {
      return blocks[+k] ? blocks[+k].html : '';
    });
    // marked 有时把占位符变成 HTML 注释或其他形式
    html = html.replace(/&lt;\u0003B(\d+)B\u0003&gt;/g, function (m, k) { return blocks[+k] ? blocks[+k].html : ''; });

    // 表格包裹（marked 输出的裸 table；已包裹的不重复处理）
    html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
    var prevWrap;
    do {
      prevWrap = html;
      html = html.replace(/<div class="table-wrap">(\s*)<div class="table-wrap">/g, '<div class="table-wrap">$1');
    } while (html !== prevWrap);

    // 隐藏首个 h1（front matter 已给标题）
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '');

    // 锚点：为 h2/h3/h4 生成 id
    var seen = {};
    html = html.replace(/<h([234])>([\s\S]*?)<\/h\1>/g, function (m, lv, inner) {
      var plain = inner.replace(/<[^>]+>/g, '');
      var id = slug(plain);
      if (seen[id]) { seen[id]++; id = id + '-' + seen[id]; } else seen[id] = 1;
      return '<h' + lv + ' id="' + id + '">' + inner + '</h' + lv + '>';
    });

    return html;
  }

  function buildQuote(buf) {
    var inner = mdToHtml(MathGuard.protect(buf.join('\n')));
    return '<blockquote>' + MathGuard.restore(inner) + '</blockquote>';
  }

  /* ------------------------------------------------------------------ *
   * 6. 主题 / 侧栏 / 进度
   * ------------------------------------------------------------------ */
  var Theme = {
    key: 'mwguide-theme',
    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(this.key); } catch (e) {}
      var initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      this.set(initial, true);
    },
    set: function (t, silent) {
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem(this.key, t); } catch (e) {}
      var b = document.getElementById('themeBtn');
      if (b) b.innerHTML = (t === 'dark' ? sunIcon() : moonIcon()) + '<span>' + (t === 'dark' ? '浅色' : '深色') + '</span>';
      if (!silent) window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
    },
    toggle: function () {
      this.set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  };
  function moonIcon() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'; }
  function sunIcon() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>'; }

  function buildSidebar(active) {
    var host = document.getElementById('sidebarNav');
    if (!host) return;
    if (host.children.length) {
      // 导航已由构建脚本预渲染：只需标记当前页
      var links = host.querySelectorAll('a.nav-link');
      Array.prototype.forEach.call(links, function (a) {
        var href = a.getAttribute('href');
        if (href === active || (href && active && href.slice(-active.length) === active)) a.classList.add('active');
      });
      return;
    }
    var html = '';

    html += '<div class="nav-group"><div class="nav-heading">开始</div>';
    [['index.html', '首页 · 学习总览', '00'], ['roadmap.html', '学习路线图', '01'],
     ['formulas.html', '公式速查手册', '02'], ['exam.html', '考点总纲', '03'],
     ['smith.html', '史密斯圆图交互工具', '04'], ['quiz.html', '综合自测题', '05']]
      .forEach(function (it) {
        var cls = active === it[0] ? 'nav-link active' : 'nav-link';
        html += '<a class="' + cls + '" href="' + it[0] + '"><span class="nav-num">' + it[2] +
          '</span><span class="nav-label">' + it[1] + '</span></a>';
      });
    html += '</div>';

    html += '<div class="nav-group"><div class="nav-heading">章节目录</div>';
    CHAPTERS.forEach(function (c) {
      var f = 'content/' + c.file + '.html';
      var cls = active === f ? 'nav-link active' : 'nav-link';
      html += '<a class="' + cls + '" href="' + c.file + '.html"><span class="nav-num">' + c.n +
        '</span><span class="nav-label">' + c.short + '</span></a>';
    });
    html += '</div>';

    html += '<div class="nav-group"><div class="nav-heading">原始课件</div>' +
      '<a class="nav-link" href="resources.html"><span class="nav-num">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3v13M6.5 10.5 12 16l5.5-5.5M4 20h16"/></svg>' +
      '</span><span class="nav-label">课件与视频资源</span></a></div>';

    host.innerHTML = html;
  }

  function sidebarToggle() {
    var sb = document.getElementById('sidebar');
    var bd = document.getElementById('backdrop');
    if (!sb) return;
    sb.classList.toggle('open');
    if (bd) bd.classList.toggle('show', sb.classList.contains('open'));
  }

  function initProgress() {
    var bar = document.getElementById('progress');
    if (!bar) return;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    return upd;
  }

  /* ------------------------------------------------------------------ *
   * 7. 目录（右侧）
   * ------------------------------------------------------------------ */
  function buildTOC(root) {
    var host = document.getElementById('tocList');
    if (!host) return;
    var heads = root.querySelectorAll('h2, h3, h4');
    if (!heads.length) { var t = document.getElementById('toc'); if (t) t.style.display = 'none'; return; }
    var html = '';
    Array.prototype.forEach.call(heads, function (h) {
      var lv = h.tagName[1];
      var txt = h.textContent.trim();
      if (!h.id) h.id = slug(txt);
      html += '<a class="toc-link lvl-' + lv + '" href="#' + h.id + '">' + FallbackMD.esc(txt) + '</a>';
    });
    host.innerHTML = html;

    var links = host.querySelectorAll('.toc-link');
    var map = {};
    Array.prototype.forEach.call(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Array.prototype.forEach.call(links, function (x) { x.classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-72px 0px -68% 0px', threshold: 0 });

    Array.prototype.forEach.call(heads, function (h) { obs.observe(h); });
    window.__tocObserver = obs;
  }

  /* ------------------------------------------------------------------ *
   * 8. 搜索
   * ------------------------------------------------------------------ */
  var Search = {
    index: null, loading: false,
    ensure: function () {
      var self = this;
      if (this.index) return Promise.resolve(this.index);
      if (window.__MW_SEARCH_INDEX__) { this.index = window.__MW_SEARCH_INDEX__; return Promise.resolve(this.index); }
      if (this.loading) return this.loading;
      this.loading = fetch(BASE + 'assets/search-index.json', { cache: 'force-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { self.index = d; return d; })
        .catch(function () { self.index = []; return []; });
      return this.loading;
    },
    query: function (q) {
      if (!this.index) return [];
      var terms = q.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 0; });
      if (!terms.length) return [];
      var hits = [];
      for (var i = 0; i < this.index.length; i++) {
        var it = this.index[i];
        var hay = it.t.toLowerCase();
        var score = 0, ok = true;
        for (var k = 0; k < terms.length; k++) {
          var pos = hay.indexOf(terms[k]);
          if (pos < 0) { ok = false; break; }
          score += (pos === 0 ? 26 : 0) + Math.max(0, 22 - pos / 12);
          if (it.k === 'title') score += 34;
          if (it.k === 'h2') score += 18;
          else if (it.k === 'h3') score += 9;
        }
        if (!ok) continue;
        if (it.b) {
          var bl = it.b.toLowerCase();
          for (var j = 0; j < terms.length; j++) if (bl.indexOf(terms[j]) >= 0) score += 7;
        }
        hits.push({ it: it, s: score });
      }
      hits.sort(function (a, b) { return b.s - a.s; });
      return hits.slice(0, 26).map(function (h) { return h.it; });
    },
    init: function () {
      var input = document.getElementById('search');
      var box = document.getElementById('searchResults');
      if (!input || !box) return;
      var timer = null, active = -1, results = [];
      var self = this;

      function render(list, q) {
        results = list; active = -1;
        if (!q) { box.classList.remove('open'); box.innerHTML = ''; return; }
        if (!list.length) {
          box.innerHTML = '<div class="sr-empty">未找到与「' + FallbackMD.esc(q) + '」相关的内容</div>';
          box.classList.add('open'); return;
        }
        var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        box.innerHTML = list.map(function (it) {
          var snip = it.b || '';
          var low = snip.toLowerCase(), at = -1;
          for (var i = 0; i < terms.length; i++) { at = low.indexOf(terms[i]); if (at >= 0) break; }
          if (at > 70) snip = '…' + snip.slice(at - 50);
          if (snip.length > 170) snip = snip.slice(0, 170) + '…';
          snip = FallbackMD.esc(snip);
          terms.forEach(function (t) {
            if (!t) return;
            snip = snip.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
          });
          var chip = it.k === 'title' ? 'chip--brand' : (it.k === 'h2' ? 'chip--accent' : '');
          return '<a class="sr-item" href="' + BASE + it.u + '">' +
            '<div class="sr-item-title"><span class="chip ' + chip + '">' + FallbackMD.esc(it.c) + '</span>' +
            FallbackMD.esc(it.t) + '</div>' +
            (snip ? '<div class="sr-item-snip">' + snip + '</div>' : '') + '</a>';
        }).join('');
        box.classList.add('open');
      }

      function move(d) {
        var items = box.querySelectorAll('.sr-item');
        if (!items.length) return;
        active = (active + d + items.length) % items.length;
        Array.prototype.forEach.call(items, function (x, i) { x.classList.toggle('active', i === active); });
        items[active].scrollIntoView({ block: 'nearest' });
      }

      input.addEventListener('input', function () {
        var q = input.value.trim();
        clearTimeout(timer);
        if (!q) { render([], ''); return; }
        timer = setTimeout(function () {
          self.ensure().then(function () { render(self.query(q), q); });
        }, 110);
      });
      input.addEventListener('focus', function () { if (input.value.trim()) box.classList.add('open'); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Escape') { input.blur(); box.classList.remove('open'); }
        else if (e.key === 'Enter') {
          var items = box.querySelectorAll('.sr-item');
          var target = active >= 0 ? items[active] : items[0];
          if (target) location.href = target.getAttribute('href');
        }
      });
      document.addEventListener('click', function (e) {
        if (!box.contains(e.target) && e.target !== input) box.classList.remove('open');
      });
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 9. MathJax
   * ------------------------------------------------------------------ */
  var MathBridge = {
    ready: null,
    init: function () {
      if (window.MathJax && window.MathJax.typesetPromise) return Promise.resolve();
      if (this.ready) return this.ready;
      this.ready = new Promise(function (res) {
        window.MathJax = {
          tex: {
            inlineMath: [['\\(', '\\)']],
            displayMath: [['\\[', '\\]']],
            processEscapes: true,
            tags: 'none',
            macros: {
              RR: '\\mathbb{R}', ZZ: '\\mathbb{Z}',
              dd: '\\mathrm{d}', jj: '\\mathrm{j}',
              Re: '\\operatorname{Re}', Im: '\\operatorname{Im}',
              diag: '\\operatorname{diag}'
            }
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'svg'],
            ignoreHtmlClass: 'no-mathjax',
            processHtmlClass: 'md'
          },
          svg: { fontCache: 'global', scale: 0.98 },
          startup: {
            typeset: false,
            ready: function () {
              try { MathJax.startup.defaultReady(); } catch (e) {}
              res();
            }
          }
        };
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        s.async = true;
        s.onerror = function () { MathBridge.failed = true; res(); };
        document.head.appendChild(s);
        setTimeout(function () { res(); }, 9000);
      });
      return this.ready;
    },
    typeset: function (node) {
      var self = this;
      return this.init().then(function () {
        if (self.failed || !window.MathJax || !window.MathJax.typesetPromise) return;
        return window.MathJax.typesetPromise(node ? [node] : undefined).catch(function () {});
      });
    }
  };

  /* ------------------------------------------------------------------ *
   * 10. 页面引导
   * ------------------------------------------------------------------ */
  function renderPager(n) {
    var host = document.getElementById('pager');
    if (!host) return;
    var prev = null, next = null;
    CHAPTERS.forEach(function (c, i) {
      if (c.n === n) { prev = CHAPTERS[i - 1] || null; next = CHAPTERS[i + 1] || null; }
    });
    var html = '';
    html += prev
      ? '<a class="prev" href="' + prev.file + '.html"><small>← 上一章</small><b>' + prev.title + '</b></a>'
      : '<a class="prev empty" href="#"><small>&nbsp;</small><b>&nbsp;</b></a>';
    html += next
      ? '<a class="next" href="' + next.file + '.html"><small>下一章 →</small><b>' + next.title + '</b></a>'
      : '<a class="next empty" href="#"><small>&nbsp;</small><b>&nbsp;</b></a>';
    host.innerHTML = html;
  }

  function loadMarkdown(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' · ' + url);
      return r.text();
    });
  }

  function bootChapter(cfg) {
    var article = document.getElementById('article');
    var md = document.getElementById('md');
    if (!md) return;

    // 尝试用预嵌入内容（离线可用）
    var pre = document.getElementById('preContent');
    var src = null;
    if (pre && pre.textContent.trim().length > 400) src = Promise.resolve(pre.textContent);
    else src = loadMarkdown(cfg.src);

    src.then(function (text) {
      var meta = parseFront(text);
      document.title = (meta.title || cfg.title) + ' · 微波技术基础学习指南';
      var eb = document.getElementById('eyebrow');
      if (eb) eb.innerHTML = '第 ' + (meta.chapter || cfg.n) + ' 章' +
        (meta.minutes ? '　·　建议 ' + meta.minutes + ' 分钟' : '');

      md.innerHTML = renderMD(text);
      if (pre) pre.remove();

      var shell = document.getElementById('chapterShell');
      if (shell) shell.hidden = false;
      article.classList.remove('loading');

      buildTOC(md);
      renderPager(cfg.n);
      initProgress();
      MathBridge.typeset(md).then(function () {
        annotateEq();
        wireEqCopy();
      });
      wireZoomFigures();
    }).catch(function (err) {
      article.classList.remove('loading');
      article.innerHTML = '<div class="load-err"><h2>内容加载失败</h2>' +
        '<p>' + FallbackMD.esc(String(err.message || err)) + '</p>' +
        '<p>请在站点根目录启动本地服务器后访问，例如：</p>' +
        '<code>python -m http.server 8000</code></div>';
    });
  }

  function parseFront(text) {
    var m = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return {};
    var o = {};
    m[1].split(/\r?\n/).forEach(function (l) {
      var i = l.indexOf(':');
      if (i > 0) o[l.slice(0, i).trim()] = l.slice(i + 1).trim();
    });
    return o;
  }

  // 给带 \tag 的显示公式加编号徽标
  function annotateEq() {
    var disps = document.querySelectorAll('.md .katex-display');
    Array.prototype.forEach.call(disps, function (d) {
      if (d.querySelector('.eq-tag')) return;
      var t = d.querySelector('.tag');
      if (!t) return;
      var txt = t.textContent.replace(/[()]/g, '').trim();
      t.classList.add('eq-tag');
      t.setAttribute('data-tag', txt);
    });
  }

  // 点击公式复制 LaTeX
  function wireEqCopy() {
    if (window.__eqWired) return;
    window.__eqWired = true;
    document.addEventListener('click', function (e) {
      var d = e.target.closest && e.target.closest('.katex-display');
      if (!d) return;
      var ann = d.querySelector('annotation[encoding="application/x-tex"]');
      if (!ann) return;
      var tex = ann.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(tex).then(function () { toast('已复制公式 LaTeX'); }).catch(function () {});
      }
    });
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { t = el('div', '', ''); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(10px);' +
      'background:var(--ink);color:var(--surface);padding:9px 18px;border-radius:99px;font-size:13px;' +
      'box-shadow:var(--shadow-2);z-index:200;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none';
    requestAnimationFrame(function () {
      t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(t.__h);
    t.__h = setTimeout(function () {
      t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)';
    }, 1700);
  }

  // 图形放大：点击 figure 弹层
  function wireZoomFigures() {
    if (window.__figWired) return;
    window.__figWired = true;
    document.addEventListener('click', function (e) {
      var f = e.target.closest && e.target.closest('.md figure.fig');
      if (!f || e.target.closest('a')) return;
      var svg = f.querySelector('svg');
      if (!svg) return;
      openLightbox(svg.outerHTML, (f.querySelector('figcaption') || {}).textContent || '');
    });
  }

  function openLightbox(html, cap) {
    var bd = el('div', 'lightbox');
    bd.innerHTML = '<div class="lightbox-inner"><div class="lightbox-body">' + html + '</div>' +
      '<div class="lightbox-cap">' + FallbackMD.esc(cap) + '</div></div>';
    bd.style.cssText = 'position:fixed;inset:0;z-index:300;background:rgba(8,13,24,.86);' +
      'display:grid;place-items:center;padding:28px;backdrop-filter:blur(6px)';
    bd.querySelector('.lightbox-inner').style.cssText = 'background:var(--surface);border-radius:16px;' +
      'padding:26px;max-width:min(1150px,94vw);max-height:92vh;overflow:auto;box-shadow:var(--shadow-3)';
    bd.querySelector('.lightbox-body').style.cssText = 'color:var(--ink)';
    bd.querySelector('.lightbox-cap').style.cssText = 'margin-top:14px;text-align:center;font-size:13px;color:var(--ink-3)';
    bd.addEventListener('click', function () { bd.remove(); });
    document.addEventListener('keydown', function h(ev) {
      if (ev.key === 'Escape') { bd.remove(); document.removeEventListener('keydown', h); }
    });
    document.body.appendChild(bd);
  }

  /* ------------------------------------------------------------------ *
   * 11. 交互工具：史密斯圆图
   * ------------------------------------------------------------------ */
  function initSmith() {
    var cv = document.getElementById('smithCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var SIZE = 720;
    cv.width = SIZE * DPR; cv.height = SIZE * DPR;
    cv.style.width = '100%'; cv.style.height = 'auto';
    ctx.scale(DPR, DPR);

    var R = SIZE * 0.44, CX = SIZE / 2, CY = SIZE / 2;
    var state = { r: 1, x: 0, mode: 'z', showSwr: true, showGrid: true };

    function cssv(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
    }
    function toPx(gr, gi) { return [CX + gr * R, CY - gi * R]; }

    // Γ ← z
    function zToG(r, x) {
      var d = (r + 1) * (r + 1) + x * x;
      return [(r * r - 1 + x * x) / d, (2 * x) / d];
    }
    // z ← Γ
    function gToZ(gr, gi) {
      var d = (1 - gr) * (1 - gr) + gi * gi;
      if (d < 1e-12) return [Infinity, 0];
      return [(1 - gr * gr - gi * gi) / d, (2 * gi) / d];
    }

    function draw() {
      var bg = cssv('--surface'), line = cssv('--line'), line2 = cssv('--line-2'),
        ink = cssv('--ink'), ink3 = cssv('--ink-3'), brand = cssv('--brand'),
        accent = cssv('--accent'), warn = cssv('--warn'), good = cssv('--good');

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.translate(CX, CY);
      ctx.scale(R, R);
      ctx.lineWidth = 1 / R;

      // 等 r 圆
      if (state.showGrid) {
        var rs = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10, 20];
        rs.forEach(function (r) {
          var c = r / (1 + r), rad = 1 / (1 + r);
          ctx.beginPath();
          ctx.arc(c, 0, rad, 0, Math.PI * 2);
          ctx.strokeStyle = (r === 1) ? line2 : line;
          ctx.lineWidth = (r === 1 ? 1.6 : 0.9) / R;
          ctx.stroke();
        });
        // 等 x 弧
        var xs = [0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10];
        xs.forEach(function (x) {
          [1, -1].forEach(function (s) {
            var c = 1, cy = s / x, rad = 1 / Math.abs(x);
            var t1 = Math.atan2(0 - cy, -1 - c);
            var t2 = Math.atan2(0 - cy, 1 - c);
            ctx.beginPath();
            ctx.arc(c, cy, rad, Math.min(t1, t2), Math.max(t1, t2));
            ctx.strokeStyle = line;
            ctx.lineWidth = 0.9 / R;
            ctx.stroke();
          });
        });
        // 实轴 + 单位圆
        ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(1, 0);
        ctx.strokeStyle = line2; ctx.lineWidth = 1.6 / R; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.strokeStyle = ink3; ctx.lineWidth = 2 / R; ctx.stroke();

      // 等驻波比圆
      var g = zToG(state.r, state.x);
      var gm = Math.hypot(g[0], g[1]);
      if (state.showSwr) {
        ctx.beginPath(); ctx.arc(0, 0, gm, 0, Math.PI * 2);
        ctx.strokeStyle = warn; ctx.lineWidth = 1.5 / R;
        ctx.setLineDash([6 / R, 5 / R]); ctx.stroke(); ctx.setLineDash([]);
      }

      // 波腹/波节轴与当前点
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(g[0], g[1]);
      ctx.strokeStyle = accent; ctx.lineWidth = 1.6 / R; ctx.stroke();

      ctx.beginPath(); ctx.arc(g[0], g[1], 7 / R, 0, Math.PI * 2);
      ctx.fillStyle = brand; ctx.fill();

      // 特殊点
      [[-1, 0, '短路'], [1, 0, '开路'], [0, 0, '匹配']].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], 4 / R, 0, Math.PI * 2);
        ctx.fillStyle = ink3; ctx.fill();
      });
      ctx.restore();

      // 文字标注
      ctx.font = '600 14px ' + (getComputedStyle(document.body).fontFamily || 'sans-serif');
      ctx.fillStyle = ink3; ctx.textAlign = 'left';
      ctx.fillText('Γ 平面', 18, 26);
      ctx.textAlign = 'right';
      ctx.fillText('|Γ| = ' + fmt(gm, 3), SIZE - 18, 26);
      ctx.textAlign = 'left';
      ctx.fillText('短路', CX - R - 44, CY + 5);
      ctx.textAlign = 'right';
      ctx.fillText('开路', CX + R + 44, CY + 5);
      ctx.textAlign = 'center';
      ctx.fillText('归一化等 r 圆 / 等 x 圆', CX, SIZE - 14);

      // 读数
      var z = [state.r, state.x];
      var swr = gm >= 1 ? Infinity : (1 + gm) / (1 - gm);
      var y = gToZ(-g[0], -g[1]);
      var zl = state.mode === 'z' ? state.r : y[0];
      var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
      set('roG', fmt(g[0], 4) + (g[1] < 0 ? ' − j' : ' + j') + fmt(Math.abs(g[1]), 4));
      set('roGm', fmt(gm, 4));
      set('roAng', fmt(Math.atan2(g[1], g[0]) * 180 / Math.PI, 2) + '°');
      set('roSwr', isFinite(swr) ? fmt(swr, 4) : '∞');
      set('roZ', fmt(state.mode === 'z' ? state.r : y[0], 4) + (state.mode === 'z' ? (state.x < 0 ? ' − j' : ' + j') : (y[1] < 0 ? ' − j' : ' + j')) + fmt(Math.abs(state.mode === 'z' ? state.x : y[1]), 4));
      set('roY', fmt(y[0], 4) + (y[1] < 0 ? ' − j' : ' + j') + fmt(Math.abs(y[1]), 4));
      var rmin = gm >= 1 ? 0 : 1 / ((1 + gm) / (1 - gm));
      set('roRmax', isFinite(swr) ? fmt(swr, 4) : '∞');
      set('roRmin', fmt(rmin, 4));
      set('roDmax', gm > 1e-9 ? fmt((1 - Math.atan2(g[1], g[0]) / (2 * Math.PI) + 1) % 0.5, 4) : '—');
    }

    // 交互：拖动设定 Γ
    function pick(ev) {
      var rect = cv.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
      var cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
      var sx = SIZE / rect.width;
      var gr = (cx * sx - CX) / R, gi = -(cy * sx - CY) / R;
      var m = Math.hypot(gr, gi);
      if (m > 1) { gr /= m; gi /= m; }
      var z = gToZ(gr, gi);
      if (!isFinite(z[0])) return;
      state.r = Math.max(0, z[0]); state.x = z[1];
      syncInputs(); draw();
    }
    var dragging = false;
    cv.addEventListener('mousedown', function (e) { dragging = true; pick(e); });
    window.addEventListener('mousemove', function (e) { if (dragging) pick(e); });
    window.addEventListener('mouseup', function () { dragging = false; });
    cv.addEventListener('touchstart', function (e) { e.preventDefault(); pick(e); }, { passive: false });
    cv.addEventListener('touchmove', function (e) { e.preventDefault(); pick(e); }, { passive: false });

    function syncInputs() {
      var a = document.getElementById('inR'), b = document.getElementById('inX');
      if (a) a.value = fmt(state.r, 4);
      if (b) b.value = fmt(state.x, 4);
    }
    function readInputs() {
      var a = document.getElementById('inR'), b = document.getElementById('inX');
      state.r = Math.max(0, num(a && a.value, 1));
      state.x = num(b && b.value, 0);
      draw();
    }
    ['inR', 'inX'].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.addEventListener('input', readInputs);
    });
    var sw = document.getElementById('swrChk');
    if (sw) sw.addEventListener('change', function () { state.showSwr = sw.checked; draw(); });
    var gr = document.getElementById('gridChk');
    if (gr) gr.addEventListener('change', function () { state.showGrid = gr.checked; draw(); });
    var rs = document.getElementById('smithReset');
    if (rs) rs.addEventListener('click', function () { state.r = 1; state.x = 0; syncInputs(); draw(); });

    window.addEventListener('themechange', draw);
    syncInputs(); draw();
  }

  /* ------------------------------------------------------------------ *
   * 12. 入口
   * ------------------------------------------------------------------ */
  function loadSearchIndex() {
    if (window.__MW_SEARCH_INDEX__) return;
    if (document.getElementById('mwi')) return;
    var s = document.createElement('script');
    s.id = 'mwi';
    s.src = BASE + 'assets/js/search-index.js';
    s.async = true;
    document.head.appendChild(s);
  }

  function main() {
    Theme.init();
    loadSearchIndex();
    var active = location.pathname.split('/').pop() || 'index.html';
    if (active === '' ) active = 'index.html';
    buildSidebar(active);
    Search.init();

    var tb = document.getElementById('themeBtn');
    if (tb) tb.addEventListener('click', function () { Theme.toggle(); });
    var mb = document.getElementById('menuBtn');
    if (mb) mb.addEventListener('click', sidebarToggle);
    var bd = document.getElementById('backdrop');
    if (bd) bd.addEventListener('click', sidebarToggle);

    var cfgEl = document.getElementById('chapterCfg');
    if (cfgEl) {
      try {
        var cfg = JSON.parse(cfgEl.textContent);
        bootChapter(cfg);
      } catch (e) { console.error(e); }
    } else {
      initProgress();
    }

    initSmith();

    // 年份
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    // 键盘快捷键
    document.addEventListener('keydown', function (e) {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 't') Theme.toggle();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
  else main();

  // 对外暴露，供工具页使用
  window.MWGuide = { renderMD: renderMD, Math: MathBridge, FallbackMD: FallbackMD, toast: toast, fmt: fmt, num: num, slug: slug, CHAPTERS: CHAPTERS };
})();
