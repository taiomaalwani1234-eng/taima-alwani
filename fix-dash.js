import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Replace dark/light JS logic classes with Tailwind CSS variables driven design
content = content.replace(
  "const [theme, setTheme] = useState<'light' | 'dark'>('light');",
  `const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);`
);

content = content.replace(
  "const bgClass = theme === 'dark' ? 'bg-background' : 'bg-background';",
  ""
);
content = content.replace(
  "const textClass = theme === 'dark' ? 'text-[\\#d9e2ff]' : 'text-on-background';",
  ""
);
content = content.replace(
  "const cardBgClass = theme === 'dark' ? 'bg-surface border-outline/20' : 'bg-white border-on-background/20';",
  ""
);
content = content.replace(
  "const iconBgClass = theme === 'dark' ? 'bg-surface-variant text-white' : 'bg-on-background text-white';",
  ""
);
content = content.replace(
  "const tagBgClass = theme === 'dark' ? 'bg-surface-variant' : 'bg-gray-100';",
  ""
);

content = content.replace(
  "<div className={`w-full h-full ${bgClass} ${textClass} flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto transition-colors duration-500`}>",
  `<div className="w-full h-full bg-background text-on-background flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto transition-colors duration-500 relative">`
);

content = content.replace(
  "<header className={`mb-12 border-b ${theme === 'dark' ? 'border-outline/20' : 'border-on-background/10'} pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 transition-colors duration-500`}>",
  `<header className="mb-12 border-b border-outline/20 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 transition-colors duration-500 w-full">`
);

content = content.replace(/hover:shadow-\[-12px_12px_0px_#[^\]]+\]/g, 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]');
content = content.replace(/hover:shadow-\[-12px_12px_0px_on-background\]/g, 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]');
content = content.replace(/hover:shadow-\[-12px_12px_0px_bg-primary-container\]/g, 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]');
content = content.replace(/hover:shadow-\[-12px_12px_0px_primary\]/g, 'hover:shadow-[-12px_12px_0px_var(--sys-primary)]');
content = content.replace(/shadow-\[-8px_8px_0px_rgba\(26,26,26,0.1\)\]/g, 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant rounded-2xl');

content = content.replace(/\$\{cardBgClass\}/g, 'bg-surface');
content = content.replace(/\$\{iconBgClass\}/g, 'bg-primary/10 text-primary border border-primary/20 rounded-2xl');
content = content.replace(/\$\{tagBgClass\}/g, 'bg-surface-variant text-on-surface-variant');

// Fix theme conditional tags
content = content.replace(/\$\{theme === 'dark' \? 'bg-primary-container text-on-primary-container' : 'bg-on-background text-white'\}/g, 'bg-surface-variant text-on-surface-variant');

content = content.replace(
  "<h1 className=\"text-4xl sm:text-5xl font-serif italic font-light tracking-tighter\">مركز الأكاديمية</h1>",
  "<h1 className=\"text-4xl sm:text-5xl font-serif italic font-light tracking-tighter text-primary\">مركز الأكاديمية</h1>"
);

content = content.replace(
  "<p className=\"font-bold text-lg\">{studentName}</p>",
  "<p className=\"font-bold text-lg text-secondary\">{studentName}</p>"
);

content = content.replace(/group-hover:bg-\[?[A-Za-z0-9#]+\]?/g, 'group-hover:bg-primary');
content = content.replace(/border-r-2 border-\[?[A-Za-z0-9#]+\]?/g, 'border-r-2 border-primary');

// Specific update for theme toggle button
content = content.replace(
  /className=\{`absolute top-6 left-6 transition-all duration-300 active:scale-95 p-2 rounded-full \$\{\n\s*theme === 'dark' \n\s*\? 'text-white hover:bg-white hover:text-\[\#08132a\]' \n\s*: 'text-on-background hover:bg-on-background hover:text-white'\n\s*\}\`\}/g,
  `className="absolute top-6 left-6 transition-all duration-300 active:scale-95 p-2 rounded-full text-on-background hover:bg-primary/20"`
);


fs.writeFileSync('src/components/DashboardView.tsx', content);

// Let's also do a pass on `App.tsx`
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace('bg-black', 'bg-background text-on-background');
fs.writeFileSync('src/App.tsx', appContent);

