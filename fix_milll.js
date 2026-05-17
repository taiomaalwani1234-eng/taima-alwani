import fs from 'fs';

function fixMillionaire() {
  let content = fs.readFileSync('src/components/MillionaireView.tsx', 'utf8');

  // Fix early return for gameOver
  content = content.replace(
    /<\/button>\n\s*<\/div>\n\s*\);\n\s*\}/s,
    `</button>\n        </div>\n      </div>\n    );\n  }`
  );

  // Fix main return
  content = content.replace(
    /<\/div>\n\s*\);\n\s*\}/gs,
     `</div>\n    );\n}`
  );
  
  const m1 = content.match(/<\/button>\n\s*<\/div>\n\s*\);\n\s*\}/g);
  console.log("Found matches in early return?", !!m1);

  fs.writeFileSync('src/components/MillionaireView.tsx', content);
}
fixMillionaire();
