import fs from 'fs';

function restoreDiv(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix early returns that were broken
  content = content.replace(
    /        <\/div>\n\s*\);\n\}/g,
    `        </div>\n      </div>\n    );\n  }`
  );
  
  // Actually, let me just add `</div>` before `); \n }` globally where it clearly needs a div.
  // Or better, I will find `\);\n}` and replace with `</div>\n);\n}` ? No, that's dangerous.
  
  // Let's use string manipulation for MillionaireView
  if (file.includes('MillionaireView')) {
     content = content.replace(
       /          <\/button>\n        <\/div>\n\s*\);\n\}/g,
       `          </button>\n        </div>\n      </div>\n    );\n  }`
     );
     content = content.replace(
       /      <\/div>\n\s*\);\n\}/g,
       `      </div>\n    </div>\n  );\n}`
     );
  }
  
  fs.writeFileSync(file, content);
}
restoreDiv('src/components/MillionaireView.tsx');
