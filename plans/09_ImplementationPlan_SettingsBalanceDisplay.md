# 🎯 خطة الإصلاح 09: عرض الأرصدة الديناميكية في الإعدادات

## 📋 ملخص المشكلة

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 9.1 | رصيد الألعاب والإنجازات في الإعدادات ثابت وغير واضح | 🟡 متوسطة | `DashboardView.tsx` |

---

## 🔧 التحليل الحالي

**في [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx):**

قسم "رصيد الألعاب والإنجازات" يعرض 3 قيم ثابتة:
```
محاكاة المدينة → $5,000 (ثابت)
المليونير السيبراني → 1,250 pt (ثابت)
ألغاز التشفير → 12 (ثابت)
```

**هذه القيم وهمية** ولا تعكس أي تقدم حقيقي للمستخدم.

---

## 🔧 الحل المقترح

### الخطوة 1: جلب بيانات التقدم الفعلية

**الملف:** [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx)

```tsx
// إضافة state لأرصدة الألعاب:
interface GameBalances {
  cityBudget: number;
  millionaireMoney: number;
  cryptoCredits: number;
  sshScore: number;
  assessmentLevel: string;
}

const [balances, setBalances] = useState<GameBalances>({
  cityBudget: 0,
  millionaireMoney: 0,
  cryptoCredits: 0,
  sshScore: 0,
  assessmentLevel: 'لم يُحدد',
});

// جلب البيانات عند فتح الإعدادات:
useEffect(() => {
  if (showSettingsProfile && userId) {
    fetchGameBalances(userId).then(setBalances);
  }
}, [showSettingsProfile, userId]);
```

**في [backendApi.ts](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/services/backendApi.ts):**
```typescript
export async function fetchGameBalances(userId: number): Promise<GameBalances> {
  try {
    const res = await fetch(`${API_BASE}/api/progress?user_id=${userId}`);
    const data = await res.json();
    
    const balances: GameBalances = {
      cityBudget: 0,
      millionaireMoney: 0,
      cryptoCredits: 0,
      sshScore: 0,
      assessmentLevel: 'لم يُحدد',
    };
    
    if (data.progress) {
      for (const p of data.progress) {
        const gameData = JSON.parse(p.data || '{}');
        
        switch (p.game_type) {
          case 'city':
          case 'city_level1':
          case 'city_level2':
          case 'city_level3':
            balances.cityBudget = Math.max(balances.cityBudget, gameData.budget || 0);
            break;
          case 'millionaire':
            balances.millionaireMoney = Math.max(balances.millionaireMoney, gameData.money || 0);
            break;
          case 'crypto':
            balances.cryptoCredits = gameData.credits || gameData.score || 0;
            break;
          case 'ssh':
            balances.sshScore = gameData.score || 0;
            break;
          case 'assessment':
            balances.assessmentLevel = gameData.level || 'لم يُحدد';
            break;
        }
      }
    }
    
    return balances;
  } catch (err) {
    console.error('Failed to fetch balances:', err);
    return {
      cityBudget: 0, millionaireMoney: 0, cryptoCredits: 0,
      sshScore: 0, assessmentLevel: 'لم يُحدد',
    };
  }
}
```

---

### الخطوة 2: تحسين العرض البصري للأرصدة

```tsx
{/* قسم رصيد الألعاب والإنجازات - محسّن */}
<div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-outline/10">
  <h4 className="text-xs font-bold text-on-background mb-3 flex items-center gap-2">
    🏆 رصيد الألعاب والإنجازات
  </h4>
  
  <div className="space-y-2.5">
    {/* محاكاة المدينة */}
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-variant/30">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-on-surface">محاكاة المدينة</span>
      </div>
      <span className="text-sm font-bold font-mono text-primary">
        ${balances.cityBudget.toLocaleString()}
      </span>
    </div>
    
    {/* المليونير السيبراني */}
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-variant/30">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-secondary" />
        </div>
        <span className="text-xs text-on-surface">المليونير السيبراني</span>
      </div>
      <span className="text-sm font-bold font-mono text-secondary">
        ${balances.millionaireMoney.toLocaleString()}
      </span>
    </div>
    
    {/* ألغاز التشفير */}
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-variant/30">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Key className="w-4 h-4 text-emerald-500" />
        </div>
        <span className="text-xs text-on-surface">ألغاز التشفير</span>
      </div>
      <span className="text-sm font-bold font-mono text-emerald-500">
        {balances.cryptoCredits} نقطة
      </span>
    </div>
    
    {/* اختراق الخادم */}
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-variant/30">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-green-500" />
        </div>
        <span className="text-xs text-on-surface">اختراق الخادم</span>
      </div>
      <span className="text-sm font-bold font-mono text-green-500">
        {balances.sshScore} pt
      </span>
    </div>
    
    {/* المستوى */}
    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-on-surface font-medium">مستواك الحالي</span>
      </div>
      <span className="text-sm font-bold text-primary">
        {balances.assessmentLevel}
      </span>
    </div>
  </div>
  
  {/* رسالة إذا لم يلعب أي لعبة */}
  {balances.cityBudget === 0 && balances.millionaireMoney === 0 && balances.cryptoCredits === 0 && (
    <p className="text-[10px] text-on-surface-variant/60 text-center mt-3">
      ابدأ بلعب الألعاب لتحصل على رصيد! 🎮
    </p>
  )}
</div>
```

---

### الخطوة 3: حفظ الأرصدة من كل لعبة

يجب التأكد من أن كل لعبة تحفظ البيانات المطلوبة عند الانتهاء:

| اللعبة | البيانات المحفوظة |
|--------|------------------|
| SecureCity | `{ budget, level, completed, attacksResolved }` |
| Millionaire | `{ money, questionsAnswered, completed }` |
| CryptoPuzzle | `{ credits, correctCount, wrongCount, hintsUsed, completed }` |
| SSH | `{ score, completed, flagFound }` |
| Assessment | `{ level, score, completedAt }` |

**مثال — حفظ من MillionaireView عند الانسحاب/الفوز:**
```tsx
// في gameOver callback:
const handleGameOver = (reason: 'win' | 'walk' | 'lose') => {
  setGameOverReason(reason);
  // حفظ البيانات
  onGameEnd?.('millionaire', {
    money,
    questionsAnswered: currentQuestion + 1,
    reason,
    completed: reason === 'win' || (reason === 'walk' && money > 0),
  });
};
```

---

## ✅ خطوات التنفيذ

1. [ ] إضافة `fetchGameBalances()` في `backendApi.ts`
2. [ ] تعديل قسم الأرصدة في `DashboardView.tsx` لعرض بيانات ديناميكية
3. [ ] التأكد من أن كل لعبة تحفظ البيانات المطلوبة عند الانتهاء
4. [ ] إضافة SSH و Assessment للقائمة البصرية
5. [ ] تحسين التنسيق البصري والتباين اللوني
6. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- فتح الإعدادات لمستخدم جديد → التأكد من ظهور أصفار أو رسالة "ابدأ بلعب الألعاب"
- لعب لعبة والعودة → التأكد من تحديث الرصيد
- التأكد من وضوح الأرصدة في كلا الوضعين (داكن/فاتح)
- التأكد من تنسيق الأرقام بشكل صحيح
