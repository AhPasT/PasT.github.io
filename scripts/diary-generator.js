const fs = require('fs');
const path = require('path');
const moment = require('moment');

hexo.extend.generator.register('diary', function(locals) {
  const diaryDir = path.join(hexo.source_dir, 'diary');
  
  if (!fs.existsSync(diaryDir)) return [];
  
  const files = fs.readdirSync(diaryDir).filter(f => f.endsWith('.md') && f !== 'index.md');
  
  const entries = files.map(file => {
    const filePath = path.join(diaryDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    
    let title = '';
    let date = '';
    let content = raw;
    
    // Parse front matter
    const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (fmMatch) {
      const fm = fmMatch[1];
      content = fmMatch[2];
      
      const titleMatch = fm.match(/^title:\s*(.+)$/m);
      if (titleMatch) title = titleMatch[1].trim();
      
      const dateMatch = fm.match(/^date:\s*(.+)$/m);
      if (dateMatch) date = dateMatch[1].trim();
    }
    
    if (!title) {
      title = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
    }
    
    if (!date) {
      const dateFromFile = file.match(/^(\d{4}-\d{2}-\d{2})/);
      date = dateFromFile ? dateFromFile[1] : moment(fs.statSync(filePath).mtime).format('YYYY-MM-DD');
    }
    
    const slug = file.replace(/\.md$/, '');
    
    return {
      title: title,
      date: moment(date),
      slug: slug,
      content: content,
      path: 'diary/' + slug + '/index.html'
    };
  }).sort((a, b) => b.date - a.date);
  
  const routes = [];
  
  // Diary index page
  routes.push({
    path: 'diary/index.html',
    data: {
      entries: entries,
      type: 'diary'
    },
    layout: 'diary'
  });
  
  // Individual diary pages
  entries.forEach(entry => {
    routes.push({
      path: entry.path,
      data: {
        entry: entry,
        type: 'diary-post'
      },
      layout: 'diary'
    });
  });
  
  return routes;
});
