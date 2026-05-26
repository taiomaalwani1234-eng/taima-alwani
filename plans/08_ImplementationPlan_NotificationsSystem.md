# 🎯 خطة الإصلاح 08: نظام الإشعارات اليومية

## 📋 ملخص المطلوب

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 8.1 | الإشعارات حالياً ثابتة (4 إشعارات فقط) وليست ديناميكية | 🟡 متوسطة | `DashboardView.tsx`, `GlobalHeader.tsx` |
| 8.2 | المطلوب: تخزين 50 إشعار وعرض 3 إشعارات يومياً مختلفة | 🟡 متوسطة | ملف جديد + تعديلات |

---

## 🔧 التحليل الحالي

**في [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx):**
- `motivationalQuotes`: 4 نصوص ثابتة
- تُعرض كلها دائماً بدون تغيير

**في [GlobalHeader.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/GlobalHeader.tsx):**
- 4 إشعارات ثابتة hardcoded
- نقطة حمراء متحركة دائماً (لا تختفي)
- لا يوجد نظام read/unread

---

## 🔧 الحل المقترح

### الخطوة 1: إنشاء بنك الإشعارات (50 إشعار)

**ملف جديد:** `src/data/notifications.ts`

```typescript
export interface DailyNotification {
  id: number;
  title: string;
  message: string;
  category: 'motivational' | 'tip' | 'challenge' | 'reminder' | 'news';
  icon: string; // emoji
}

export const NOTIFICATIONS_BANK: DailyNotification[] = [
  // 🔥 تحفيزية (15)
  { id: 1, title: 'تحدي اليوم', message: 'حان وقت حماية النظام، هل أنت مستعد للتحدي اليوم؟', category: 'motivational', icon: '🔥' },
  { id: 2, title: 'لا تستسلم', message: 'المدينة الآمنة بانتظارك، لا تدع المخترقين يفوزون بمحاولاتهم!', category: 'motivational', icon: '🛡️' },
  { id: 3, title: 'التدريب اليومي', message: 'تدريبك اليومي يجعلك أقوى، استكمل دوراتك لتصل للاحتراف.', category: 'motivational', icon: '💪' },
  { id: 4, title: 'خطتك الدراسية', message: 'راجع أهدافك في الخطة الدراسية الذكية وانطلق!', category: 'motivational', icon: '📋' },
  { id: 5, title: 'أنت في الطريق الصحيح', message: 'كل يوم تتعلم فيه شيئاً جديداً هو يوم أقرب لحماية العالم الرقمي.', category: 'motivational', icon: '🌟' },
  { id: 6, title: 'الاستمرارية مفتاح النجاح', message: 'حتى 10 دقائق يومياً تصنع فارقاً كبيراً في مهاراتك الأمنية.', category: 'motivational', icon: '⏰' },
  { id: 7, title: 'قوة المعرفة', message: 'المعرفة هي أقوى سلاح في عالم الأمن السيبراني.', category: 'motivational', icon: '📚' },
  { id: 8, title: 'أنت خط الدفاع الأول', message: 'تذكر أن كل مهارة تتعلمها تحمي شخصاً ما في العالم الحقيقي.', category: 'motivational', icon: '🦸' },
  { id: 9, title: 'التحدي ممتع', message: 'استمتع بالتحديات! كل لغز تحله يقوي عقلك التحليلي.', category: 'motivational', icon: '🧩' },
  { id: 10, title: 'الأبطال لا يتوقفون', message: 'الأبطال السيبرانيون لا يتوقفون عن التعلم، واصل مسيرتك!', category: 'motivational', icon: '🏆' },
  { id: 11, title: 'فرصة جديدة', message: 'كل يوم جديد هو فرصة لاكتشاف ثغرة وإصلاحها!', category: 'motivational', icon: '🔍' },
  { id: 12, title: 'من الصفر للاحتراف', message: 'كل خبير بدأ من الصفر. استمر وستصل حتماً!', category: 'motivational', icon: '🚀' },
  { id: 13, title: 'المنافسة مع نفسك', message: 'لا تقارن نفسك بالآخرين، قارن نفسك بالأمس!', category: 'motivational', icon: '📈' },
  { id: 14, title: 'العمل الجماعي', message: 'الأمن السيبراني جهد جماعي، شارك ما تعلمته مع أصدقائك.', category: 'motivational', icon: '🤝' },
  { id: 15, title: 'الفضول قوة', message: 'الفضول هو أهم صفة في خبير الأمن السيبراني!', category: 'motivational', icon: '🧠' },
  
  // 💡 نصائح أمنية (15)
  { id: 16, title: 'نصيحة: كلمات المرور', message: 'استخدم كلمات مرور فريدة لكل حساب ولا تعيد استخدامها أبداً.', category: 'tip', icon: '🔑' },
  { id: 17, title: 'نصيحة: التحديثات', message: 'حدّث أنظمتك وبرامجك باستمرار لسد الثغرات الأمنية.', category: 'tip', icon: '🔄' },
  { id: 18, title: 'نصيحة: التصيد', message: 'لا تنقر على روابط مشبوهة في الرسائل الإلكترونية حتى لو بدت من مصدر موثوق.', category: 'tip', icon: '🎣' },
  { id: 19, title: 'نصيحة: النسخ الاحتياطي', message: 'أنشئ نسخة احتياطية من بياناتك المهمة بانتظام.', category: 'tip', icon: '💾' },
  { id: 20, title: 'نصيحة: الشبكات العامة', message: 'تجنب إجراء معاملات حساسة على شبكات WiFi العامة.', category: 'tip', icon: '📶' },
  { id: 21, title: 'نصيحة: المصادقة الثنائية', message: 'فعّل المصادقة الثنائية (2FA) على جميع حساباتك المهمة.', category: 'tip', icon: '🔐' },
  { id: 22, title: 'نصيحة: الهندسة الاجتماعية', message: 'لا تشارك معلوماتك الشخصية مع أشخاص لا تعرفهم حتى لو بدوا ودودين.', category: 'tip', icon: '🎭' },
  { id: 23, title: 'نصيحة: التشفير', message: 'تأكد من أن المواقع التي تتصفحها تستخدم HTTPS (القفل الأخضر).', category: 'tip', icon: '🔒' },
  { id: 24, title: 'نصيحة: الصلاحيات', message: 'امنح التطبيقات الحد الأدنى من الصلاحيات التي تحتاجها فقط.', category: 'tip', icon: '⚙️' },
  { id: 25, title: 'نصيحة: الشبكات', message: 'راقب نشاط شبكتك بانتظام واكتشف الأجهزة الغريبة.', category: 'tip', icon: '📡' },
  { id: 26, title: 'نصيحة: USB', message: 'لا تستخدم أجهزة USB مجهولة المصدر — قد تحتوي على برمجيات خبيثة.', category: 'tip', icon: '🔌' },
  { id: 27, title: 'نصيحة: التحقق', message: 'تحقق دائماً من هوية المتصل قبل مشاركة أي معلومات حساسة.', category: 'tip', icon: '📞' },
  { id: 28, title: 'نصيحة: الخصوصية', message: 'راجع إعدادات الخصوصية في حسابات التواصل الاجتماعي بانتظام.', category: 'tip', icon: '👁️' },
  { id: 29, title: 'نصيحة: البرامج الضارة', message: 'استخدم برنامج حماية محدّث وافحص جهازك بانتظام.', category: 'tip', icon: '🛡️' },
  { id: 30, title: 'نصيحة: كلمة السر', message: 'استخدم عبارة سر طويلة بدلاً من كلمة مرور قصيرة معقدة.', category: 'tip', icon: '📝' },
  
  // 🎮 تحديات (10)
  { id: 31, title: 'تحدي: التشفير', message: 'هل يمكنك حل 10 ألغاز تشفير متتالية بدون خطأ؟ جرّب الآن!', category: 'challenge', icon: '🔐' },
  { id: 32, title: 'تحدي: المليونير', message: 'حاول الوصول للسؤال العاشر في المليونير السيبراني اليوم!', category: 'challenge', icon: '💰' },
  { id: 33, title: 'تحدي: المدينة الآمنة', message: 'هل يمكنك صد 5 هجمات متتالية بدون خسارة ميزانية؟', category: 'challenge', icon: '🏙️' },
  { id: 34, title: 'تحدي: SSH', message: 'حاول اختراق الخادم في أقل عدد من المحاولات!', category: 'challenge', icon: '💻' },
  { id: 35, title: 'تحدي: الدورات', message: 'أكمل درساً واحداً من الدورات التعليمية اليوم.', category: 'challenge', icon: '📖' },
  { id: 36, title: 'تحدي: الرؤى', message: 'اقرأ 5 بطاقات معرفية جديدة اليوم وتعلم شيئاً مفيداً.', category: 'challenge', icon: '💡' },
  { id: 37, title: 'تحدي: السرعة', message: 'حاول حل لغز التشفير في أقل من 30 ثانية!', category: 'challenge', icon: '⚡' },
  { id: 38, title: 'تحدي: الاستكشاف', message: 'استكشف قطاعاً جديداً في المدينة الآمنة لم تزره من قبل.', category: 'challenge', icon: '🗺️' },
  { id: 39, title: 'تحدي: الدفاع', message: 'ادافع عن 3 قطاعات متتالية بنجاح في المدينة الآمنة!', category: 'challenge', icon: '🛡️' },
  { id: 40, title: 'تحدي: المعرفة', message: 'أجب على 7 أسئلة صحيحة من أصل 10 في تحديد المستوى!', category: 'challenge', icon: '🎯' },
  
  // 📢 تذكيرات (10)
  { id: 41, title: 'تذكير: الخطة الدراسية', message: 'هل راجعت خطتك الدراسية اليوم؟ تأكد من متابعة أهدافك.', category: 'reminder', icon: '📋' },
  { id: 42, title: 'تذكير: التدريب', message: 'لا تنسَ تدريبك اليومي! حتى 5 دقائق تصنع فارقاً.', category: 'reminder', icon: '⏰' },
  { id: 43, title: 'تذكير: التقييم', message: 'إذا لم تُجرِ تحديد المستوى بعد، ابدأ الآن لمعرفة مستواك!', category: 'reminder', icon: '📊' },
  { id: 44, title: 'تذكير: المشاركة', message: 'شارك إنجازاتك مع أصدقائك عبر أزرار المشاركة في الإعدادات!', category: 'reminder', icon: '📣' },
  { id: 45, title: 'تذكير: التقدم', message: 'تحقق من تقدمك في الإعدادات وشاهد إنجازاتك!', category: 'reminder', icon: '📈' },
  { id: 46, title: 'تذكير: الدورات', message: 'هناك دورات جديدة في انتظارك، لا تفوتها!', category: 'reminder', icon: '🎓' },
  { id: 47, title: 'تذكير: الممارسة', message: 'أفضل طريقة للتعلم هي الممارسة — العب لعبة واحدة اليوم!', category: 'reminder', icon: '🎮' },
  { id: 48, title: 'تذكير: الأمان الشخصي', message: 'طبّق ما تعلمته! غيّر كلمة مرور واحدة ضعيفة اليوم.', category: 'reminder', icon: '🔐' },
  { id: 49, title: 'تذكير: المراجعة', message: 'راجع الرؤى السيبرانية لتثبيت المعلومات في ذاكرتك.', category: 'reminder', icon: '🔄' },
  { id: 50, title: 'تذكير: التحدي الأسبوعي', message: 'جرّب لعبة لم تلعبها من قبل هذا الأسبوع!', category: 'reminder', icon: '🌟' },
];

// دالة اختيار 3 إشعارات يومية بناءً على تاريخ اليوم
export function getDailyNotifications(): DailyNotification[] {
  const today = new Date();
  // استخدام التاريخ كـ seed لضمان نفس الإشعارات طوال اليوم
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // خوارزمية بسيطة لاختيار 3 إشعارات مختلفة
  const shuffled = [...NOTIFICATIONS_BANK].sort((a, b) => {
    const hashA = ((seed * 31 + a.id * 17) % 997);
    const hashB = ((seed * 31 + b.id * 17) % 997);
    return hashA - hashB;
  });
  
  // اختيار 3 من فئات مختلفة (إن أمكن)
  const selected: DailyNotification[] = [];
  const usedCategories = new Set<string>();
  
  for (const notif of shuffled) {
    if (selected.length >= 3) break;
    if (!usedCategories.has(notif.category) || selected.length >= 2) {
      selected.push(notif);
      usedCategories.add(notif.category);
    }
  }
  
  return selected;
}
```

