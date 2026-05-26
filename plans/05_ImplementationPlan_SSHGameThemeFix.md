# 🎯 خطة الإصلاح 05: إصلاح زر المود في لعبة اختراق الخادم (SSH)

## 📋 ملخص المشكلة

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 5.1 | زر تبديل المود (داكن/فاتح) في لعبة SSH لا يعمل | 🟡 متوسطة | `SSHGameView.tsx` |

---

## 🔧 التحليل التفصيلي

**الملف:** [SSHGameView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SSHGameView.tsx)

**المشكلة الجذرية:**
- الزر موجود (Sun/Moon icon) ويقوم بتبديل class `dark` على `document.documentElement`
- **لكن** المكون بالكامل يستخدم ألوان ثابتة (hardcoded):
  - `bg-[#0a0a0a]`, `bg-[#0d1117]`, `text-[#00ff41]`, `text-[#d1d5db]`
  - لا يستخدم أي CSS variables أو Tailwind dark: variants
- لذلك تغيير الـ `dark` class لا يؤثر على أي عنصر مرئي في المكون

---

## 🔧 الحل المقترح

### الخيار المختار: إزالة زر المود وإبقاء التصميم الداكن الثابت

**المبرر:**
- لعبة SSH هي محاكاة تيرمينال — التصميم الداكن مع النص الأخضر هو التصميم الأمثل والأكثر واقعية
- تحويل اللعبة للوضع الفاتح سيفقدها هويتها البصرية ("hacker terminal")
- إنشاء نسخة فاتحة كاملة يتطلب جهداً كبيراً بدون فائدة حقيقية

**التعديلات المطلوبة:**

```diff
// 1. إزالة state الخاصة بالمود:
- const [isDarkMode, setIsDarkMode] = useState(() => 
-   document.documentElement.classList.contains('dark')
- );

// 2. إزالة دالة toggleTheme:
- const toggleTheme = () => {
-   document.documentElement.classList.toggle('dark');
-   setIsDarkMode(!isDarkMode);
- };

// 3. إزالة زر التبديل من الهيدر:
- <button onClick={toggleTheme} className="...">
-   {isDarkMode ? <Sun ... /> : <Moon ... />}
- </button>

// 4. إزالة imports غير المستخدمة:
- import { Sun, Moon } from 'lucide-react';
+ // إزالة Sun و Moon من الاستيراد

// 5. إزالة showScoreboard state الميتة:
- const [showScoreboard, setShowScoreboard] = useState(false);
```

**إضافة ملاحظة بصرية:**
```tsx
{/* إضافة إشارة أن اللعبة تعمل في الوضع الداكن دائماً */}
<div className="absolute top-2 left-2 text-[10px] text-gray-600 select-none">
  🖥️ Terminal Mode
</div>
```

---

### إصلاحات إضافية في نفس الملف

**أ. إزالة `showScoreboard` state الميتة:**
```diff
- const [showScoreboard, setShowScoreboard] = useState(false);
```

**ب. إصلاح `isTutorial` prop المقبول لكن غير المستخدم:**
```diff
// إما إزالته من الـ interface:
- interface SSHGameViewProps {
-   onBack: () => void;
-   studentName: string;
-   isTutorial?: boolean;
- }

// أو استخدامه فعلياً (مثل إضافة TutorialOverlay):
// هذا يعتمد على ما إذا كان Tutorial مطلوب لهذه اللعبة
```

---

## ✅ خطوات التنفيذ

1. [ ] إزالة state `isDarkMode` و دالة `toggleTheme`
2. [ ] إزالة زر Sun/Moon من الهيدر
3. [ ] إزالة imports `Sun`, `Moon` من lucide-react
4. [ ] إزالة `showScoreboard` state الميتة
5. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- الدخول للعبة SSH والتأكد من عدم وجود زر مود معطل
- التأكد من أن اللعبة تعمل بشكل طبيعي بالتصميم الداكن
- التأكد من عدم وجود أخطاء في الـ console
