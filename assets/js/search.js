/* 站內搜尋。無外部相依 —— 不用 CDN、不用函式庫。
 *
 * 中文沒有詞界，所以不做斷詞，直接用子字串比對：查詢用空白切成多個詞，
 * 每個詞都必須出現（AND），比對位置決定分數。這個做法對中英夾雜的內容
 * 比任何斷詞器都可靠，而且十幾行就寫完。
 *
 * 所有插入 DOM 的文字都走 textContent。查詢字串會被回顯到結果裡，
 * 用 innerHTML 就是一個 XSS 洞。
 */
(function () {
  'use strict';

  var SECTIONS = {
    pitfalls:  '踩坑',
    decisions: '架構決策',
    projects:  '專案',
    notes:     '速查'
  };

  var input   = document.getElementById('q');
  var results = document.getElementById('results');
  var status  = document.getElementById('search-status');
  if (!input || !results) return;

  var index = null;
  var pending = null;

  function load() {
    if (index) return Promise.resolve(index);
    if (pending) return pending;
    pending = fetch(indexURL())
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) { index = data; return index; });
    return pending;
  }

  function indexURL() {
    // 相對於站台根目錄，baseURL 有沒有子路徑都能用
    var base = document.documentElement.getAttribute('data-baseurl') || '/';
    return base.replace(/\/+$/, '') + '/index.json';
  }

  /* 回傳 {score, hit, matched} —— hit 是內文命中位置（用來截摘要），
   * matched 是實際命中的詞（摘要高亮要用命中的那個，不是第一個）。
   *
   * requireAll=true  每個詞都要中（預設，精準）
   * requireAll=false 中一個就算（AND 掛零時的退化，404 頁尤其需要 ——
   *                  那裡的「查詢」是使用者打錯的網址，本來就不會完全符合）
   */
  function score(item, terms, requireAll) {
    var title = item.t.toLowerCase();
    var desc  = (item.d || '').toLowerCase();
    var tags  = (item.g || []).join(' ').toLowerCase();
    var body  = (item.b || '').toLowerCase();
    var total = 0;
    var hit   = -1;
    var matched = null;
    var hits = 0;

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var s = 0;
      if (title.indexOf(term) !== -1) s += 100;
      if (tags.indexOf(term)  !== -1) s += 40;
      if (desc.indexOf(term)  !== -1) s += 30;
      var b = body.indexOf(term);
      if (b !== -1) {
        s += 10;
        if (hit === -1) { hit = b; matched = term; }
      }
      if (s === 0) {
        if (requireAll) return null;
        continue;
      }
      hits++;
      total += s;
    }

    if (!hits) return null;
    // 命中越多詞排越前
    total += hits * 5;
    if (title === terms.join(' ')) total += 200;
    return { score: total, hit: hit, matched: matched || terms[0] };
  }

  /* 在命中處前後各取一段，回傳 [前段, 命中字, 後段] */
  function snippet(body, at, term) {
    if (at < 0) return null;
    var pad = 40;
    var from = Math.max(0, at - pad);
    var to = Math.min(body.length, at + term.length + pad);
    return [
      (from > 0 ? '…' : '') + body.slice(from, at),
      body.slice(at, at + term.length),
      body.slice(at + term.length, to) + (to < body.length ? '…' : '')
    ];
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;   // 一律 textContent
    return n;
  }

  function render(matches) {
    results.textContent = '';
    matches.forEach(function (m) {
      var item = m.item;
      var li = el('li');

      var a = el('a', 'entry');
      a.href = item.u;

      var meta = el('span', 'entry-date');
      meta.textContent = SECTIONS[item.s] || item.s;
      a.appendChild(meta);

      var title = el('span', 'entry-title', item.t);
      if (item.dr) {
        title.appendChild(document.createTextNode(' '));
        title.appendChild(el('em', 'draft-tag', '草稿'));
      }
      a.appendChild(title);
      li.appendChild(a);

      var sn = snippet(item.b || '', m.hit, m.matched);
      if (sn) {
        var p = el('p', 'entry-desc');
        p.appendChild(document.createTextNode(sn[0]));
        p.appendChild(el('mark', null, sn[1]));
        p.appendChild(document.createTextNode(sn[2]));
        li.appendChild(p);
      } else if (item.d) {
        li.appendChild(el('p', 'entry-desc', item.d));
      }

      results.appendChild(li);
    });
  }

  function search(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      results.textContent = '';
      status.textContent = '';
      return;
    }

    load().then(function (data) {
      function run(requireAll) {
        var out = [];
        data.forEach(function (item) {
          var r = score(item, terms, requireAll);
          if (r) out.push({ item: item, score: r.score, hit: r.hit, matched: r.matched });
        });
        return out.sort(function (a, b) { return b.score - a.score; });
      }

      var matches = run(true);
      var partial = false;
      // 全詞都要中卻掛零時退化成「中一個就算」。多詞查詢裡只要有一個詞
      // 打錯（404 頁自動帶入的網址尤其常見），使用者就會得到一片空白。
      if (!matches.length && terms.length > 1) {
        matches = run(false);
        partial = matches.length > 0;
      }

      if (!matches.length) {
        status.textContent = '沒有符合的文章。試試更短的關鍵字，或只打其中一個詞。';
      } else if (partial) {
        status.textContent = '沒有完全符合的文章。以下 ' + matches.length + ' 篇符合部分關鍵字:';
      } else {
        status.textContent = '找到 ' + matches.length + ' 篇';
      }
      render(matches.slice(0, 30));
    }).catch(function (e) {
      status.textContent = '搜尋索引載入失敗:' + e.message;
    });
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var q = input.value;
    timer = setTimeout(function () {
      search(q);
      // 讓搜尋結果可以被分享 / 上一頁
      var url = q ? '?q=' + encodeURIComponent(q) : location.pathname;
      history.replaceState(null, '', url);
    }, 120);
  });

  // 支援 /search/?q=xxx —— 404 頁會用這個把網址帶過來
  var initial = new URLSearchParams(location.search).get('q');
  if (initial) {
    input.value = initial;
    search(initial);
  }
  input.focus();
})();