---

### الخطوة 2: تحديث عرض الإشعارات

**الملف:** [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx)

```tsx
import { getDailyNotifications } from '../data/notifications';

// استبدال motivationalQuotes:
const dailyNotifications = getDailyNotifications();

// عرض الإشعارات:
{showNotifications && (
  <div className="...">
    <h3 className="text-sm font-bold text-on-background mb-3 flex items-center gap-2">
      🔔 الإشعارات اليومية
      <span className="text-[10px] text-on-surface-variant font-normal">
        ({new Date().toLocaleDateString('ar-SY')})
      </span>
    </h3>
    <div className="space-y-2">
      {dailyNotifications.map((notif) => (
        <div 
          key={notif.id}
          className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-variant/50 
                     border border-outline/10 hover:border-primary/30 transition-all"
        >
          <span className="text-lg">{notif.icon}</span>
          <div>
            <p className="text-xs font-bold text-on-background">{notif.title}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{notif.message}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-2 text-center">
      <span className="text-[9px] text-on-surface-variant/50">
        يتم تحديث الإشعارات يومياً 📅
      </span>
    </div>
  </div>
)}
```

### الخطوة 3: تحديث GlobalHeader.tsx

**الملف:** [GlobalHeader.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/GlobalHeader.tsx)

```tsx
import { getDailyNotifications } from '../data/notifications';

// استبدال الإشعارات الثابتة:
const dailyNotifications = getDailyNotifications();

// نقطة الإشعارات - إضافة حالة "مقروء":
const [notificationsRead, setNotificationsRead] = useState(() => {
  const lastRead = localStorage.getItem('taima_notifications_read');
  const today = new Date().toDateString();
  return lastRead === today;
});

// عند فتح الإشعارات:
const handleOpenNotifications = () => {
  setShowNotifications(!showNotifications);
  if (!notificationsRead) {
    setNotificationsRead(true);
    localStorage.setItem('taima_notifications_read', new Date().toDateString());
  }
};

// النقطة الحمراء تظهر فقط عندما لم تُقرأ:
{!notificationsRead && (
  <div className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full animate-pulse" />
)}
```

---

## ✅ خطوات التنفيذ

1. [ ] إنشاء ملف `src/data/notifications.ts` مع 50 إشعار
2. [ ] إنشاء دالة `getDailyNotifications()` لاختيار 3 يومياً
3. [ ] تحديث `DashboardView.tsx` لاستخدام البنك الجديد
4. [ ] تحديث `GlobalHeader.tsx` لاستخدام البنك الجديد
5. [ ] إضافة نظام read/unread مع localStorage
6. [ ] إخفاء النقطة الحمراء بعد قراءة الإشعارات
7. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- فتح الموقع والتأكد من ظهور 3 إشعارات مختلفة
- إعادة تحميل الصفحة والتأكد من بقاء نفس الإشعارات (نفس اليوم)
- النقر على الإشعارات والتأكد من اختفاء النقطة الحمراء
- الانتظار ليوم جديد (أو تغيير تاريخ النظام) والتأكد من تغيير الإشعارات
