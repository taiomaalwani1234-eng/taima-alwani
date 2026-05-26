# 🎯 خطة الإصلاح 07: نظام تقدم الألعاب (Game Progression & Locking System)

## 📋 ملخص المطلوب

هذا أكبر تغيير في المشروع — إنشاء نظام قفل/فتح تدريجي للألعاب بناءً على تقدم المستخدم.

| # | اللعبة | الحالة المطلوبة | شرط الفتح |
|---|--------|----------------|-----------|
| 1 | الدورات التعليمية | ✅ مفتوحة دائماً | — |
| 2 | الرؤى السيبرانية | ✅ مفتوحة دائماً | — |
| 3 | تحديد المستوى وخطة AI | ✅ مفتوحة دائماً | — |
| 4 | تشفير الأوامر | 🔒 مقفلة | بعد إكمال تحديد المستوى وخطة AI |
| 5 | المليونير السيبراني | 🔒 مقفلة | بعد تشفير الأوامر + تحديد المستوى |
| 6 | محاكاة المدينة الآمنة (القطاع الأساسي) | 🔒 مقفلة | بعد المليونير + تحديد المستوى + تشفير الأوامر |
| 7 | محاكاة المدينة الآمنة (البنية التحتية) | 🔒 مقفلة | بعد إكمال القطاع الأساسي |
| 8 | محاكاة المدينة الآمنة (الحالة الحرجة) | 🔒 مقفلة | بعد إكمال القطاع الأساسي + البنية التحتية |
| 9 | اختراق الخادم (SSH) | 🔒 مقفلة | بعد تحديد المستوى + تشفير الأوامر + المليونير + المدينة الآمنة |

> [!IMPORTANT]
> **عند المدير (admin)**: كل شيء مفتوح بدون أقفال.

---

## 🔧 التغييرات المطلوبة

### الملفات المتأثرة

| الملف | نوع التعديل |
|-------|------------|
| `DashboardView.tsx` | تعديل كبير — إضافة نظام القفل |
| `App.tsx` | تعديل — تمرير بيانات التقدم |
| `SecureCityView.tsx` | تعديل — قفل مستويات المدينة الداخلية |
| `services/backendApi.ts` | تعديل — دالة جلب التقدم |
| `functions/[[route]].ts` | لا تعديل (API موجود بالفعل) |

---

### الخطوة 1: تعريف هيكل التقدم

**ملف جديد:** `src/data/gameProgression.ts`

```typescript
// أنواع حالات إكمال الألعاب
export interface GameProgress {
  assessment: boolean;    // تحديد المستوى
  crypto: boolean;        // تشفير الأوامر  
  millionaire: boolean;   // المليونير السيبراني
  city_level1: boolean;   // المدينة - القطاع الأساسي
  city_level2: boolean;   // المدينة - البنية التحتية
  city_level3: boolean;   // المدينة - الحالة الحرجة
  ssh: boolean;           // اختراق الخادم
}

// قواعد فتح كل لعبة
export interface GameUnlockRule {
  gameKey: string;
  displayName: string;
  requires: (keyof GameProgress)[];
  alwaysUnlocked?: boolean;
}

export const GAME_UNLOCK_RULES: GameUnlockRule[] = [
  // ✅ مفتوحة دائماً
  { gameKey: 'courses', displayName: 'الدورات التعليمية', requires: [], alwaysUnlocked: true },
  { gameKey: 'flashcards', displayName: 'الرؤى السيبرانية', requires: [], alwaysUnlocked: true },
  { gameKey: 'assessment', displayName: 'تحديد المستوى وخطة AI', requires: [], alwaysUnlocked: true },
  
  // 🔒 مقفلة بشروط
  { gameKey: 'crypto', displayName: 'تشفير الأوامر', requires: ['assessment'] },
  { gameKey: 'millionaire', displayName: 'المليونير السيبراني', requires: ['assessment', 'crypto'] },
  { gameKey: 'city', displayName: 'محاكاة المدينة الآمنة', requires: ['assessment', 'crypto', 'millionaire'] },
  { gameKey: 'ssh', displayName: 'اختراق الخادم', requires: ['assessment', 'crypto', 'millionaire', 'city_level1'] },
];

// قواعد فتح مستويات المدينة الداخلية
export const CITY_LEVEL_RULES = {
  1: { requires: [] },                              // القطاع الأساسي — يفتح مع المدينة
  2: { requires: ['city_level1'] },                  // البنية التحتية
  3: { requires: ['city_level1', 'city_level2'] },   // الحالة الحرجة
};

// دالة التحقق من فتح لعبة
export function isGameUnlocked(
  gameKey: string, 
  progress: GameProgress, 
  isAdmin: boolean
): boolean {
  if (isAdmin) return true; // المدير يرى الكل
  
  const rule = GAME_UNLOCK_RULES.find(r => r.gameKey === gameKey);
  if (!rule) return true;
  if (rule.alwaysUnlocked) return true;
  
  return rule.requires.every(req => progress[req] === true);
}

// دالة تحديد المتطلبات المفقودة
export function getMissingRequirements(
  gameKey: string, 
  progress: GameProgress
): string[] {
  const rule = GAME_UNLOCK_RULES.find(r => r.gameKey === gameKey);
  if (!rule || rule.alwaysUnlocked) return [];
  
  const nameMap: Record<string, string> = {
    assessment: 'تحديد المستوى',
    crypto: 'تشفير الأوامر',
    millionaire: 'المليونير السيبراني',
    city_level1: 'القطاع الأساسي',
    city_level2: 'البنية التحتية',
    city_level3: 'الحالة الحرجة',
    ssh: 'اختراق الخادم',
  };
  
  return rule.requires
    .filter(req => !progress[req])
    .map(req => nameMap[req] || req);
}
```

