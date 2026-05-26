# 🎯 خطة الإصلاح 03: إصلاحات لعبة تشفير الأوامر

## 📋 ملخص المشاكل

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 3.1 | أسئلة نظرية غير متعلقة بالتشفير (المفروض كلها عن التشفير فقط) | 🔴 عالية | `cryptoPuzzles.ts` |
| 3.2 | لا يظهر رصيد عند الدخول للعبة بينما في الإعدادات يوجد رصيد | 🔴 عالية | `CryptoPuzzleView.tsx` |
| 3.3 | الرصيد يجب أن ينقص عند استخدام المساعدة | 🟡 متوسطة | `CryptoPuzzleView.tsx` |
| 3.4 | عند الخطأ يجب إظهار إنذار صوتي مثل المدينة الآمنة | 🟡 متوسطة | `CryptoPuzzleView.tsx` |

---

## 🔧 التغييرات المطلوبة

### 3.1 تصفية الأسئلة لتكون عن التشفير فقط

**الملف:** [cryptoPuzzles.ts](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/data/cryptoPuzzles.ts)

**الوضع الحالي:**
- 100 لغز: ~60 من نوع `crypto` و ~40 من نوع `command`
- نوع `command` يشمل أوامر Linux عامة ليست مرتبطة بالتشفير (مثل `LS`, `CD`, `MKDIR`, `RM`, `ECHO`)

**الحل المقترح:**
تصفية الألغاز بحيث تبقى فقط الألغاز المتعلقة بالتشفير والأمن السيبراني:

**الألغاز المطلوب إزالتها (أوامر عامة غير أمنية):**
- `LS`, `CD`, `MKDIR`, `RM`, `ECHO`, `CAT`, `WGET`, `CURL`, `HTOP`, `WHOAMI`
- هذه أوامر Linux أساسية وليست تشفيرية

**الألغاز المطلوب إبقاؤها (أوامر أمنية/تشفيرية):**
- `SSH`, `SUDO`, `CHMOD`, `PASSWD`, `NMAP`, `TCPDUMP`, `NETCAT`, `WIRESHARK`, `BURP`
- `FIREWALL`, `PROXY`, `SANDBOX`, `ROOT`
- جميع ألغاز نوع `crypto`

**التعديل في `getRandomPuzzles()`:**
```typescript
export function getRandomPuzzles(count = 10): CryptoPuzzle[] {
  // تصفية الأسئلة النظرية غير المتعلقة بالتشفير والأمن
  const securityPuzzles = CRYPTO_PUZZLES.filter(p => 
    p.type === 'crypto' || 
    ['SSH', 'SUDO', 'CHMOD', 'PASSWD', 'NMAP', 'TCPDUMP', 'NETCAT', 
     'WIRESHARK', 'BURP', 'FIREWALL', 'PROXY', 'SANDBOX', 'ROOT',
     'KILL', 'GREP', 'BASH', 'CHOWN'].includes(p.answer)
  );
  
  const shuffled = [...securityPuzzles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

> [!TIP]
> بديل آخر: تغيير واجهة النوع من `'crypto' | 'command'` إلى `'crypto' | 'security-command'` وتعليم كل لغز بشكل صحيح.

---

### 3.2 إضافة نظام رصيد للعبة

**الملف:** [CryptoPuzzleView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/CryptoPuzzleView.tsx)

**الوضع الحالي:**
- لا يوجد أي نظام نقاط أو رصيد
- الإعدادات تعرض "12" كرصيد ثابت وهمي

**الحل المقترح:**
إضافة نظام رصيد بسيط:
- رصيد ابتدائي: **100 نقطة**
- كل إجابة صحيحة: **+10 نقاط**
- كل استخدام للمساعدة (تلميح الإدارة): **-20 نقطة**
- كل خطأ: **-5 نقاط**

```tsx
// إضافة states جديدة:
const [credits, setCredits] = useState(100);
const [hintsUsed, setHintsUsed] = useState(0);
const [correctCount, setCorrectCount] = useState(0);
const [wrongCount, setWrongCount] = useState(0);

// عرض الرصيد في الهيدر:
<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-variant">
  <Coins className="w-4 h-4 text-primary" />
  <span className="text-on-surface font-bold">{credits}</span>
  <span className="text-on-surface-variant text-xs">رصيد</span>
