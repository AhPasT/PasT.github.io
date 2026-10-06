/* 实况照片（Live Photo）渲染：同名 jpg + mp4 同时存在时，渲染为循环、静音、自动播放的视频（poster 用 jpg）；
   不存在 mp4 或探测失败时退化为静态图。仅 2026-10-03 / 2026-10-05 / 2026-10-06 日记页加载，纯加法，不影响其他日记与页面。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(img, mp4) {
    var video = document.createElement('video');
    video.className = (img.className ? img.className + ' ' : '') + 'live-photo';
    video.src = mp4;
    video.poster = img.currentSrc || img.src;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('preload', 'auto');
    video.setAttribute('aria-label', img.getAttribute('alt') || '实况照片');
    // 视频解码失败时回退为静态图，保证内容不丢
    video.addEventListener('error', function () {
      if (video.parentNode) { video.parentNode.replaceChild(img, video); }
    });
    img.parentNode.replaceChild(video, img);
    var p = video.play();
    if (p && typeof p.catch === 'function') { p.catch(function () {}); }
  }

  function upgrade(img) {
    var src = img.getAttribute('src') || '';
    if (!/\.(jpe?g)$/i.test(src)) { return; }
    var mp4 = src.replace(/\.(jpe?g)$/i, '.mp4');
    fetch(mp4, { method: 'HEAD' })
      .then(function (res) {
        if (!res.ok) { return; }                       // 无同名 mp4：保持静态图
        var type = res.headers.get('content-type') || '';
        if (type && type.indexOf('video') === -1) { return; }
        mount(img, mp4);
      })
      .catch(function () { /* 探测失败：保持静态图 */ });
  }

  function run() {
    if (reduceMotion) { return; }                      // 用户偏好减弱动效：仅展示静态图
    var imgs = document.querySelectorAll('.diary-post .content img');
    Array.prototype.forEach.call(imgs, upgrade);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
