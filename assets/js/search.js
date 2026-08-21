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

  var input   = document.getElementById('q');
  var results = document.getElementById('results');
  var status  = document.getElementById('search-status');
  var chipBox = document.getElementById('sect-chips');
  if (!input || !results) return;

  /* 分類名稱從 chip 的 data 屬性讀，不在這裡寫死一份 ——
   * 模板已經從 section 首頁產出這些值，抄第二份就會走鐘。 */
  var SECTIONS = {};
  var chips = chipBox ? [].slice.call(chipBox.querySelectorAll('.chip')) : [];
  chips.forEach(function (c) {
    SECTIONS[c.getAttribute('data-sect')] = c.getAttribute('data-name');
  });

  /* 被選起來的分類。空 = 不篩選。 */
  var picked = {};

  function pickedList() {
    return Object.keys(picked).filter(function (k) { return picked[k]; });
  }

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

  /* 分類圖示直接從 chip 複製一份 —— path 資料只存在模板裡，
   * JS 不再抄一份 SVG。沒有 chip（例如 404 頁）就不畫圖示。 */
  function iconFor(sect) {
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute('data-sect') !== sect) continue;
      var svg = chips[i].querySelector('svg');
      return svg ? svg.cloneNode(true) : null;
    }
    return null;
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

      if (item.c) {
        var img = el('img', 'cover cover-thumb');
        img.src = item.c;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = '';
        a.appendChild(img);
      }

      var body = el('span', 'entry-body');

      var meta = el('span', 'entry-meta');
      var icon = iconFor(item.s);
      if (icon) meta.appendChild(icon);
      meta.appendChild(el('span', 'entry-sect', SECTIONS[item.s] || item.s));
      meta.appendChild(el('time', null, item.dt || ''));
      if (item.dr) meta.appendChild(el('em', 'draft-tag', '草稿'));
      body.appendChild(meta);

      body.appendChild(el('span', 'entry-title', item.t));

      var sn = snippet(item.b || '', m.hit, m.matched);
      if (sn) {
        var p = el('span', 'entry-desc');
        p.appendChild(document.createTextNode(sn[0]));
        p.appendChild(el('mark', null, sn[1]));
        p.appendChild(document.createTextNode(sn[2]));
        body.appendChild(p);
      } else if (item.d) {
        body.appendChild(el('span', 'entry-desc', item.d));
      }

      a.appendChild(body);
      li.appendChild(a);
      results.appendChild(li);
    });
  }

  function search(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var sects = pickedList();

    if (!terms.length && !sects.length) {
      results.textContent = '';
      status.textContent = '';
      return;
    }

    load().then(function (data) {
      // 先依分類縮小範圍，再算分數。索引本身已依日期新到舊排好。
      var pool = sects.length
        ? data.filter(function (i) { return sects.indexOf(i.s) !== -1; })
        : data;

      var names = sects.map(function (k) { return SECTIONS[k] || k; }).join('、');

      // 只點分類、沒打關鍵字 —— 當成「瀏覽這幾個分類」，直接列出來
      if (!terms.length) {
        if (!pool.length) {
          status.textContent = names + ' 還沒有文章。';
          results.textContent = '';
          return;
        }
        status.textContent = names + ' 共 ' + pool.length + ' 篇';
        render(pool.slice(0, 30).map(function (i) {
          return { item: i, score: 0, hit: -1, matched: '' };
        }));
        return;
      }

      function run(requireAll) {
        var out = [];
        pool.forEach(function (item) {
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

      var scope = sects.length ? '（限 ' + names + '）' : '';
      if (!matches.length) {
        status.textContent = sects.length
          ? names + ' 裡沒有符合的文章。取消分類篩選再試一次，或換個關鍵字。'
          : '沒有符合的文章。試試更短的關鍵字，或只打其中一個詞。';
      } else if (partial) {
        status.textContent = '沒有完全符合的文章。以下 ' + matches.length + ' 篇符合部分關鍵字' + scope + '：';
      } else {
        status.textContent = '找到 ' + matches.length + ' 篇' + scope;
      }
      render(matches.slice(0, 30));
    }).catch(function (e) {
      status.textContent = '搜尋索引載入失敗：' + e.message;
    });
  }

  /* 把目前狀態寫回網址，讓結果可以分享、可以按上一頁 */
  function syncURL() {
    var parts = [];
    if (input.value) parts.push('q=' + encodeURIComponent(input.value));
    var sects = pickedList();
    if (sects.length) parts.push('s=' + encodeURIComponent(sects.join(',')));
    history.replaceState(null, '', parts.length ? '?' + parts.join('&') : location.pathname);
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      search(input.value);
      syncURL();
    }, 120);
  });

  // 分類 chip：點一下切換，可以複選。空的就是不篩選。
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var k = c.getAttribute('data-sect');
      picked[k] = !picked[k];
      c.setAttribute('aria-pressed', picked[k] ? 'true' : 'false');
      c.classList.toggle('on', !!picked[k]);
      search(input.value);
      syncURL();
    });
  });

  // 支援 /search/?q=xxx&s=pitfalls,notes —— 404 頁會用 q 把網址帶過來
  var params = new URLSearchParams(location.search);
  var initialQ = params.get('q');
  var initialS = params.get('s');
  if (initialQ) input.value = initialQ;
  if (initialS) {
    initialS.split(',').filter(Boolean).forEach(function (k) {
      picked[k] = true;
      chips.forEach(function (c) {
        if (c.getAttribute('data-sect') !== k) return;
        c.setAttribute('aria-pressed', 'true');
        c.classList.add('on');
      });
    });
  }
  if (initialQ || initialS) search(input.value);
  input.focus();
})();
