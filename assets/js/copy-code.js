/* 程式碼區塊的複製按鈕。速查型內容用得最兇 —— 沒有它每次都要手動選取，
 * 而選到行號或多選到一個換行是很常見的挫折來源。 */
(function () {
  'use strict';

  var blocks = document.querySelectorAll('.content pre');
  if (!blocks.length || !navigator.clipboard) return;

  blocks.forEach(function (pre) {
    var wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = '複製';
    btn.setAttribute('aria-label', '複製程式碼');

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      navigator.clipboard.writeText(code.innerText).then(function () {
        btn.textContent = '已複製';
        btn.classList.add('ok');
        setTimeout(function () {
          btn.textContent = '複製';
          btn.classList.remove('ok');
        }, 1600);
      }).catch(function () {
        // 非 HTTPS 或權限被拒時 clipboard API 會失敗，要講清楚而不是靜默
        btn.textContent = '複製失敗';
        setTimeout(function () { btn.textContent = '複製'; }, 1600);
      });
    });

    wrap.appendChild(btn);
  });
})();
