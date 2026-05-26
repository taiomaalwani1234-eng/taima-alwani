# 🎯 خطة الإصلاح 02: إصلاحات اختبار تحديد المستوى والخطة الدراسية

## 📋 ملخص المشاكل

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 2.1 | في المود الداكن "السؤال التالي" غير واضح | 🔴 عالية | `AssessmentView.tsx` |
| 2.2 | "المرشد الذكي" و "الأسئلة المجابة" ألوانهم غير واضحة | 🔴 عالية | `AssessmentView.tsx` |
| 2.3 | المستوى المتوقع يجب عرضه كمخطط هيستوغرام | 🟡 متوسطة | `AssessmentView.tsx` |
| 2.4 | الخطة الدراسية يجب أن تتناسب مع المستوى ومبنية على محتوى الألعاب | 🟡 متوسطة | `AssessmentView.tsx` |
| 2.5 | زر "العودة" و "الانتقال للألعاب" يعملان نفس الشيء | 🟡 متوسطة | `AssessmentView.tsx` |

---

## 🔧 التغييرات المطلوبة

### 2.1 إصلاح وضوح "السؤال التالي" في المود الداكن

**الملف:** [AssessmentView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/AssessmentView.tsx)

**المشكلة الجذرية:**
- الاختبار يستخدم `bg-on-background text-background` (نفس مشكلة المليونير - ألوان معكوسة)
- زر "السؤال التالي" يستخدم `bg-primary text-white` وهو واضح، لكن حالة `disabled:opacity-30` تجعله شبه مخفي
- النصوص المحيطة تستخدم `text-background/80` التي تتأثر بالوضع

**الحل المقترح:**
```diff
- زر السؤال التالي:
- className="... disabled:opacity-30 ..."
+ className="... disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-300 ..."

- نصوص التلميح والمعلومات:
- text-background/80
+ text-gray-300
```

---

### 2.2 إصلاح ألوان "المرشد الذكي" و "الأسئلة المجابة"

**الملف:** [AssessmentView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/AssessmentView.tsx)

**المشاكل المحددة:**

**أ. "المرشد الذكي" (سطر ~258):**
- يستخدم `text-white` بشكل ثابت
- على خلفية `bg-surface-container-low/80` يكون مخفياً في الوضع الفاتح

```diff
- <span className="text-white text-xl font-bold">المرشد الذكي</span>
+ <span className="text-on-background text-xl font-bold">المرشد الذكي</span>
```

**ب. "الأسئلة المجابة" (سطر ~310-317):**
- التسمية تستخدم `text-on-surface-variant text-[10px]` — صغيرة جداً وقد تكون باهتة
- القيمة تستخدم `text-secondary` — قد لا يكون واضحاً

```diff
- <span className="text-on-surface-variant text-[10px]">الأسئلة المجابة</span>
+ <span className="text-on-surface text-xs font-medium">الأسئلة المجابة</span>

- <span className="text-secondary text-2xl font-bold">
+ <span className="text-primary text-2xl font-bold">
```

**ج. ألوان شجرة المخطط الذهني (TreeBranch):**
```diff
- سطر ~43: text-[#29396f] (غير مقروء في الداكن)
+ text-on-background

- سطر ~44: text-[#738cc7]
+ text-on-surface-variant
```

**د. عنوان "مسار التعلم" (سطر ~327):**
```diff
- text-[#473f92]
+ text-primary
```

---

### 2.3 إضافة مخطط هيستوغرام للمستوى المتوقع

**الملف:** [AssessmentView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/AssessmentView.tsx)

**الوضع الحالي:**
- يوجد شريطا تقدم فقط (النتيجة الإجمالية + نسبة الخطأ)
- المستوى يُعرض كنص فقط

**الحل المقترح:**
إضافة مكون هيستوغرام بسيط (بدون مكتبة خارجية) يعرض:
- 5 مستويات (مبتدئ، متدرب، متوسط، متقدم، خبير)
- كل مستوى بعمود بلون مختلف
- المستوى المتوقع للطالب يُبرز بلون مميز ومتوهج
- النسبة المئوية فوق كل عمود

