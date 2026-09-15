/**
 * 首页「更新提示」横条
 * ---------------------------------------------------------------
 * 作用：扫描日记（source/diary/*.md）与文章（source/_posts），
 *      找出最近一次更新，并在首页「About（介绍）段落之后、Writing（文章列表）之前」
 *      插入一条小字提示，写明「板块 · 内容标题 · 日期」，整条可点击跳转到对应页面。
 *
 * 特点：不修改主题任何文件（HTML 与样式均由本脚本在渲染后注入），
 *      样式覆写在 </head> 前，因此后续主题更新不会与本功能冲突。
 *
 * 可调参数：见下方 CONFIG
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  recentDays: 30,   // 最新更新距今天数超过该值则认为「近期无更新」，不显示提示
  maxItems: 1,      // 最多展示几条（1 = 仅展示最新一条，保持「一条小字」的克制感）
  sections: {
    diary: 'Diary',   // 日记板块显示名
    post: 'Writing'   // 文章板块显示名
  }
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

function cleanValue(raw) {
  return String(raw).trim().replace(/^["']/, '').replace(/["']$/, '').trim();
}

/** 收集日记条目 */
function collectDiaryItems() {
  const diaryDir = path.join(hexo.source_dir, 'diary');
  if (!fs.existsSync(diaryDir)) return [];

  return fs.readdirSync(diaryDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(file => {
      const raw = fs.readFileSync(path.join(diaryDir, file), 'utf-8');
      const slug = file.replace(/\.md$/, '');
      let title = '';
      let dateStr = '';

      const fmMatch = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        const titleMatch = fmMatch[1].match(/^title:\s*(.+)$/m);
        if (titleMatch) title = cleanValue(titleMatch[1]);
        const dateMatch = fmMatch[1].match(/^date:\s*(.+)$/m);
        if (dateMatch) dateStr = cleanValue(dateMatch[1]);
      }
      if (!title) title = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');

      const date = new Date(dateStr || slug.slice(0, 10));
      return {
        section: CONFIG.sections.diary,
        title: title,
        decoratedTitle: '《' + title + '》',
        date: date,
        url: 'diary/' + slug + '/',
        kind: 'diary'
      };
    })
    .filter(item => !isNaN(item.date.getTime()));
}

/** 收集文章条目 */
function collectPostItems() {
  const posts = hexo.locals.get('posts');
  if (!posts || !posts.length) return [];

  const items = [];
  posts.each(post => {
    const date = new Date(post.date);
    if (isNaN(date.getTime())) return;
    items.push({
      section: CONFIG.sections.post,
      title: post.title,
      decoratedTitle: post.title,
      date: date,
      url: post.path,
      kind: 'post'
    });
  });
  return items;
}

function pickRecentItems() {
  const now = Date.now();
  const all = collectDiaryItems().concat(collectPostItems())
    .sort((a, b) => b.date - a.date);

  return all
    .filter(item => (now - item.date.getTime()) / MS_PER_DAY <= CONFIG.recentDays)
    .slice(0, CONFIG.maxItems);
}

/* ------------------------- 样式 ------------------------- */
const STYLE = `
<style id="update-notice-style">
/* 首页更新提示横条（由 scripts/update-notice.js 注入，不占用主题样式文件） */
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
    '      <span class="update-notice-badge">更新</span>',
    '      <span class="update-notice-section">' + escapeHtml(item.section) + '</span>',
    '      <span class="update-notice-sep">·</span>',
    '      <span class="update-notice-title">' + escapeHtml(item.decoratedTitle) + '</span>',
    '      <time class="update-notice-date" datetime="' + formatDate(item.date) + '">' + formatDate(item.date) + '</time>',
    '    </a>'
  ].join('\n')).join('\n');

  return [
    '<aside class="update-notice" role="note" aria-label="最近更新">',
    rows,
    '</aside>',
    ''
  ].join('\n');
}

/* ------------------------- 注入 ------------------------- */
hexo.extend.filter.register('after_render:html', function (html, data) {
  // 仅首页
  if (!data || data.path !== 'index.html') return html;

  const items = pickRecentItems();
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
    hexo.log.warn('[update-notice] 未找到首页插入锚点，已跳过更新提示');
    return html;
  }

  if (html.indexOf('</head>') > -1) {
    html = html.replace('</head>', STYLE + '</head>');
  }

  hexo.log.info('[update-notice] 首页更新提示：' + items
    .map(i => i.section + ' ' + i.decoratedTitle + '（' + formatDate(i.date) + '）')
    .join('；'));

  return html;
});
