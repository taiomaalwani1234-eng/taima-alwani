import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

// 1. Remove "لاعب ضد لاعب" code and change mode selection
content = content.replace(
  /className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"/,
  'className="grid grid-cols-1 gap-8 w-full max-w-md mx-auto"'
);
content = content.replace(
  /<button\s+onClick=\{\(\) => \{ setPlayMode\('person'\); setGameState\('menu'\); \}\}.*?<\/button>/s,
  ''
);
// Make the remaining button skip immediately to menu or maybe just remove playMode selection entirely 
// Wait, the user just said "احذف لي لاعب ضد لاعب", so just removing the button is fine.

// 2. Fix theme useEffect
content = content.replace(
  "const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');",
  `const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);`
);
// Fix the theme toggle button action to actually toggle
content = content.replace(
  /className="transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary\/20"/g,
  `onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary/20"`
);

// Fix the bell icon button action
content = content.replace(
  /<button className="text-primary active:scale-95"><Notifications className="w-5 h-5"\/><\/button>/g,
  `<button className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"><Notifications className="w-5 h-5"/></button>`
);

// 3. Add states for Panels
if (!content.includes('const [showTerminal, setShowTerminal]')) {
  content = content.replace(
    /const \[gameState, setGameState\] = useState<'mode_selection' \| 'menu' \| 'playing'>\('mode_selection'\);/,
    `const [gameState, setGameState] = useState<'mode_selection' | 'menu' | 'playing'>('mode_selection');
  const [showTerminal, setShowTerminal] = useState(false);
  const [showThreatIntel, setShowThreatIntel] = useState(false);`
  );
}

// 4. Wrap Terminal and Threat Intel panels in conditionals
// Threat intel panel
content = content.replace(
  /<div className="glass-panel bg-surface-container-low\/80 p-5 rounded-xl shrink-0">/,
  `{showThreatIntel && (<div className="glass-panel bg-surface-container-low/80 p-5 rounded-xl shrink-0">`
);
content = content.replace(
  /جميع قنوات الاتصال والشبكات الفرعية تعمل بكفاءة تامة\.'\}\n\s*<\/p>\n\s*<\/div>/s,
  `جميع قنوات الاتصال والشبكات الفرعية تعمل بكفاءة تامة.'}
                  </p>
                </div>)}`
);

// Terminal panel
content = content.replace(
  /<div className="glass-panel bg-surface-container-low\/80 rounded-xl flex-1 flex flex-col overflow-hidden min-h-0">/,
  `{showTerminal && (<div className="glass-panel bg-surface-container-low/80 rounded-xl flex-1 flex flex-col overflow-hidden min-h-0">`
);
content = content.replace(
  /<\/form>\n\s*\)\s*:\s*null\}\n\s*<\/div>/,
  `</form>
                  ) : null}
                </div>)}`
);

// 5. Update Sidebar navigation with toggles and budget
content = content.replace(
  /<nav className="flex-1 px-4 space-y-2">.*?<\/nav>/s,
  `<nav className="flex-1 px-4 space-y-2">
              <button className="w-full flex items-center justify-end gap-3 px-4 py-3 bg-primary/10 text-primary border-r-2 border-primary transition-all duration-300">
                <span className="font-body-main font-bold">لوحة التحكم التكتيكية</span>
                <Dashboard className="w-5 h-5"/>
              </button>
              
              <button 
                onClick={() => setShowThreatIntel(!showThreatIntel)}
                className={\`w-full flex items-center justify-end gap-3 px-4 py-3 transition-all duration-300 \${showThreatIntel ? 'bg-error/10 text-error border-r-2 border-error' : 'bg-surface hover:bg-surface-variant text-on-surface'}\`}
              >
                <span className="font-body-main font-bold">حالة الشبكة (Threat Intel)</span>
                <ShieldAlert className="w-5 h-5"/>
              </button>

              <button 
                onClick={() => setShowTerminal(!showTerminal)}
                className={\`w-full flex items-center justify-end gap-3 px-4 py-3 transition-all duration-300 \${showTerminal ? 'bg-secondary/10 text-secondary border-r-2 border-secondary' : 'bg-surface hover:bg-surface-variant text-on-surface'}\`}
              >
                <span className="font-body-main font-bold">التيرمينال (Terminal)</span>
                <TerminalIcon className="w-5 h-5"/>
              </button>

              <div className="mt-8 p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl text-right">
                <div className="font-label-caps text-[10px] text-on-surface-variant mb-1">الرصيد المتاح (BUDGET)</div>
                <div className={\`font-bold text-lg \${budget < 20000 ? 'text-error' : 'text-primary'}\`}>
                  $\${budget.toLocaleString()}
                </div>
              </div>
            </nav>`
);

// 6. Delete budget overlay from where it was if it's there
// Wait, is there a budget overlay elsewhere?
// I see around line 506: "div className="glass-panel bg-surface-container-low/80 p-5 rounded-xl shrink-0"" let's just make sure we remove the original occurrences if they are redundant, but maybe it's fine to leave it or remove it. Let me just replace the original budget part later if needed.
// Actually, earlier I searched for budget and found it on line 522.
content = content.replace(
  /<div className="glass-panel bg-surface-container-low\/80 p-5 rounded-xl shrink-0">\s*<div className="flex justify-between items-center mb-4">\s*<span className="font-label-caps text-\[12px\] font-bold tracking-\[0\.15em\] text-on-surface-variant">RESOURCE_ALLOC<\/span>[\s\S]*?<\/div>\s*<\/div>/s,
  ''
);

fs.writeFileSync('src/components/SecureCityView.tsx', content);
console.log('SecureCityView.tsx updated.');
