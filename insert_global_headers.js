import fs from 'fs';

const filesToUpdate = [
  'src/components/DashboardView.tsx',
  'src/components/AssessmentView.tsx',
  'src/components/MillionaireView.tsx',
  'src/components/FlashcardsView.tsx',
  'src/components/CryptoPuzzleView.tsx',
  'src/components/CoursesView.tsx'
];

for (const file of filesToUpdate) {
  let content;
  try {
     content = fs.readFileSync(file, 'utf8');
  } catch (e) {
     continue; // File may not exist yet
  }
  
  if (content.includes('GlobalHeader')) continue;

  // Add import
  content = content.replace(
    /(import React.*?;)/,
    `$1\nimport { GlobalHeader } from './GlobalHeader';`
  );

  // Add GlobalHeader in return. They usually have a top-level div
  content = content.replace(
    /return \(\s*<div.*?>/,
    (match) => {
      // Find what props we have
      const hasStudentName = content.includes('studentName');
      const hasStudentLevel = content.includes('studentLevel');
      
      let props = `onBack={onBack}`;
      if (hasStudentName) props += ` studentName={studentName}`;
      if (hasStudentLevel) props += ` studentLevel={studentLevel}`;
      // In Dashboard, onBack might just be empty or we might want to hide the dashboard button
      if (file.includes('DashboardView')) {
        props = `studentName={studentName} studentLevel={studentLevel} showDashboardButton={false}`;
      }

      return `${match}\n      <GlobalHeader ${props} />\n      <div className="pt-16 h-full overflow-y-auto">`
    }
  );
  
  // Close the padding div at the end if we added it
  content = content.replace(
    /(\n\s*)\);\n};/g,
    `\n      </div>$1);\n};`
  );

  // Exception for AssessmentView which has 'if (isFinished) return (...)'
  if (file.includes('AssessmentView')) {
     content = content.replace(
       /if \(isFinished\) \{[\s\S]*?return \(\s*<div.*?>/s,
       (match) => {
          return `${match}\n      <GlobalHeader onBack={onBack} studentName={studentName} studentLevel={studentLevel} />\n      <div className="pt-16 h-full overflow-y-auto">`;
       }
     );
     // And close it
     content = content.replace(
       /<\/main>\n\s*<\/div>\n\s*\);\n\s*\}/s,
       `</main>\n      </div>\n      </div>\n    );\n  }`
     );
  }

  // Remove existing headers if they exist
  if (file.includes('AssessmentView')) {
      content = content.replace(/<header className="sticky top-0 z-50.*?<\/header>/s, '');
      content = content.replace(/<header className="p-8 border-b.*?<\/header>/s, '');
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
