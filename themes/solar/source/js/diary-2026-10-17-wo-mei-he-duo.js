/* 《我没喝多》视频日记：循环静音自动播放保险 + 轻触切换声音（默认静音，点一下听现场） */
(function () {
  'use strict';
  var v = document.querySelector('.diary-post .content .diary-video');
  if (!v) { return; }
  v.muted = true;
  v.defaultMuted = true;
  var p = v.play();
  if (p && typeof p.catch === 'function') { p.catch(function () {}); }
  v.addEventListener('click', function () {
    v.muted = !v.muted;
  });
})();
