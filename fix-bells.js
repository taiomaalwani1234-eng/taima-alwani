import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

if(!content.includes('const [showNotifications, setShowNotifications]')) {
  content = content.replace(
    /const \[terminalHistory, setTerminalHistory\] = useState<TerminalLog\[\]>\(\[\]\);/,
    `const [terminalHistory, setTerminalHistory] = useState<TerminalLog[]>([]);\n  const [showNotifications, setShowNotifications] = useState(false);`
  );
}

content = content.replace(
  /<button className="text-primary active:scale-95 hover:bg-primary\/20 p-2 rounded-full transition-all"><Notifications className="w-5 h-5"\/><\/button>/g,
  `<div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all relative"
            >
              <Notifications className="w-5 h-5"/>
              <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full animate-bounce"></span>
            </button>
            {showNotifications && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50">
                <h4 className="font-bold text-sm mb-2 text-primary">الإشعارات</h4>
                <div className="space-y-2 text-right">
                  <div className="p-2 bg-surface-variant rounded text-xs text-on-surface">
                    مرحباً بك في المحاكاة الأمنية!
                  </div>
                  <div className="p-2 bg-error/10 text-error rounded text-xs">
                    تأكد من مراجعة حالة الشبكة باستمرار.
                  </div>
                </div>
              </div>
            )}
           </div>`
);

content = content.replace(
  /<button className="text-primary active:scale-95"><Settings className="w-5 h-5"\/><\/button>/g,
  `<button onClick={() => setGameState('menu')} title="الإعدادات" className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"><Settings className="w-5 h-5"/></button>`
);

fs.writeFileSync('src/components/SecureCityView.tsx', content);
console.log('Bells fixed');
