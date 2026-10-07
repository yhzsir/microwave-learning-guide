# =============================================================================
#  微波技术基础 · 学习指南  —  静态站点生成器
#  由 content/*.md 生成 *.html 外壳（导航 / 目录 / 元信息 / 搜索索引）
# =============================================================================
[CmdletBinding()]
param(
  [string]$Root = ''
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
  $here = if ($PSScriptRoot) { $PSScriptRoot } elseif ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }
  $Root = Split-Path -Parent $here
}
$Root = (Resolve-Path -LiteralPath $Root).Path
$contentDir = Join-Path $Root 'content'
$assetsDir  = Join-Path $Root 'assets'

Write-Host "== 微波技术基础 · 站点生成 ==" -ForegroundColor Cyan
Write-Host "根目录: $Root"

# ---------------------------------------------------------------------------
# 章节清单（与 app.js 中 CHAPTERS 保持一致）
# ---------------------------------------------------------------------------
$CHAPTERS = @(
  @{ n = 1; file = 'ch01'; title = '绪论——微波与微波技术'; short = '绪论';          minutes = 60  },
  @{ n = 2; file = 'ch02'; title = '均匀传输线理论';         short = '传输线理论';    minutes = 300 },
  @{ n = 3; file = 'ch03'; title = '规则金属波导';           short = '金属波导';      minutes = 300 },
  @{ n = 4; file = 'ch04'; title = '微波传输线';             short = '传输线类型';    minutes = 220 },
  @{ n = 5; file = 'ch05'; title = '微波网络基础';           short = '微波网络';      minutes = 240 },
  @{ n = 6; file = 'ch06'; title = '微波无源器件';           short = '无源器件';      minutes = 200 },
  @{ n = 7; file = 'ch07'; title = '专题推导一：无耗网络 [Z] 矩阵'; short = '专题·Z 矩阵'; minutes = 90 },
  @{ n = 8; file = 'ch08'; title = '专题推导二：网络对称性与 [S] 矩阵'; short = '专题·S 矩阵'; minutes = 90 }
)

$TOOLS = @(
  @{ file = 'index.html';    label = '首页 · 学习总览';      num = '00' },
  @{ file = 'roadmap.html';  label = '学习路线图';           num = '01' },
  @{ file = 'formulas.html'; label = '公式速查手册';         num = '02' },
  @{ file = 'exam.html';     label = '考点总纲';             num = '03' },
  @{ file = 'smith.html';    label = '史密斯圆图交互工具';   num = '04' },
  @{ file = 'quiz.html';     label = '综合自测题';           num = '05' },
  @{ file = 'resources.html';label = '课件与视频资源';       num = '06' }
)

# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------
function Read-Utf8([string]$path) {
  [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}
function Write-Utf8([string]$path, [string]$text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $enc)
}
function HtmlEsc([string]$s) {
  if ($null -eq $s) { return '' }
  $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}
# 安全嵌入 <script>：避免内容中出现 </script> 或 <!-- 提前闭合
function ScriptSafe([string]$s) {
  $s = $s -replace '</script', '<\/script'
  $s = $s -replace '<!--', '<\!--'
  return $s
}
function Parse-FrontMatter([string]$text) {
  $o = @{}
  $m = [regex]::Match($text, '(?s)^\s*---\r?\n(.*?)\r?\n---')
  if ($m.Success) {
    foreach ($line in ($m.Groups[1].Value -split "\r?\n")) {
      $i = $line.IndexOf(':')
      if ($i -gt 0) { $o[$line.Substring(0, $i).Trim()] = $line.Substring($i + 1).Trim() }
    }
  }
  return $o
}