```tsx
// مكون الهيستوغرام الجديد - يُضاف قبل return
const LevelHistogram = ({ score, totalQuestions }: { score: number; totalQuestions: number }) => {
  const percentage = (score / totalQuestions) * 100;
  
  const levels = [
    { name: 'مبتدئ', min: 0, max: 20, color: '#ef4444', icon: '🔰' },
    { name: 'متدرب', min: 20, max: 40, color: '#f97316', icon: '📚' },
    { name: 'متوسط', min: 40, max: 60, color: '#eab308', icon: '⚡' },
    { name: 'متقدم', min: 60, max: 80, color: '#22c55e', icon: '🛡️' },
    { name: 'خبير', min: 80, max: 100, color: '#6366f1', icon: '🏆' },
  ];
  
  const currentLevel = levels.find(l => percentage >= l.min && percentage < l.max) 
    || levels[levels.length - 1];
  
  return (
    <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline/20">
      <h3 className="text-on-background font-bold text-lg mb-4 text-center">
        📊 توزيع المستوى المتوقع
      </h3>
      <div className="flex items-end justify-around gap-2" style={{ height: '180px' }}>
        {levels.map((level) => {
          const isActive = level.name === currentLevel.name;
          // حساب ارتفاع العمود بناءً على قرب النتيجة من هذا المستوى
          const midpoint = (level.min + level.max) / 2;
          const distance = Math.abs(percentage - midpoint);
          const barHeight = Math.max(15, 100 - distance);
          
          return (
            <div key={level.name} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold" style={{ color: level.color }}>
                {isActive ? `${percentage.toFixed(0)}%` : ''}
              </span>
              <div 
                className={`w-full rounded-t-lg transition-all duration-700 ${isActive ? 'animate-pulse' : ''}`}
                style={{ 
                  height: `${barHeight}%`,
                  backgroundColor: level.color,
                  opacity: isActive ? 1 : 0.3,
                  boxShadow: isActive ? `0 0 20px ${level.color}60` : 'none',
                }}
              />
              <span className="text-[10px] text-center font-medium text-on-surface-variant">
                {level.icon}
              </span>
              <span className={`text-[10px] text-center font-medium ${isActive ? 'text-on-background font-bold' : 'text-on-surface-variant'}`}>
                {level.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**مكان الإضافة:** بعد عرض شريطي التقدم الحاليين (بعد سطر ~296) وقبل بطاقات الإحصائيات.

---

### 2.4 تحسين الخطة الدراسية لتكون مبنية على محتوى الألعاب

**الملف:** [AssessmentView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/AssessmentView.tsx)

**الوضع الحالي:**
- الـ prompt يطلب من الذكاء الاصطناعي بناء خطة عامة

**الحل المقترح:**
تعديل الـ prompt ليشمل محتوى الألعاب المتاحة ويبني خطة مرتبطة بها:

```tsx
const planPrompt = `
أنت مستشار تعليمي في الأمن السيبراني. 
الطالب "${studentName}" حصل على ${score}/10 في اختبار تحديد المستوى.
المستوى المقيّم: ${evaluation.level}

## الألعاب والموارد التعليمية المتاحة في المنصة:
1. **الدورات التعليمية**: دورات نظرية في أساسيات الأمن السيبراني
2. **الرؤى السيبرانية**: بطاقات معرفية سريعة عن مفاهيم الأمان
3. **تشفير الأوامر**: ألغاز تشفير وأوامر Linux عملية
4. **المليونير السيبراني**: مسابقة معرفية شاملة بأسلوب من سيربح المليون
5. **محاكاة المدينة الآمنة**: محاكاة هجمات ودفاع على بنية تحتية (3 مستويات)
6. **اختراق الخادم (SSH)**: محاكاة اختراق خادم عبر SSH

## المطلوب:
بناءً على مستوى الطالب "${evaluation.level}"، أنشئ خطة دراسية مرحلية:

- **إذا كان مبتدئ/متدرب**: يبدأ بالدورات التعليمية والرؤى السيبرانية أولاً، ثم ينتقل لتشفير الأوامر
- **إذا كان متوسط**: يراجع الرؤى ثم ينتقل مباشرة لتشفير الأوامر والمليونير
- **إذا كان متقدم/خبير**: يبدأ بالمليونير والمدينة الآمنة واختراق الخادم

كل مرحلة يجب أن تحتوي على:
- اسم اللعبة/الموارد المطلوبة
- الهدف من المرحلة
- معيار الانتقال للمرحلة التالية

أجب بصيغة JSON:
{
  "planMarkdown": "الخطة بصيغة Markdown مع عناوين واضحة ورموز تعبيرية",
  "mindMap": {
    "label": "مستواك المتوقع: ${evaluation.level}",
    "children": [
      { "label": "نقاط القوة", "children": [...] },
      { "label": "مجالات التطوير", "children": [...] },
      { "label": "المرحلة 1: [اسم]", "children": [{ "label": "اللعبة: ..." }, { "label": "الهدف: ..." }] },
      { "label": "المرحلة 2: [اسم]", "children": [...] },
      { "label": "المرحلة 3: [اسم]", "children": [...] }
    ]
  }
}
`;
```

---

### 2.5 تمييز زر "العودة" عن "الانتقال للألعاب"

**الملف:** [AssessmentView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/AssessmentView.tsx)

**الوضع الحالي (سطر ~381-392):**
- زر "الانتقال إلى الألعاب بالمركز التدريبي" → يستدعي `onUpdateLevel` (يحدث المستوى ويرجع)
- زر "العودة للوراء" → يستدعي `onBack()` (يرجع بدون تحديث)
- **كلاهما يرجع للوحة التحكم**

**الحل المقترح:**
- تغيير وظيفة أحد الزرين لإعادة الاختبار:

```tsx
{/* زر 1: الانتقال للألعاب (يحدّث المستوى ويعود) */}
<button 
  onClick={() => onUpdateLevel?.(evaluation.level)}
  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold 
             hover:bg-primary/80 transition-all"
