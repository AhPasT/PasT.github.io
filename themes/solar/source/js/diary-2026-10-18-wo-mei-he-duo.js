/* 《我没喝多》视频日记：自定义时间轴播放器
 * 功能：静音自动播放（氛围循环） / 进度条（可拖动 seek）/ 当前时间 / 总时长 / 轻触切换声音
 * 兼容移动端：pointer 事件统一处理触摸与鼠标，触控目标放大
 */
(function () {
  'use strict';
  var v = document.querySelector('.diary-post .content .diary-video');
  if (!v) { return; }
  var wrap = document.querySelector('.diary-post .content .diary-video-player');
  if (!wrap) { return; }

  var fill = wrap.querySelector('.dwp-progress-fill');
  var thumb = wrap.querySelector('.dwp-progress-thumb');
  var progress = wrap.querySelector('.dwp-progress');
  var timeEl = wrap.querySelector('.dwp-time');
  var durEl = wrap.querySelector('.dwp-duration');
  var muteBtn = wrap.querySelector('.dwp-mute');

  function fmt(t) {
    if (!isFinite(t) || t < 0) { t = 0; }
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setProgress(ratio) {
    if (!isFinite(ratio)) { ratio = 0; }
    var pct = Math.max(0, Math.min(100, ratio * 100));
    fill.style.width = pct + '%';
    thumb.style.left = pct + '%';
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  /* 静音自动播放 */
  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute('autoplay', '');
  var p = v.play();
  if (p && typeof p.catch === 'function') { p.catch(function () {}); }

  /* 元数据就绪：总时长 */
  function onMeta() {
    durEl.textContent = fmt(v.duration);
  }
  if (v.readyState >= 1) { onMeta(); }
  else { v.addEventListener('loadedmetadata', onMeta); }

  /* 播放中：更新时间与进度 */
  v.addEventListener('timeupdate', function () {
    timeEl.textContent = fmt(v.currentTime);
    if (v.duration) { setProgress(v.currentTime / v.duration); }
  });
  v.addEventListener('durationchange', onMeta);
  v.addEventListener('ended', function () { timeEl.textContent = fmt(v.duration); });

  /* 拖动进度条 seek：pointer 事件（触摸/鼠标统一） */
  var dragging = false;

  function ratioFromEvent(e) {
    var rect = progress.getBoundingClientRect();
    if (!rect.width) { return 0; }
    var x = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX) - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }

  function seekTo(e) {
    var r = ratioFromEvent(e);
    if (v.duration) {
      v.currentTime = r * v.duration;
      timeEl.textContent = fmt(v.currentTime);
      setProgress(r);
    }
  }

  progress.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    dragging = true;
    progress.setPointerCapture(e.pointerId);
    seekTo(e);
  });
  progress.addEventListener('pointermove', function (e) {
    if (!dragging) { return; }
    e.preventDefault();
    seekTo(e);
  });
  function endDrag(e) {
    if (!dragging) { return; }
    dragging = false;
    if (e && e.type === 'pointerup') { seekTo(e); }
  }
  progress.addEventListener('pointerup', endDrag);
  progress.addEventListener('pointercancel', endDrag);

  /* 键盘可达：左右方向键微调 */
  progress.addEventListener('keydown', function (e) {
    if (!v.duration) { return; }
    var step = (e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0);
    if (!step) { return; }
    e.preventDefault();
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + step));
    timeEl.textContent = fmt(v.currentTime);
    setProgress(v.currentTime / v.duration);
  });

  /* 轻触视频 = 播放/暂停；静音按钮 = 切声 */
  v.addEventListener('click', function () {
    if (v.paused) { v.play().catch(function () {}); }
    else { v.pause(); }
  });
  muteBtn.addEventListener('click', function () {
    v.muted = !v.muted;
    muteBtn.setAttribute('aria-pressed', String(v.muted));
    muteBtn.textContent = v.muted ? '静音' : '有声';
  });
})();
