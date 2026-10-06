/**
 * 全站访客追踪脚本注入（无感追踪，阶段：前端挂载）
 * ---------------------------------------------------------------
 * 作用：给站点所有 HTML 页面注入一行 <script defer src="/t/track.js"></script>，
 *      由 Cloudflare Worker（ahpast.top/t/*）负责打点与 Cookie 签发。
 *
 * 特点：不修改主题任何文件（与 scripts/update-notice.js 同一注入范式），
 *      主题后续升级不会与本功能冲突；脚本本身异步、延迟、无 UI、无权限申请。
 *
 * 关闭方式：把 ENABLED 改为 false 重新部署即可（页面不再上报）。
 */

const CONFIG = {
  ENABLED: true,
  SCRIPT_SRC: '/t/track.js'
};

hexo.extend.filter.register('after_render:html', function (html, data) {
  if (!CONFIG.ENABLED) return html;
  if (!data || !data.path || !/\.html?$/.test(data.path)) return html;
  if (html.indexOf(CONFIG.SCRIPT_SRC) !== -1) return html;
  if (html.indexOf('</head>') === -1) return html;

  const tag = '<script defer src="' + CONFIG.SCRIPT_SRC + '"></script>';
  return html.replace('</head>', tag + '\n</head>');
});
