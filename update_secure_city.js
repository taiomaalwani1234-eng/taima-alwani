import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

// remove theme block
content = content.replace(
  /const \[theme, setTheme\] = useState<'light' | 'dark'>.*?}, \[theme\]\);/s,
  ''
);

// remove notifications state
content = content.replace(
  /const \[showNotifications, setShowNotifications\] = useState\(false\);\n\s*const \[showSettingsProfile, setShowSettingsProfile\] = useState\(false\);/,
  ''
);

// Add GlobalHeader import
content = content.replace(
  /import \{ CityMap, Sector \} from '\.\/Map';/,
  `import { CityMap, Sector } from './Map';\nimport { GlobalHeader } from './GlobalHeader';`
);

// replace header
content = content.replace(
  /<header.*?<\/header>/s,
  `{/* Navigation Shell moved to GlobalHeader inside App, wait we just drop it here directly */}
      <GlobalHeader onBack={onBack} studentName={studentName} studentLevel={studentLevel} budget={budget} />`
);

// Now for the budget inside Tactical Control
content = content.replace(
  /<button\n\s*onClick=\{\(\) => setShowThreatIntel\(!showThreatIntel\)\}/,
  `<div className="mb-4">
                {/* Budget area moved under Tactical Panel */}
                <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-right mb-2">
                  <div className="font-label-caps text-[10px] text-on-surface-variant mb-1">الرصيد المتاح (BUDGET) - غرفة الصرافة</div>
                  <div className={\`font-bold text-lg \${budget < 20000 ? 'text-error' : 'text-primary'}\`}>
                    $\${budget.toLocaleString()}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowThreatIntel(!showThreatIntel)}`
);

// remove the older budget area
content = content.replace(
  /<div className="mt-8 p-4 bg-surface-container-low border border-outline-variant\/20 rounded-xl text-right">[\s\S]*?<\/div>\s*<\/div>/,
  ''
);

fs.writeFileSync('src/components/SecureCityView.tsx', content);
