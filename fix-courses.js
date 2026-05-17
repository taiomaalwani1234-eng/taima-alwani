import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/CoursesView.tsx', 'utf8');

content = content.replace(
  "const [theme, setTheme] = useState<'dark' | 'light'>('dark');",
  `const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);`
);

content = content.replace("const isDark = theme === 'dark';", "");
content = content.replace("const bgClass = isDark ? 'bg-on-background text-background' : 'bg-background text-on-background';", "const bgClass = 'bg-background text-on-background';");
content = content.replace("const borderClass = isDark ? 'border-background/20' : 'border-on-background/20';", "const borderClass = 'border-outline/20';");
content = content.replace("const cardBgClass = isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white hover:bg-surface-container';", "const cardBgClass = 'bg-surface hover:bg-surface-container';");
content = content.replace("const sidebarClass = isDark ? 'bg-surface' : 'bg-surface-container';", "const sidebarClass = 'bg-surface-container';");
content = content.replace("const contentBgClass = isDark ? 'bg-surface-container-lowest' : 'bg-white';", "const contentBgClass = 'bg-background';");
content = content.replace("const activeLectureClass = isDark ? 'bg-primary text-white border-transparent' : 'bg-primary text-white border-transparent';", "const activeLectureClass = 'bg-primary text-on-primary border-transparent';");
content = content.replace("const inactiveLectureClass = isDark ? 'border-background/20 hover:border-primary hover:text-primary' : 'border-on-background/20 hover:border-primary hover:text-primary';", "const inactiveLectureClass = 'border-outline/20 hover:border-primary hover:text-primary';");

content = content.replace(/hover:shadow-\[12px_12px_0px_#[^\]]+\]/g, 'hover:shadow-[12px_12px_0px_var(--sys-primary)]');
content = content.replace(/shadow-\[8px_8px_0px_rgba\(26,26,26,0.1\)\]/g, 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant');

content = content.replace(
  "className={`text-right p-6 sm:p-8 border ${borderClass} ${cardBgClass} transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant hover:-translate-y-2 hover:shadow-[12px_12px_0px_var(--sys-primary)] flex flex-col group`}",
  "className={`text-right p-6 sm:p-8 bg-surface border border-outline-variant rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-2 flex flex-col group`}"
);

content = content.replace(/hover:text-white/g, 'hover:text-on-primary');
content = content.replace(/text-white/g, 'text-on-primary');

// Specific update for theme toggle button
content = content.replace(
  /className=\{`p-2 sm:p-3 rounded-none border \$\{borderClass\} hover:bg-primary hover:text-on-primary hover:border-primary transition-colors`\}/g,
  `className="p-2 sm:p-3 rounded-full border border-outline/20 hover:bg-primary/20 transition-colors"`
);
content = content.replace(/isDark \? 'light' : 'dark'/g, "theme === 'dark' ? 'light' : 'dark'");
content = content.replace(/isDark \? <Sun/g, "theme === 'dark' ? <Sun");
content = content.replace(/isDark/g, "(theme === 'dark')");

fs.writeFileSync('src/components/CoursesView.tsx', content);