>
  <Gamepad2 className="w-5 h-5" />
  الانتقال إلى الألعاب بالمركز التدريبي
</button>

{/* زر 2: إعادة الاختبار */}
<button 
  onClick={() => {
    // إعادة تعيين حالة الاختبار
    setCurrentQuestion(0);
    setScore(0);
    setIsFinished(false);
    setAnswers([]);
    setAiPlan(null);
    setMindMap(null);
    setSelectedAnswer(null);
    setShowResult(false);
  }}
  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-outline 
             text-on-surface hover:bg-surface-variant transition-all"
>
  <RefreshCcw className="w-5 h-5" />
  إعادة الاختبار
</button>
```

> [!IMPORTANT]
> يجب استيراد أيقونة `Gamepad2` و `RefreshCcw` من `lucide-react`.

---

## ✅ خطوات التنفيذ

1. [ ] إصلاح ألوان الأزرار والنصوص في المود الداكن
2. [ ] إصلاح لون "المرشد الذكي" و "الأسئلة المجابة"
3. [ ] إصلاح ألوان TreeBranch وعنوان "مسار التعلم"
4. [ ] إضافة مكون الهيستوغرام `LevelHistogram`
5. [ ] تعديل prompt الخطة الدراسية ليشمل محتوى الألعاب
6. [ ] تغيير زر "العودة" إلى "إعادة الاختبار"
7. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- تشغيل الاختبار في المود الداكن والتأكد من وضوح جميع العناصر
- إكمال الاختبار والتأكد من ظهور الهيستوغرام بشكل صحيح
- التأكد من أن الخطة الدراسية تذكر ألعاب المنصة المحددة
- التأكد من أن الزرين يعملان بشكل مختلف (أحدهما للألعاب والآخر لإعادة الاختبار)