---

### الخطوة 2: جلب تقدم المستخدم من الـ API

**الملف:** [backendApi.ts](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/services/backendApi.ts)

```typescript
// إضافة دالة جلب التقدم الكامل:
export async function getUserGameProgress(userId: number): Promise<GameProgress> {
  try {
    const res = await fetch(`${API_BASE}/api/progress?user_id=${userId}`);
    const data = await res.json();
    
    const progress: GameProgress = {
      assessment: false,
      crypto: false,
      millionaire: false,
      city_level1: false,
      city_level2: false,
      city_level3: false,
      ssh: false,
    };
    
    if (data.progress) {
      for (const p of data.progress) {
        const gameData = JSON.parse(p.data || '{}');
        
        switch (p.game_type) {
          case 'assessment':
            progress.assessment = !!gameData.level || !!gameData.completedAt;
            break;
          case 'crypto':
            progress.crypto = !!gameData.completed;
            break;
          case 'millionaire':
            progress.millionaire = !!gameData.completed;
            break;
          case 'city_level1':
            progress.city_level1 = !!gameData.completed;
            break;
          case 'city_level2':
            progress.city_level2 = !!gameData.completed;
            break;
          case 'city_level3':
            progress.city_level3 = !!gameData.completed;
            break;
          case 'ssh':
            progress.ssh = !!gameData.completed;
            break;
        }
      }
    }
    
    return progress;
  } catch (err) {
    console.error('Failed to fetch progress:', err);
    return {
      assessment: false, crypto: false, millionaire: false,
      city_level1: false, city_level2: false, city_level3: false, ssh: false,
    };
  }
}
```

---

### الخطوة 3: تحديث App.tsx

**الملف:** [App.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/App.tsx)

```typescript
// إضافة state للتقدم:
const [gameProgress, setGameProgress] = useState<GameProgress>({
  assessment: false, crypto: false, millionaire: false,
  city_level1: false, city_level2: false, city_level3: false, ssh: false,
});

// جلب التقدم عند تسجيل الدخول:
React.useEffect(() => {
  if (userId > 0) {
    getUserGameProgress(userId).then(setGameProgress);
  }
}, [userId]);

// تمرير التقدم والـ role للـ Dashboard:
<DashboardView 
  // ... props الموجودة
  gameProgress={gameProgress}
  onRefreshProgress={() => getUserGameProgress(userId).then(setGameProgress)}
/>
```

---

### الخطوة 4: تحديث DashboardView.tsx — القفل البصري

**الملف:** [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx)

**تعديل كل بطاقة لعبة:**

```tsx
// مكون مساعد لعرض القفل:
const GameCard = ({ gameKey, title, description, icon: Icon, category, ...props }) => {
  const unlocked = isGameUnlocked(gameKey, gameProgress, userRole === 'admin');
  const missingReqs = getMissingRequirements(gameKey, gameProgress);
  
  return (
    <button
      onClick={() => unlocked ? onSelectGame(gameKey) : null}
      disabled={!unlocked}
      className={`relative text-right p-6 rounded-2xl border transition-all duration-300
        ${unlocked 
          ? 'bg-surface border-outline/30 hover:shadow-[-12px_12px_0px_var(--sys-primary)] hover:-translate-y-1 cursor-pointer' 
          : 'bg-surface/50 border-outline/10 cursor-not-allowed'
        }`}
      style={!unlocked ? { filter: 'grayscale(100%)', opacity: 0.6 } : {}}
    >
      {/* أيقونة القفل */}
      {!unlocked && (
        <div className="absolute top-3 left-3 z-10">
          <div className="p-2 rounded-full bg-error/20 backdrop-blur">
            <Lock className="w-5 h-5 text-error" />
          </div>
        </div>
      )}
      
      {/* محتوى البطاقة */}
      <div className={!unlocked ? 'pointer-events-none' : ''}>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Icon className={`w-6 h-6 ${unlocked ? 'text-primary' : 'text-gray-500'}`} />
        </div>
        <h3 className="text-lg font-serif italic font-bold text-on-background mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      
      {/* شروط الفتح (تظهر فقط عند القفل) */}
      {!unlocked && missingReqs.length > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-error/5 border border-error/20">
          <p className="text-[10px] text-error/70">
            🔒 يتطلب إكمال: {missingReqs.join(' • ')}
          </p>
        </div>
      )}
      
      {/* التصنيف */}
      <div className="mt-4">
        <span className="text-[10px] px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant">
          {category}
        </span>
      </div>
    </button>
  );
};
```