# ---------------------------------------------------------------------------
# 侧边栏 / 顶栏 / 页脚 片段
# ---------------------------------------------------------------------------
function New-Head([string]$title, [string]$desc, [string]$rel) {
  $t = HtmlEsc $title
  $d = HtmlEsc $desc
  $r = if ($rel) { $rel.TrimEnd('/') + '/' } else { '' }
  @"
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>$t</title>
<meta name="description" content="$d">
<meta name="author" content="微波技术基础学习指南">
<meta property="og:type" content="website">
<meta property="og:title" content="$t">
<meta property="og:description" content="$d">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232f6fdb'/%3E%3Cpath d='M4 21c3-8 5-8 8 0s5 8 8 0 5-8 8 0' stroke='white' stroke-width='2.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${r}assets/css/main.css">
<script>
(function(){try{var s=localStorage.getItem('mwguide-theme');var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s||(d?'dark':'light'));}catch(e){}})();
</script>
</head>
<body>
<div class="progress" id="progress"></div>
<header class="topbar">
  <button class="iconbtn menu-btn" id="menuBtn" aria-label="打开目录">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3.5 6h17M3.5 12h17M3.5 18h17"/></svg>
  </button>
  <a class="brand" href="${r}index.html">
    <span class="brand-mark">μ</span>
    <span class="brand-text">
      <span class="brand-title">微波技术基础</span>
      <span class="brand-sub">LEARNING GUIDE</span>
    </span>
  </a>
  <div class="topbar-spacer"></div>
  <div class="search-wrap">
    <svg class="sicon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
    <input id="search" type="search" placeholder="搜索知识点、公式、例题…  (Ctrl K)" autocomplete="off" spellcheck="false">
    <div class="search-results" id="searchResults"></div>
  </div>
  <button class="iconbtn" id="themeBtn" aria-label="切换主题">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
    <span>深色</span>
  </button>
</header>
"@
}

function New-Backdrop() {
  return '<div class="backdrop" id="backdrop"></div>'
}

function New-Sidebar([string]$active) {
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('<aside class="sidebar" id="sidebar" aria-label="站点导航">')
  [void]$sb.Append('<nav class="sidebar-nav" id="sidebarNav">')
  foreach ($t in $TOOLS) {
    $cls = if ($active -eq $t.file) { 'nav-link active' } else { 'nav-link' }
    [void]$sb.Append("<a class=""$cls"" href=""$($t.file)""><span class=""nav-num"">$($t.num)</span><span class=""nav-label"">$($t.label)</span></a>")
  }
  [void]$sb.Append('<div class="nav-group"><div class="nav-heading">章节目录</div>')
  foreach ($c in $CHAPTERS) {
    $f = "content/$($c.file).html"
    $cls = if ($active -eq $f) { 'nav-link active' } else { 'nav-link' }
    [void]$sb.Append("<a class=""$cls"" href=""$($c.file).html""><span class=""nav-num"">$($c.n)</span><span class=""nav-label"">$(HtmlEsc $c.short)</span></a>")
  }
  [void]$sb.Append('</div></nav></aside>')
  return $sb.ToString()
}

function New-Footer([string]$rel) {
  $r = if ($rel) { $rel.TrimEnd('/') + '/' } else { '' }
  @"
<footer class="footer">
  <div>《微波技术基础》在线学习指南 · 共 6 章 + 2 个专题推导</div>
  <div>
    <a href="${r}formulas.html">公式速查</a> ·
    <a href="${r}exam.html">考点总纲</a> ·
    <a href="${r}resources.html">课件资源</a>
  </div>
</footer>
<script src="${r}assets/js/search-index.js"></script>
<script src="${r}assets/js/app.js"></script>
</body>
</html>
"@
}

