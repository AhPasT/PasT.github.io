/*!
 * diary-rain.js —— 随笔日记《雨》专属的稀疏细雨动效
 * 仅在该篇日记页面加载（见 themes/solar/layout/diary.ejs）
 * 设计取向：雨点稀疏、线条纤细、低对比度，只作气氛铺垫，不干扰阅读
 */
(function () {
  'use strict';

  if (window.__diaryRain) { return; }
  window.__diaryRain = true;

  // 尊重系统「减少动态效果」设置
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) { return; }

  var COLOR = '185, 190, 198'; // 与站点正文灰 #b9babc 同色系
  var WIND = 0.17;             // 风的倾角（越小越接近垂直）

  var canvas = document.createElement('canvas');
  canvas.id = 'diary-rain';
  canvas.setAttribute('aria-hidden', 'true');

  var style = document.createElement('style');
  style.textContent =
    '#diary-rain{position:fixed;top:0;left:0;width:100%;height:100%;' +
    'pointer-events:none;z-index:15;opacity:0;transition:opacity 1.6s ease;}' +
    '#diary-rain.is-visible{opacity:1;}';
  (document.head || document.documentElement).appendChild(style);

  var ctx = null;
  var W = 0, H = 0, dpr = 1;
  var layers = [];
  var rafId = null;
  var lastTs = 0;

  // 远层：更暗、更细、更慢；近层：稍亮、稍快
  var LAYER_SPEC = [
    { count: function (w) { return w < 640 ? 14 : (w < 1100 ? 22 : 30); }, speed: [120, 210], len: [8, 18], alpha: [0.06, 0.13], width: [0.7, 1.0] },
    { count: function (w) { return w < 640 ? 8 : (w < 1100 ? 14 : 20); }, speed: [230, 400], len: [14, 30], alpha: [0.10, 0.24], width: [0.9, 1.4] }
  ];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeDrop(spec, initial) {
    var len = rand(spec.len[0], spec.len[1]);
    return {
      x: Math.random() * (W + 160) - 80,
      y: initial ? Math.random() * (H + 80) - 80 : rand(-H * 0.35, -20),
      len: len,
      speed: rand(spec.speed[0], spec.speed[1]),
      alpha: rand(spec.alpha[0], spec.alpha[1]),
      width: rand(spec.width[0], spec.width[1]),
      drift: 0.8 + Math.random() * 0.5
    };
  }

  function build() {
    layers = LAYER_SPEC.map(function (spec) {
      var n = spec.count(W);
      var drops = [];
      for (var i = 0; i < n; i++) { drops.push(makeDrop(spec, true)); }
      return { spec: spec, drops: drops };
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    build();
  }

  function step(ts) {
    if (!lastTs) { lastTs = ts; }
    var dt = Math.min((ts - lastTs) / 1000, 0.05); // 切后台回来时避免跳帧
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);

    for (var l = 0; l < layers.length; l++) {
      var layer = layers[l];
      var drops = layer.drops;
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.speed * dt;
        d.x -= d.speed * WIND * d.drift * dt;

        if (d.y - d.len > H) {
          var nd = makeDrop(layer.spec, false);
          nd.x = Math.random() * (W + 160) - 40; // 重新从顶部随机横向位置落下
          nd.y = rand(-H * 0.25, -10);
          drops[i] = nd;
          continue;
        }

        ctx.globalAlpha = d.alpha;
        ctx.strokeStyle = 'rgb(' + COLOR + ')';
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * WIND * d.drift, d.y - d.len);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    rafId = window.requestAnimationFrame(step);
  }

  function start() {
    if (rafId !== null) { return; }
    lastTs = 0;
    canvas.classList.add('is-visible');
    rafId = window.requestAnimationFrame(step);
  }

  function stop() {
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, W, H);
  }

  function mount() {
    ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    document.body.appendChild(canvas);
    resize();
    start();

    var timer = null;
    window.addEventListener('resize', function () {
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(resize, 180);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
