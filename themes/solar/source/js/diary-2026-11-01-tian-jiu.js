/* 日记「甜酒」背景音乐：点击页面任意处触发播放，无可见控件，预缓存防卡顿 */
(function () {
  var started = false;
  var bgm = new Audio();
  bgm.src = 'audio.mp3';
  bgm.preload = 'auto';
  bgm.volume = 0.45;
  bgm.loop = true;

  function tryPlay() {
    if (started) return;
    started = true;
    bgm.play().catch(function () {});
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('keydown', tryPlay);
    document.removeEventListener('touchstart', tryPlay);
  }

  document.addEventListener('click', tryPlay, { passive: true });
  document.addEventListener('keydown', tryPlay, { passive: true });
  document.addEventListener('touchstart', tryPlay, { passive: true });
})();
