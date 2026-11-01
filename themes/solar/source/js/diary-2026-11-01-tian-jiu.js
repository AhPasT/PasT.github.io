/* 日记「甜酒」背景音乐：可控播放 + 预缓存防卡顿 */
(function () {
  var btn = document.getElementById('tjBgmBtn');
  if (!btn) return;

  var bgm = new Audio();
  bgm.src = 'audio.mp3';
  bgm.preload = 'auto';
  bgm.volume = 0.45;

  var icon = btn.querySelector('.tj-bgm-icon');
  var txt = btn.querySelector('.tj-bgm-txt');

  btn.addEventListener('click', function () {
    if (bgm.paused) {
      bgm.play().catch(function () {});
      btn.classList.add('playing');
      txt.textContent = '暂停';
      btn.setAttribute('aria-label', '背景音乐暂停');
    } else {
      bgm.pause();
      btn.classList.remove('playing');
      txt.textContent = '背景音乐';
      btn.setAttribute('aria-label', '背景音乐播放/暂停');
    }
  });

  bgm.addEventListener('ended', function () {
    btn.classList.remove('playing');
    txt.textContent = '背景音乐';
  });
})();
