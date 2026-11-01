/**
 * 首页「推荐阅读」区块
 * ---------------------------------------------------------------
 * 作用：在首页「About（介绍）段落之后、Writing（文章列表）之前」
 *      插入一条固定精选（推荐阅读），不再自动取最新更新的日记。
 *      当前固定推荐：迟暮（2026-10-19）。
 *
 * 特点：不修改主题任何文件（HTML 与样式均由本脚本在渲染后注入），
 *      样式覆写在 </head> 前，因此后续主题更新不会与本功能冲突。
 *
 * 可调参数：见下方 CONFIG.featured
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  // 固定精选条目：不再自动轮换/自动取最新日记
  featured: [
    {
      section: 'Diary',                     // 板块显示名
      title: '迟暮',                        // 标题
      decoratedTitle: '《迟暮》',            // 展示标题（带书名号）
      date: '2026-10-19',                   // 展示日期
      url: 'diary/2026-10-19-迟暮/'         // 跳转路径（相对站点根）
    }
  ]
};

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function formatDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 取固定精选条目 */
function pickFeaturedItems() {
  return CONFIG.featured.map(function (item) {
    return {
      section: item.section,
      title: item.title,
      decoratedTitle: item.decoratedTitle,
      date: new Date(item.date),
      url: item.url,
      kind: 'diary'
    };
  });
}

/* ------------------------- 样式 ------------------------- */
const STYLE = `
<style id="update-notice-style">
/* 首页推荐阅读区块（由 scripts/update-notice.js 注入，不占用主题样式文件） */
.content .update-notice {
  margin: 1.4em 0 1.8em;
  font-size: 0.8rem;
  line-height: 1.6;
  font-weight: 400;
}
.content .update-notice-link {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;
  padding: 0.5em 0.8em;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-left: 2px solid #d41c46;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.025);
  background-image: none;
  color: #8b8c8e;
  text-decoration: none;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.content .update-notice-link:hover,
.content .update-notice-link:focus {
  background-color: rgba(255, 255, 255, 0.05);
  background-image: none;
  border-color: rgba(255, 255, 255, 0.13);
  border-left-color: #d41c46;
  color: #b9babc;
}
.update-notice-badge {
  flex: 0 0 auto;
  padding: 0 0.45em;
  border: 1px solid rgba(212, 28, 70, 0.45);
  border-radius: 3px;
  color: #d41c46;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}
.update-notice-section {
  flex: 0 0 auto;
  color: #5bac4a;
  letter-spacing: 0.04em;
}
.update-notice-sep {
  flex: 0 0 auto;
  color: #555759;
}
.update-notice-title {
  flex: 1 1 auto;
  min-width: 0;
  color: #d8d9da;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.update-notice-date {
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: 0.6em;
  color: #6d6e70;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 480px) {
  .content .update-notice {
    margin: 1em 0 1.3em;
    font-size: 0.76rem;
  }
  .content .update-notice-link {
    gap: 0.35em;
    padding: 0.45em 0.6em;
  }
  .update-notice-badge {
    font-size: 0.68rem;
  }
  .update-notice-date {
    margin-left: 0;
    padding-left: 0.35em;
  }
}
</style>
`;

/* ------------------------- 标记 ------------------------- */
function buildNoticeHtml(items) {
  const urlFor = (function () {
    try {
      const helper = hexo.extend.helper.get('url_for');
      return function (p) { return helper.call(hexo, p); };
    } catch (e) {
      return function (p) { return '/' + String(p).replace(/^\/+/, ''); };
    }
  })();

  const rows = items.map(item => [
    '    <a class="update-notice-link" href="' + escapeHtml(urlFor(item.url)) + '">',
    '      <span class="update-notice-badge">推荐阅读</span>',
    '      <span class="update-notice-section">' + escapeHtml(item.section) + '</span>',
    '      <span class="update-notice-sep">·</span>',
    '      <span class="update-notice-title">' + escapeHtml(item.decoratedTitle) + '</span>',
    '      <time class="update-notice-date" datetime="' + formatDate(item.date) + '">' + formatDate(item.date) + '</time>',
    '    </a>'
  ].join('\n')).join('\n');

  return [
    '<aside class="update-notice" role="note" aria-label="推荐阅读">',
    rows,
    '</aside>',
    ''
  ].join('\n');
}

/* ------------------------- 注入 ------------------------- */
hexo.extend.filter.register('after_render:html', function (html, data) {
  // 仅首页
  if (!data || data.path !== 'index.html') return html;

  const items = pickFeaturedItems();
  if (!items.length) return html;

  const notice = buildNoticeHtml(items);
  // 位置：About（介绍）段落之后、Writing（文章列表）之前
  const anchor = /<section id="writing">/;
  const fallback = /(<section id="about">)/;

  if (anchor.test(html)) {
    html = html.replace(anchor, notice + '$&');
  } else if (fallback.test(html)) {
    html = html.replace(fallback, '$&' + notice);
  } else {
    hexo.log.warn('[update-notice] 未找到首页插入锚点，已跳过推荐阅读');
    return html;
  }

  if (html.indexOf('</head>') > -1) {
    html = html.replace('</head>', STYLE + '</head>');
  }

  hexo.log.info('[update-notice] 首页推荐阅读：' + items
    .map(i => i.section + ' ' + i.decoratedTitle + '（' + formatDate(i.date) + '）')
    .join('；'));

  return html;
});
