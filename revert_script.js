import fs from 'fs';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We have things like:
  //      </div>
  //     );
  //   }
  // That originated from:
  //    );
  //  }
  // Let's just fix the mismatched brackets manually.
  
  // Actually, wait, it's easier to remove the `<GlobalHeader>` and `<div className="pt-16...">` parts and the `</div>` we added.
  
  content = content.replace(/<GlobalHeader.*? \/>\n\s*<div className="pt-16 h-full overflow-y-auto">/g, '');
  
  // Clean up the `</div>\n      );` 
  content = content.replace(/\n\s*<\/div>(\n\s*)\);\n\s*}/g, '$1);\n  }');
  // Also clean up component root `</div>\n   ); \n };`
  content = content.replace(/\n\s*<\/div>(\n\s*)\);\n};/g, '$1);\n};');
  
  fs.writeFileSync(file, content);
}

['src/components/DashboardView.tsx', 'src/components/MillionaireView.tsx', 'src/components/FlashcardsView.tsx', 'src/components/CryptoPuzzleView.tsx', 'src/components/CoursesView.tsx', 'src/components/AssessmentView.tsx'].forEach(fixFile);
