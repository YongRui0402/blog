/* 列表排序。無外部相依。
 *
 * 只重排 DOM 裡已經存在的 <li>，不重新抓資料 —— 所以模板端已經擋掉
 * 「分頁超過一頁」的情況（見 partials/sort-bar.html）。
 *
 * 排序列預設 hidden，由這支腳本打開：沒有 JS 的人不該看到一排按不動的按鈕。
 */
(function () {
  'use strict';

  var KEY = 'blog.sort';
  var bar = document.getElementById('sortbar');
  var list = document.querySelector('.entries');
  if (!bar || !list) return;

  var items = [].slice.call(list.querySelectorAll('.entry-item'));
  if (items.length < 2) return;          // 一篇以下沒有排序的意義

  bar.hidden = false;

  var collator = window.Intl && Intl.Collator
    ? new Intl.Collator('zh-Hant')
    : { compare: function (a, b) { return a < b ? -1 : a > b ? 1 : 0; } };

  var ORDER = {
    'date-desc': function (a, b) { return b.date.localeCompare(a.date); },
    'date-asc':  function (a, b) { return a.date.localeCompare(b.date); },
    'title':     function (a, b) { return collator.compare(a.title, b.title); }
  };

  var rows = items.map(function (el) {
    return {
      el: el,
      date: el.getAttribute('data-date') || '',
      title: el.getAttribute('data-title') || ''
    };
  });

  function apply(mode) {
    var cmp = ORDER[mode];
    if (!cmp) return;

    // 先排好再一次寫回 DOM，避免每搬一個就重排版一次
    var frag = document.createDocumentFragment();
    rows.slice().sort(cmp).forEach(function (r) { frag.appendChild(r.el); });
    list.appendChild(frag);

    [].forEach.call(bar.querySelectorAll('[data-sort]'), function (b) {
      var on = b.getAttribute('data-sort') === mode;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('on', on);
    });

    try { localStorage.setItem(KEY, mode); } catch (e) { /* 無痕模式會擋，忽略 */ }
  }

  [].forEach.call(bar.querySelectorAll('[data-sort]'), function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-sort')); });
  });

  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
  apply(ORDER[saved] ? saved : 'date-desc');
})();