# ---------------------------------------------------------------------------
# 生成章节页
# ---------------------------------------------------------------------------
function Build-Chapter($c, [string[]]$allTexts) {
  $mdPath = Join-Path $contentDir "$($c.file).md"
  if (-not (Test-Path -LiteralPath $mdPath)) {
    Write-Warning "缺少 $($c.file).md，跳过"
    return $null
  }
  $md = Read-Utf8 $mdPath
  $md = SubstituteVideos $md
  $fm = Parse-FrontMatter $md
  $title = if ($fm['title']) { $fm['title'] } else { $c.title }
  $desc  = if ($fm['desc'])  { $fm['desc'] }  else { $c.title }
  $minutes = if ($fm['minutes']) { $fm['minutes'] } else { $c.minutes }

  $head = New-Head "$title · 微波技术基础学习指南" $desc ''
  $side = New-Sidebar "content/$($c.file).html"

  $html = New-Object System.Text.StringBuilder
  [void]$html.Append($head)
  [void]$html.Append((New-Backdrop))
  [void]$html.Append('<div class="shell">')
  [void]$html.Append($side)
  [void]$html.Append('<main class="article loading" id="article">')
  [void]$html.Append('<div class="spinner" role="status" aria-label="加载中"></div>')
  [void]$html.Append('<div id="chapterShell" hidden>')
  [void]$html.Append('<div class="chapter-eyebrow" id="eyebrow">第 ' + $c.n + ' 章</div>')
  [void]$html.Append('<div class="md" id="md"></div>')
  [void]$html.Append('<nav class="pager" id="pager" aria-label="章节导航"></nav>')
  [void]$html.Append('</div></main>')
  [void]$html.Append('<aside class="toc" id="toc"><div class="toc-heading">本页目录</div><div class="toc-list" id="tocList"></div></aside>')
  [void]$html.Append('</div>')
  [void]$html.Append((New-Footer ''))

  # 内容以 <script type="text/plain"> 预嵌入，离线也可读；app.js 优先使用它
  $tpl = '<script id="chapterCfg" type="application/json">{cfg}</script>' + "`n" +
         '<script id="preContent" type="text/plain">{body}</script>'
  $cfg = '{"n":' + $c.n + ',"file":"' + $c.file + '","src":"content/' + $c.file + '.md","title":"' +
         (($title -replace '\\','\\' -replace '"','\"')) + '"}'
  $inject = $tpl.Replace('{cfg}', $cfg).Replace('{body}', (ScriptSafe $md))
  $out = $html.ToString().Replace('<script src="assets/js/app.js"></script>', $inject + "`n" + '<script src="assets/js/app.js"></script>')

  $outPath = Join-Path $Root "$($c.file).html"
  Write-Utf8 $outPath $out
  Write-Host ("  [章] {0,-6} {1,-34} {2,9:N0} 字符" -f $c.file, $title, $md.Length) -ForegroundColor Green
  return [pscustomobject]@{ file = $c.file; md = $md; title = $title; desc = $desc; n = $c.n }
}

# ---------------------------------------------------------------------------
# 视频占位符 → <video> 元素
# ---------------------------------------------------------------------------
function VideoTag([string]$src, [string]$label, [string]$duration, [string]$poster) {
  $p = if ($poster) { ' poster="' + $poster + '"' } else { '' }
  @"
<figure class="fig video-fig">
  <video controls preload="metadata" playsinline$p style="width:100%;border-radius:var(--r);background:#000">
    <source src="$src" type="video/mp4">
    您的浏览器不支持 HTML5 视频播放，请<a href="$src">点击此处下载视频</a>。
  </video>
  <figcaption><b>$label</b>　·　时长 $duration　·　<a href="$src">下载视频文件</a></figcaption>
</figure>
"@
}

function SubstituteVideos([string]$text) {
  $text = $text.Replace('__VIDEO_GAOKUN__', (VideoTag 'assets/videos/09_gao-kun.mp4' '视频一：高锟与光纤通信' '1 分 45 秒' ''))
  $text = $text.Replace('__VIDEO_COAX__',   (VideoTag 'assets/videos/10_coaxial-line.mp4' '视频二：同轴线' '58 秒' ''))
  return $text
}

# ---------------------------------------------------------------------------
# 生成工具/内容页（使用 Markdown 的）
# ---------------------------------------------------------------------------
function Build-Page([string]$mdFile, [string]$outFile, [string]$fallbackTitle, [string]$activeFile) {
  $mdPath = Join-Path $contentDir $mdFile
  if (-not (Test-Path -LiteralPath $mdPath)) { Write-Warning "缺少 $mdFile"; return $null }
  $md = Read-Utf8 $mdPath
  $md = SubstituteVideos $md
  $fm = Parse-FrontMatter $md
  $title = if ($fm['title']) { $fm['title'] } else { $fallbackTitle }
  $desc  = if ($fm['desc'])  { $fm['desc'] }  else { $fallbackTitle }

  $html = New-Object System.Text.StringBuilder
  [void]$html.Append((New-Head "$title · 微波技术基础学习指南" $desc ''))
  [void]$html.Append((New-Backdrop))
  [void]$html.Append('<div class="shell">')
  [void]$html.Append((New-Sidebar $activeFile))
  [void]$html.Append('<main class="article loading" id="article">')
  [void]$html.Append('<div class="spinner" role="status" aria-label="加载中"></div>')
  [void]$html.Append('<div id="chapterShell" hidden><div class="md" id="md"></div></div></main>')
  [void]$html.Append('<aside class="toc" id="toc"><div class="toc-heading">本页目录</div><div class="toc-list" id="tocList"></div></aside>')
  [void]$html.Append('</div>')
  [void]$html.Append((New-Footer ''))

  $tpl = '<script id="chapterCfg" type="application/json">{cfg}</script>' + "`n" +
         '<script id="preContent" type="text/plain">{body}</script>'
  $t = ($title -replace '\\','\\' -replace '"','\"')
  $cfg = '{"n":0,"file":"' + [System.IO.Path]::GetFileNameWithoutExtension($outFile) + '","src":"content/' + $mdFile + '","title":"' + $t + '"}'
  $inject = $tpl.Replace('{cfg}', $cfg).Replace('{body}', (ScriptSafe $md))
  $out = $html.ToString().Replace('<script src="assets/js/app.js"></script>', $inject + "`n" + '<script src="assets/js/app.js"></script>')

  Write-Utf8 (Join-Path $Root $outFile) $out
  Write-Host ("  [页] {0,-16} {1,-30} {2,9:N0} 字符" -f $outFile, $title, $md.Length) -ForegroundColor Green
  return [pscustomobject]@{ out = $outFile; md = $md; title = $title }
}

