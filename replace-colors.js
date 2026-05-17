import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// We map old hardcoded colors to semantic theme variables
const replacements = [
  { search: /\[#B44C32\]/gi, replace: 'primary' },
  { search: /\[#f8f5f2\]/gi, replace: 'background' },
  { search: /\[#eeeae5\]/gi, replace: 'surface-variant' },
  { search: /\[#f0edea\]/gi, replace: 'surface-container' },
  { search: /\[#1a1a1a\]/gi, replace: 'on-background' },
  { search: /\[#141414\]/gi, replace: 'surface-container-low' },
  { search: /\[#111111\]/gi, replace: 'surface-container-lowest' },
  { search: /\[#222222\]/gi, replace: 'surface-container' },
  { search: /\[#222\]/gi, replace: 'surface-container' },
  { search: /\[#121212\]/gi, replace: 'surface-container-lowest' },
  { search: /\[#2a2a2a\]/gi, replace: 'surface-container-high' },
  { search: /\[#1e1e1e\]/gi, replace: 'surface' },
  { search: /\[#0a0a0a\]/gi, replace: 'surface-container-lowest' },
  { search: /\[#ffffff\]/gi, replace: 'white' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content;
      replacements.forEach(({ search, replace }) => {
        newContent = newContent.replace(search, replace);
      });
      // specific dashboard overrides
      newContent = newContent.replace(/bg-\[\#08132a\]/g, 'bg-background');
      newContent = newContent.replace(/bg-\[\#151f37\]/g, 'bg-surface');
      newContent = newContent.replace(/bg-\[\#2a344d\]/g, 'bg-surface-variant');
      newContent = newContent.replace(/text-\[\#00382d\]/g, 'text-on-primary-container');
      newContent = newContent.replace(/bg-\[\#5ffbd6\]/g, 'bg-primary-container');
      newContent = newContent.replace(/border-\[\#85948e\]/g, 'border-outline');
      
      newContent = newContent.replace(/bg-transparent hover:bg-background\/5/g, 'bg-transparent hover:bg-primary/10');
      
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