---

### الخطوة 5: حفظ إكمال اللعبة

**يجب إضافة استدعاء `saveProgress` عند إكمال كل لعبة بنجاح:**

**في App.tsx - `handleGameEnd`:**
```typescript
const handleGameEnd = async (gameType: string, data: any) => {
  if (userId) {
    try {
      await saveProgress(userId, gameType, data);
      // تحديث التقدم المحلي فوراً
      const updatedProgress = await getUserGameProgress(userId);
      setGameProgress(updatedProgress);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }
};
```

**في كل لعبة يجب إضافة callback عند الإكمال:**

| اللعبة | متى يُحفظ الإكمال |
|--------|-------------------|
| Assessment | عند عرض النتائج والمستوى المقيّم |
| CryptoPuzzle | عند إكمال جميع الألغاز بنجاح |
| Millionaire | عند الفوز (الوصول لآخر سؤال) أو الانسحاب بمبلغ > 0 |
| SecureCity L1 | عند ظهور شاشة "تم تأمين القطاع" للمستوى 1 |
| SecureCity L2 | عند ظهور شاشة "تم تأمين القطاع" للمستوى 2 |
| SecureCity L3 | عند ظهور شاشة "الانتصار الشامل" |
| SSH | عند ظهور شاشة النصر (victory) |

**مثال — CryptoPuzzleView:**
```tsx
// إضافة prop:
interface CryptoPuzzleViewProps {
  onBack: () => void;
  isTutorial?: boolean;
  onGameComplete?: () => void; // ← جديد
}

// عند إكمال جميع الألغاز:
if (currentIndex >= puzzles.length - 1) {
  setIsComplete(true);
  onGameComplete?.(); // ← استدعاء
}
```

---

### الخطوة 6: قفل مستويات المدينة الداخلية

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

```tsx
// في شاشة اختيار المستوى (menu)، تعديل بطاقات المستويات:
const isLevel2Unlocked = gameProgress?.city_level1 || userRole === 'admin';
const isLevel3Unlocked = gameProgress?.city_level2 || userRole === 'admin';

// بطاقة المستوى 2:
<button 
  onClick={() => isLevel2Unlocked ? loadLevel(2) : null}
  disabled={!isLevel2Unlocked}
  className={`... ${!isLevel2Unlocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
>
  {!isLevel2Unlocked && <Lock className="w-5 h-5 text-error absolute top-3 left-3" />}
  ...
</button>

// بطاقة المستوى 3:
<button 
  onClick={() => isLevel3Unlocked ? loadLevel(3) : null}
  disabled={!isLevel3Unlocked}
  className={`... ${!isLevel3Unlocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
>
  {!isLevel3Unlocked && <Lock className="w-5 h-5 text-error absolute top-3 left-3" />}
  ...
</button>
```

---

## ⚠️ نقاط مهمة

> [!WARNING]
> **تحديد ماذا يعني "إكمال" كل لعبة:**
> - **Assessment**: حصل على مستوى (أي مستوى) ✅
> - **CryptoPuzzle**: حل جميع الألغاز العشرة ✅
> - **Millionaire**: لم يُحدد بوضوح — هل يكفي الانسحاب التكتيكي؟ أم يجب الفوز الكامل؟
>   - **المقترح**: إكمال 5 أسئلة على الأقل أو الانسحاب بمبلغ > $1,000
> - **SecureCity**: إكمال العدد المطلوب من الهجمات لكل مستوى
> - **SSH**: إيجاد الـ flag (secret.txt)

> [!IMPORTANT]
> **المدير (admin)** يرى كل الألعاب مفتوحة بدون أقفال — هذا شرط صريح في المتطلبات.

---

## ✅ خطوات التنفيذ

1. [ ] إنشاء ملف `src/data/gameProgression.ts` مع قواعد الفتح
2. [ ] إضافة `getUserGameProgress()` في `backendApi.ts`
3. [ ] إضافة `gameProgress` state في `App.tsx`
4. [ ] تعديل `DashboardView.tsx` لعرض الأقفال
5. [ ] تعديل كل لعبة لحفظ حالة الإكمال:
   - [ ] AssessmentView.tsx
   - [ ] CryptoPuzzleView.tsx
   - [ ] MillionaireView.tsx
   - [ ] SecureCityView.tsx
   - [ ] SSHGameView.tsx
6. [ ] تعديل SecureCityView.tsx لقفل المستويات الداخلية
7. [ ] اختبار أن المدير يرى كل شيء مفتوح
8. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- تسجيل مستخدم جديد → التأكد من أن فقط الدورات والرؤى والتقييم مفتوحة
- إكمال التقييم → التأكد من فتح تشفير الأوامر
- إكمال تشفير الأوامر → التأكد من فتح المليونير
- إكمال المليونير → التأكد من فتح المدينة الآمنة
- إكمال المدينة → التأكد من فتح SSH
- تسجيل دخول كمدير → التأكد من أن الكل مفتوح
- التأكد من أن البطاقات المقفلة رمادية مع أيقونة قفل
