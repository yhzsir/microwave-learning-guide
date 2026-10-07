// 史密斯圆图页附加脚本：排版公式 + 目录
(function () {
  function boot() {
    if (!window.MWGuide) { setTimeout(boot, 60); return; }
    var main = document.querySelector('main.article');
    if (main && window.MWGuide.Math) window.MWGuide.Math.typeset(main);

    // 生成本页目录
    var host = document.getElementById('tocList');
    if (host && main) {
      var hs = main.querySelectorAll('h2');
      if (!hs.length) { var toc = document.getElementById('toc'); if (toc) toc.style.display = 'none'; return; }
      var html = '';
      Array.prototype.forEach.call(hs, function (h, i) {
        if (!h.id) h.id = 'sec-' + i;
        html += '<a class="toc-link lvl-2" href="#' + h.id + '">' + h.textContent.trim() + '</a>';
      });
      host.innerHTML = html;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