</div>
```

**تعديل منطق الإجابة الصحيحة:**
```tsx
// عند الإجابة الصحيحة:
setCredits(prev => prev + 10);
setCorrectCount(prev => prev + 1);
```

**تعديل منطق الإجابة الخاطئة:**
```tsx
// عند الإجابة الخاطئة:
setCredits(prev => Math.max(0, prev - 5));
setWrongCount(prev => prev + 1);
```

> [!IMPORTANT]
> يجب استيراد أيقونة `Coins` من `lucide-react`.

---

### 3.3 خصم من الرصيد عند استخدام المساعدة

**الملف:** [CryptoPuzzleView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/CryptoPuzzleView.tsx)

**الوضع الحالي (سطر ~311):**
- كلمة السر الإدارية "admin" تكشف الإجابة مجاناً

**الحل المقترح:**
- عند استخدام المساعدة بنجاح (كلمة السر صحيحة)، يُخصم 20 نقطة
- إذا كان الرصيد أقل من 20، يُمنع الاستخدام مع رسالة

```tsx
// تعديل دالة التحقق من كلمة السر:
if (adminPassword === 'admin') {
  if (credits < 20) {
    // رسالة عدم كفاية الرصيد
    alert('رصيدك غير كافٍ لاستخدام المساعدة! (يلزم 20 نقطة على الأقل)');
    return;
  }
  setCredits(prev => prev - 20);
  setHintsUsed(prev => prev + 1);
  setShowHint(true);
  // عرض تنبيه بالخصم
}
```

**إضافة مؤشر تكلفة المساعدة:**
```tsx
<div className="text-xs text-on-surface-variant mt-1">
  💡 تكلفة التلميح: 20 نقطة | رصيدك الحالي: {credits}
</div>
```

---

### 3.4 إضافة صوت إنذار عند الخطأ (مثل المدينة الآمنة)

**الملف:** [CryptoPuzzleView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/CryptoPuzzleView.tsx)

**الحل المقترح:**
نسخ دالة `playErrorSound()` من `SecureCityView.tsx` واستخدامها:

```tsx
// إضافة دالة صوت الإنذار (نسخة من SecureCityView):
const playAlarmSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // صوت إنذار (sawtooth wave مع تغيير التردد)
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio not supported');
  }
};
```

**استدعاء الدالة عند الخطأ:**
```tsx
// في مكان التحقق من الإجابة الخاطئة:
if (currentAnswer !== puzzle.answer) {
  setIsError(true);
  playAlarmSound(); // ← إضافة هذا السطر
  setCredits(prev => Math.max(0, prev - 5));
  setWrongCount(prev => prev + 1);
  setTimeout(() => {
    setIsError(false);
    clearSlots();
  }, 800);
}
```

---

### شاشة النتائج النهائية

عند إكمال جميع الألغاز، إضافة ملخص بالنتائج:

```tsx
{isComplete && (
  <div className="text-center space-y-4">
    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
    <h2 className="text-2xl font-bold text-on-background">أحسنت! 🎉</h2>
    
    {/* ملخص الأداء */}
    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
        <p className="text-green-500 text-2xl font-bold">{correctCount}</p>
        <p className="text-xs text-on-surface-variant">إجابات صحيحة</p>
      </div>
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-red-500 text-2xl font-bold">{wrongCount}</p>
        <p className="text-xs text-on-surface-variant">إجابات خاطئة</p>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
        <p className="text-primary text-2xl font-bold">{credits}</p>
        <p className="text-xs text-on-surface-variant">الرصيد النهائي</p>
      </div>
      <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30">
        <p className="text-secondary text-2xl font-bold">{hintsUsed}</p>
        <p className="text-xs text-on-surface-variant">تلميحات مستخدمة</p>
      </div>
    </div>
  </div>
)}
```

---

## ✅ خطوات التنفيذ

1. [ ] تصفية `cryptoPuzzles.ts` لإزالة الأوامر العامة غير الأمنية
2. [ ] إضافة نظام الرصيد (state + عرض في الهيدر)
3. [ ] ربط الرصيد بالإجابات (+10 صحيح، -5 خطأ، -20 مساعدة)
4. [ ] إضافة دالة صوت الإنذار `playAlarmSound()`
5. [ ] إضافة شاشة ملخص النتائج النهائية
6. [ ] إزالة الـ imports الميتة (`GlobalHeader`, `useEffect`)
7. [ ] إصلاح `bg-white` الثابت في badge نوع اللغز
8. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- التأكد من أن جميع الأسئلة متعلقة بالتشفير والأمن السيبراني
- التأكد من ظهور الرصيد عند الدخول للعبة
- التأكد من نقصان الرصيد عند الخطأ واستخدام المساعدة
- التأكد من صدور صوت إنذار عند الخطأ
