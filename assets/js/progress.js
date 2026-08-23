/* 閱讀進度條。長文捲到一半時,「還剩多少」是很實際的資訊。
 *
 * 不用函式庫,也不用 scroll 事件直接改樣式 —— 那會在每次捲動都觸發
 * 版面計算。改成 rAF 節流,一格畫面最多算一次。 */
(function () {
  'use strict';

  var bar = document.querySelector('.progress-bar');
  if (!bar) return;

  // 尊重「減少動態效果」的系統設定:直接不顯示,而不是顯示一條會亂跳的線
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bar.remove();
    return;
  }

  var ticking = false;

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    // 內容比視窗還短時沒有「進度」可言,整條藏起來
    if (max <= 0) {
      bar.style.transform = 'scaleX(0)';
      return;
    }
    var ratio = Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max));
    bar.style.transform = 'scaleX(' + ratio + ')';
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
