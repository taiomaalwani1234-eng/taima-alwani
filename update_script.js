import fs from 'fs';

let content = fs.readFileSync('src/components/SecureCityView.tsx', 'utf8');

// 1. Add showSettingsProfile state
if (!content.includes('const [showSettingsProfile')) {
  content = content.replace(
    /const \[showNotifications, setShowNotifications\] = useState\(false\);/,
    `const [showNotifications, setShowNotifications] = useState(false);\n  const [showSettingsProfile, setShowSettingsProfile] = useState(false);`
  );
}

// 2. Add announcements to notifications
content = content.replace(
  /<div className="p-2 bg-error\/10 text-error rounded text-xs">\s*تأكد من مراجعة حالة الشبكة باستمرار\.\s*<\/div>/g,
  `<div className="p-2 bg-error/10 text-error rounded text-xs">
                    تأكد من مراجعة حالة الشبكة باستمرار.
                  </div>
                  <div className="p-2 bg-surface-variant rounded text-xs text-on-surface">
                    تحديث جديد: تمت إضافة مستويات جديدة للمحاكاة الأمنية! استعد للتحدي.
                  </div>
                  <div className="p-2 bg-primary/10 text-primary rounded text-xs">
                    إعلان: شارك نتيجتك مع أصدقائك وتنافسوا على لقب أفضل محلل أمني.
                  </div>`
);

// 3. Update Settings + Dashboard buttons
const dashBtn = `<button onClick={onBack} title="لوحة القيادة" className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"><Dashboard className="w-5 h-5"/></button>`;

const settingsBtn = `<div className="relative">
            <button onClick={() => setShowSettingsProfile(!showSettingsProfile)} title="الإعدادات الشخصية" className="text-primary active:scale-95 hover:bg-primary/20 p-2 rounded-full transition-all"><Settings className="w-5 h-5"/></button>
            {showSettingsProfile && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-outline-variant/20 rounded-xl shadow-lg p-4 z-50 text-right">
                <h4 className="font-bold text-sm mb-4 text-primary">الملف الشخصي والتدريب</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-surface-variant p-2 rounded text-sm">
                    <span className="font-bold text-primary">\${budget.toLocaleString()}</span>
                    <span>الرصيد المتاح:</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-variant p-2 rounded text-sm">
                    <span className="font-bold">{studentLevel || 'غير محدد'}</span>
                    <span>نتيجة تحديد المستوى:</span>
                  </div>
                  
                  <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                    <h5 className="font-bold text-xs text-primary mb-2">خطة التدريب المقترحة</h5>
                    <p className="text-[10px] text-on-surface-variant mb-2">بناءً على مستواك، ننصحك بالبدء من المستوى التالي:</p>
                    <button 
                      onClick={() => {
                        let targetLevel = 1;
                        if (studentLevel === 'متقدم') targetLevel = 3;
                        else if (studentLevel === 'متوسط') targetLevel = 2;
                        
                        setLevel(targetLevel);
                        setGameState('playing');
                        setShowSettingsProfile(false);
                      }}
                      className="w-full py-2 bg-primary text-on-primary rounded text-xs font-bold hover:brightness-110 transition-all">
                      الدخول للمستوى المقترح {studentLevel === 'متقدم' ? '(3)' : studentLevel === 'متوسط' ? '(2)' : '(1)'}
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                       if (navigator.share) {
                         navigator.share({
                           title: 'لعبة المدينة الآمنة',
                           text: 'العب معي في لعبة المدينة الآمنة للأمن السيبراني!',
                           url: window.location.href,
                         });
                       } else {
                         navigator.clipboard.writeText(window.location.href);
                         alert('تم نسخ الرابط!');
                       }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded text-xs font-bold hover:bg-secondary/20 transition-all">
                    <Public className="w-4 h-4"/>
                    مشاركة اللعبة مع الأصدقاء
                  </button>
                </div>
              </div>
          )}
        </div>`;

content = content.replace(
  /<button onClick=\{\(\) => setGameState\('menu'\)\} title="الإعدادات" className="text-primary active:scale-95 hover:bg-primary\/20 p-2 rounded-full transition-all"><Settings className="w-5 h-5"\/><\/button>/g,
  `${settingsBtn}\n${dashBtn}`
);

fs.writeFileSync('src/components/SecureCityView.tsx', content);