# ---------------------------------------------------------------------------
# 生成纯 HTML 工具页（如史密斯圆图）
# ---------------------------------------------------------------------------
function Build-RawPage([string]$outFile, [string]$title, [string]$desc, [string]$body, [string]$activeFile, [string]$extraScript) {
  $html = New-Object System.Text.StringBuilder
  [void]$html.Append((New-Head "$title · 微波技术基础学习指南" $desc ''))
  [void]$html.Append((New-Backdrop))
  [void]$html.Append('<div class="shell">')
  [void]$html.Append((New-Sidebar $activeFile))
  [void]$html.Append('<main class="article">')
  [void]$html.Append('<div class="chapter-eyebrow">交互工具</div>')
  [void]$html.Append($body)
  [void]$html.Append('</main>')
  [void]$html.Append('<aside class="toc" id="toc"><div class="toc-heading">本页目录</div><div class="toc-list" id="tocList"></div></aside>')
  [void]$html.Append('</div>')
  $footer = (New-Footer '')
  if ($extraScript) {
    $footer = $footer.Replace('<script src="assets/js/app.js"></script>',
      '<script src="assets/js/app.js"></script>' + "`n" + '<script>' + $extraScript + '</script>')
  }
  [void]$html.Append($footer)
  Write-Utf8 (Join-Path $Root $outFile) $html.ToString()
  Write-Host ("  [器] {0,-16} {1}" -f $outFile, $title) -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 搜索索引
# ---------------------------------------------------------------------------
function Build-SearchIndex($chapters, $pages) {
  $entries = New-Object System.Collections.ArrayList

  function Strip-MD([string]$s) {
    $s = [regex]::Replace($s, '(?s)\$\$(.*?)\$\$', ' $1 ')
    $s = [regex]::Replace($s, '\$([^$\r\n]+)\$', ' $1 ')
    $s = [regex]::Replace($s, '(?s)<svg.*?</svg>', ' ')
    $s = [regex]::Replace($s, '<[^>]+>', ' ')
    $s = [regex]::Replace($s, '(?s)```.*?```', ' ')
    $s = $s -replace '[`*_>#|\[\]\(\)]', ' '
    $s = [regex]::Replace($s, '\s+', ' ')
    return $s.Trim()
  }
  function Latexify([string]$s) {
    $s = $s -replace '\\frac\{([^{}]*)\}\{([^{}]*)\}', '($1)/($2)'
    $s = $s -replace '\\[a-zA-Z]+', ' '
    $s = $s -replace '[\\{}$]', ' '
    return $s
  }

  foreach ($ch in $chapters) {
    if ($null -eq $ch) { continue }
    $urlBase = "content/$($ch.file).html"
    [void]$entries.Add([pscustomobject]@{
      t = $ch.title; u = $urlBase; c = "第 $($ch.n) 章"; k = 'title'; b = (Strip-MD $ch.desc)
    })
    # 按 h2/h3 切分
    $lines = $ch.md -split "\r?\n"
    $cur = $null; $buf = New-Object System.Collections.ArrayList
    $flush = {
      if ($cur -and $buf.Count) {
        $body = Strip-MD ($buf -join ' ')
        if ($body.Length -gt 400) { $body = $body.Substring(0, 400) }
        if ($body.Length -gt 20) {
          [void]$entries.Add([pscustomobject]@{
            t = (Strip-MD $cur.title); u = "$urlBase#$($cur.id)"; c = "第 $($ch.n) 章"; k = $cur.k; b = $body
          })
        }
      }
      $buf.Clear()
    }
    foreach ($line in $lines) {
      $m = [regex]::Match($line, '^(#{2,3})\s+(.+)$')
      if ($m.Success) {
        & $flush
        $txt = $m.Groups[2].Value.Trim()
        $id = ($txt -replace '[`*_~$\\{}\[\]]', '' -replace '[^\w\u4e00-\u9fa5\u0370-\u03ff.\- ]+', '' -replace '\s+', '-').ToLower()
        if (-not $id) { $id = 'sec' }
        $cur = [pscustomobject]@{ title = $txt; id = $id; k = if ($m.Groups[1].Value.Length -eq 2) { 'h2' } else { 'h3' } }
      } elseif ($cur) {
        [void]$buf.Add($line)
      }
    }
    & $flush
  }

  foreach ($p in $pages) {
    if ($null -eq $p) { continue }
    [void]$entries.Add([pscustomobject]@{
      t = $p.title; u = $p.out; c = '速查'; k = 'title'; b = (Strip-MD $p.md).Substring(0, [Math]::Min(300, (Strip-MD $p.md).Length))
    })
  }

  $json = $entries | ConvertTo-Json -Depth 4 -Compress
  $js = '__MW_SEARCH_INDEX__ = ' + $json + ';'
  Write-Utf8 (Join-Path (Join-Path $assetsDir 'js') 'search-index.js') $js
  Write-Host "  [索] search-index.js        共 $($entries.Count) 条" -ForegroundColor Green
  return $entries.Count
}

# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
$built = New-Object System.Collections.ArrayList
Write-Host "`n生成章节页…" -ForegroundColor Yellow
foreach ($c in $CHAPTERS) {
  $r = Build-Chapter $c $null
  if ($r) { [void]$built.Add($r) }
}

Write-Host "`n生成专题与速查页…" -ForegroundColor Yellow
$pages = New-Object System.Collections.ArrayList
if (Test-Path -LiteralPath (Join-Path $contentDir 'index.md'))    { [void]$pages.Add((Build-Page 'index.md'    'index.html'    '学习总览' 'index.html')) }
if (Test-Path -LiteralPath (Join-Path $contentDir 'roadmap.md'))  { [void]$pages.Add((Build-Page 'roadmap.md'  'roadmap.html'  '学习路线图' 'roadmap.html')) }
if (Test-Path -LiteralPath (Join-Path $contentDir 'formulas.md')) { [void]$pages.Add((Build-Page 'formulas.md' 'formulas.html' '公式速查手册' 'formulas.html')) }
if (Test-Path -LiteralPath (Join-Path $contentDir 'exam.md'))     { [void]$pages.Add((Build-Page 'exam.md'     'exam.html'     '考点总纲' 'exam.html')) }
if (Test-Path -LiteralPath (Join-Path $contentDir 'quiz.md'))     { [void]$pages.Add((Build-Page 'quiz.md'     'quiz.html'     '综合自测题' 'quiz.html')) }
if (Test-Path -LiteralPath (Join-Path $contentDir 'resources.md')){ [void]$pages.Add((Build-Page -mdFile 'resources.md' -outFile 'resources.html' -fallbackTitle '课件与视频资源' -activeFile 'resources.html')) }

Write-Host "`n生成交互工具页…" -ForegroundColor Yellow
if (Test-Path -LiteralPath (Join-Path $contentDir 'smith.body.html')) {
  $body = Read-Utf8 (Join-Path $contentDir 'smith.body.html')
  $script = if (Test-Path -LiteralPath (Join-Path $contentDir 'smith.script.js')) { Read-Utf8 (Join-Path $contentDir 'smith.script.js') } else { '' }
  Build-RawPage 'smith.html' '史密斯圆图交互工具' '交互式史密斯圆图：拖动查看归一化阻抗、反射系数、驻波比与导纳' $body 'smith.html' $script
}

Write-Host "`n生成搜索索引…" -ForegroundColor Yellow
$n = Build-SearchIndex $built $pages

# 附加文件
Write-Utf8 (Join-Path $Root '.nojekyll') ''
Write-Host "  [配] .nojekyll" -ForegroundColor Green

Write-Host "`n完成：$($built.Count) 章 + $($pages.Count) 页 + 1 工具 + $n 条索引`n" -ForegroundColor Cyan
