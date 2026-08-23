/* 分享:手機用系統原生分享,桌機退成複製連結。
 *
 * 刻意不掛任何第三方分享按鈕 —— 那些幾乎都會夾帶追蹤腳本,
 * 而本站的原則是「無外部資源」。navigator.share 是瀏覽器內建的,
 * 不需要跟任何人交換資料。 */
(function () {
  'use strict';

  var box = document.querySelector('.share');
  if (!box) return;

  var url = box.getAttribute('data-url') || location.href;
  var title = box.getAttribute('data-title') || document.title;

  var btnShare = box.querySelector('.share-native');
  var btnCopy = box.querySelector('.share-copy');

  // 兩種能力都沒有(非 HTTPS 的舊桌機瀏覽器)就整段不出現 ——
  // 模板預設 hidden,由這裡打開,所以「沒有 JS」與「JS 跑了但沒能力」
  // 看起來是一樣的:什麼都不顯示,而不是一排按不動的按鈕。
  if (!navigator.share && !navigator.clipboard) return;
  box.hidden = false;

  // 沒有 navigator.share 的環境(多數桌機瀏覽器)直接把那顆藏掉,
  // 不要留一顆按下去沒反應的按鈕。
  if (btnShare) {
    if (navigator.share) {
      btnShare.hidden = false;
      btnShare.addEventListener('click', function () {
        navigator.share({ title: title, url: url }).catch(function () {
          /* 使用者自己取消也會走到這裡,不該當成錯誤報出來 */
        });
      });
    } else {
      btnShare.remove();
    }
  }

  if (btnCopy) {
    if (!navigator.clipboard) {
      // 非 HTTPS 時 clipboard 不存在。留一顆壞掉的按鈕比沒有更糟。
      btnCopy.remove();
      return;
    }

    btnCopy.addEventListener('click', function () {
      navigator.clipboard.writeText(url).then(function () {
        btnCopy.textContent = '已複製連結';
        btnCopy.classList.add('ok');
        setTimeout(function () {
          btnCopy.textContent = '複製連結';
          btnCopy.classList.remove('ok');
        }, 1600);
      }).catch(function () {
        btnCopy.textContent = '複製失敗';
        setTimeout(function () { btnCopy.textContent = '複製連結'; }, 1600);
      });
    });
  }
})();
