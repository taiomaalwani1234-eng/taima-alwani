import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

content = content.replace(
  /<div className="flex h-full w-full pt-16">/,
  '<div className="flex flex-col lg:flex-row h-full w-full pt-16">'
);

content = content.replace(
  /<aside className="w-64 flex flex-col h-full bg-surface-container-low\/90 border-l border-outline-variant\/20 z-40 relative">/,
  '<aside className="order-2 lg:order-1 w-full lg:w-96 flex flex-col h-[50vh] lg:h-full bg-surface-container-low border-t lg:border-t-0 lg:border-l border-outline-variant/20 z-40 relative overflow-y-auto">'
);

const threatIntelRegex = /\{showThreatIntel && \(\s*<div className="glass-panel bg-surface-container-low\/80 p-5 rounded-xl shrink-0">([\s\S]*?)<\/div>\s*\)\}/;
const threatMatch = content.match(threatIntelRegex);
let threatContent = '';
if (threatMatch) {
  threatContent = `{showThreatIntel && (<div className="bg-surface-container-lowest p-4 rounded-xl shrink-0 border border-outline-variant/20">${threatMatch[1]}</div>)}`;
  content = content.replace(threatIntelRegex, '');
}

const terminalRegex = /\{showTerminal && \(\s*<div className="glass-panel bg-surface-container-low\/80 rounded-xl flex-1 flex flex-col overflow-hidden min-h-0">([\s\S]*?)<\/form>\n\s*\)\s*:\s*null\}\n\s*<\/div>\s*\)\}/;
const terminalMatch = content.match(terminalRegex);
let terminalContent = '';
if (terminalMatch) {
  terminalContent = `{showTerminal && (<div className="bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden min-h-[300px] border border-outline-variant/20">${terminalMatch[1]}</form>) : null}</div>)}`;
  content = content.replace(terminalRegex, '');
}

content = content.replace(
  /(<button \n\s*onClick=\{\(\) => setShowThreatIntel\(!showThreatIntel\)\}[\s\S]*?<\/button>)/,
  `$1\n              ${threatContent}`
);

content = content.replace(
  /(<button \n\s*onClick=\{\(\) => setShowTerminal\(!showTerminal\)\}[\s\S]*?<\/button>)/,
  `$1\n              ${terminalContent}`
);

content = content.replace(
  /<main className="flex-1 flex flex-col relative z-10 w-full min-w-0">/,
  '<main className="order-1 lg:order-2 flex-1 flex flex-col relative z-10 w-full min-h-[50vh] lg:min-h-0">'
);

content = content.replace(
  /<div className="col-span-12 lg:col-span-4 flex flex-col gap-6 pointer-events-auto h-full overflow-hidden">\s*<\/div>/,
  ''
);

fs.writeFileSync('src/components/SecureCityView.tsx', content);
console.log('Done mapping mobile.');
