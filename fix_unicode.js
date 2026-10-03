const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let fixedCount = 0;

const replacements = {
  'dY"': '📦',
  'dY`\\<': '🐝',
  'dYZ\\%': '✨',
  'ðŸ“¦': '📦',
  'ðŸ‘¦': '👦',
  'ðŸŽ ': '🎁',
  'ðŸ“ž': '📞',
  'ðŸ  ': '🏠',
  'ðŸš€': '🚀',
  'â‚¹': '₹',
  'ðŸšš': '🚚',
  'ðŸ”’': '🔒',
  'â­ ': '⭐',
  'dY??': '✨',
  '': ''
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  // also strip out the literal replacement character if it exists
  content = content.replace(/\uFFFD/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files.`);