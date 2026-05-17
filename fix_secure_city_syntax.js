import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

content = content.replace(
  /export const SecureCityView[\s\S]*?classList\.remove\('dark'\);\n\s*\}\n\s*\}, \[theme\]\);/,
  `export const SecureCityView: React.FC<SecureCityViewProps> = ({ onBack, studentName, studentLevel }) => {`
);

// Also since we use 'theme' somewhere else, wait: the `document.documentElement` useEffect is actually completely broken above because `theme` is undeclared?
content = content.replace(
  /export const SecureCityView: React\.FC<SecureCityViewProps> = \(\{ onBack, studentName, studentLevel \}\) => \{\n\s*\(\(\) => \{\n\s*if \(theme === 'dark'\) \{\n\s*document\.documentElement\.classList\.add\('dark'\);\n\s*\} else \{\n\s*document\.documentElement\.classList\.remove\('dark'\);\n\s*\}\n\s*\}\)/,
   `export const SecureCityView: React.FC<SecureCityViewProps> = ({ onBack, studentName, studentLevel }) => {`
);

// Actually, I can just use a simpler replace
const match = content.match(/export const SecureCityView[\s\S]*?const \[isShaking/);
if (match) {
  content = content.replace(
    match[0], 
    `export const SecureCityView: React.FC<SecureCityViewProps> = ({ onBack, studentName, studentLevel }) => {\n  const [isShaking`
  );
}

fs.writeFileSync('src/components/SecureCityView.tsx', content);
