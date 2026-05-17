import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

// The theme toggling logic
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
content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(theme === 'dark'\) \{\n\s*document.documentElement.classList.add\('dark'\);\n\s*\} else \{\n\s*document.documentElement.classList.remove\('dark'\);\n\s*\}\n\s*\}, \[theme\]\);\n/g,
  ""
);

content = content.replace(
  /className=\{`transition-all duration-300 active:scale-95 p-2 rounded-full \$\{\n\s*theme === 'dark'\n\s*\? 'text-white hover:bg-white hover:text-\[#08132a\]'\n\s*: 'text-\[#08132a\] hover:bg-background hover:text-white'\n\s*\}\`\}/g,
  `className="transition-all duration-300 active:scale-95 p-2 rounded-full text-on-surface hover:bg-primary/20"`
);


fs.writeFileSync('src/components/SecureCityView.tsx', content);

