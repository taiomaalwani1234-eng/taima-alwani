# 🎯 خطة الإصلاح 04: إصلاحات لعبة محاكاة المدينة الآمنة

## 📋 ملخص المشاكل

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 4.1 | تغيير صوت الخطأ في المدافع إلى صوت إنذار حقيقي | 🟡 متوسطة | `SecureCityView.tsx` |
| 4.2 | إضافة زر تلميح في واجهة المدافع | 🟡 متوسطة | `SecureCityView.tsx` |
| 4.3 | بعد الهجوم على مكان لا يمكن الدخول إليه مرة أخرى كمدافع + تلوين النقطة بالأحمر | 🔴 عالية | `SecureCityView.tsx` |
| 4.4 | التيرمينال في الواجهة الرئيسية لا يعمل | 🔴 عالية | `SecureCityView.tsx` |
| 4.5 | الدوائر الحمراء لا يمكن الدخول إليها في المستوى 2 و 3 | 🔴 عالية | `SecureCityView.tsx` |
| 4.6 | الرصيد لا يظهر في المستوى 3 بالصفحة الرئيسية | 🟡 متوسطة | `SecureCityView.tsx` |
| 4.7 | لا يوجد زر عودة بعد إنهاء كل مستوى | 🟡 متوسطة | `SecureCityView.tsx` |

---

## 🔧 التغييرات المطلوبة

### 4.1 تغيير صوت الخطأ إلى صوت إنذار حقيقي

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**الوضع الحالي (سطر ~101-123):**
- `playErrorSound()` تستخدم `sawtooth` wave مع تردد من 150Hz→40Hz
- يبدو كصوت خطأ بسيط وليس إنذار

**الحل المقترح:**
استبدال الصوت بإنذار حقيقي (siren-like) يتكرر:

```typescript
const playAlarmSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // صوت إنذار (صفارة إنذار)
    oscillator.type = 'square';
    
    // تذبذب التردد بين عالي ومنخفض (تأثير صفارة الإنذار)
    const now = audioCtx.currentTime;
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.linearRampToValueAtTime(400, now + 0.25);
    oscillator.frequency.linearRampToValueAtTime(800, now + 0.5);
    oscillator.frequency.linearRampToValueAtTime(400, now + 0.75);
    oscillator.frequency.linearRampToValueAtTime(800, now + 1.0);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  } catch (e) {
    console.warn('Audio not supported');
  }
};
```

**الأماكن التي يجب استدعاء الصوت فيها:**
- عند خطأ في لغز المهاجم (crypto puzzle)
- عند خطأ في لغز المدافع (defender puzzle)
- عند خطأ في أمر التيرمينال (defender terminal command)

---

### 4.2 إضافة زر تلميح في واجهة المدافع

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**الوضع الحالي:**
- في وضع الدفاع بالتيرمينال: يمكن كتابة `hint` أو `help` للحصول على التلميح
- لكن **لا يوجد زر مرئي** للتلميح — المستخدم قد لا يعرف بوجود هذه الأوامر
- في ألغاز الأهداف (defender puzzles): لا يوجد أي نظام تلميح

**الحل المقترح:**

**أ. إضافة زر تلميح مرئي في تيرمينال المدافع:**
```tsx
{/* زر تلميح بجانب حقل الإدخال في تيرمينال الدفاع */}
<div className="flex items-center gap-2">
  <input 
    // ... حقل الإدخال الحالي
  />
  <button
    onClick={() => {
      // نفس منطق كتابة hint في التيرمينال
      const expected = COMMAND_MAPPING[currentAttack.title];
      setTerminalHistory(prev => [...prev, {
        type: 'system',
        content: `[SYSTEM] TIP: الأمر الموصى به هو: ${expected}`
      }]);
    }}
    className="px-3 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 
               transition-all text-sm font-bold whitespace-nowrap border border-secondary/30"
    title="عرض تلميح"
  >
    💡 تلميح
  </button>
</div>
```

**ب. إضافة تلميح في ألغاز الأهداف (defender puzzles):**
```tsx
{/* زر تلميح في واجهة اللغز */}
<button
  onClick={() => {
    setShowPuzzleHint(true);
    // خصم من الرصيد (اختياري)
    setBudget(prev => Math.max(0, prev - 2000));
  }}
  className="text-sm text-secondary hover:text-secondary/80 underline"
>
  💡 تلميح (-$2,000)
</button>

{showPuzzleHint && (
  <div className="mt-2 p-2 rounded-lg bg-secondary/10 border border-secondary/30 text-sm text-secondary">
    {currentPuzzle.hint || `الإجابة تبدأ بالحرف: ${currentPuzzle.answer[0]}...`}
  </div>
)}
```

---

### 4.3 السماح بالدخول كمدافع بعد الهجوم + تلوين النقطة بالأحمر

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**المشكلة الجذرية:**
- بعد الهجوم على قطاع وتحويل أهدافه إلى `critical`، يجب أن يتمكن المدافع من الدخول وإصلاحها
- حالياً الشرط في كود الدفاع يتحقق من أن القطاع هو `currentAttack.sectorId` فقط
- لكن بعد حل الهجوم الحالي، القطاعات المهاجمة سابقاً تصبح غير متاحة

**الحل المقترح:**

**أ. تتبع القطاعات المهاجمة:**
```tsx
// إضافة state لتتبع القطاعات التي تعرضت لهجوم:
const [attackedSectors, setAttackedSectors] = useState<Set<string>>(new Set());

// عند تنفيذ هجوم ناجح على هدف في قطاع:
setAttackedSectors(prev => new Set([...prev, sectorId]));
```

**ب. تعديل شرط الدخول كمدافع:**
```diff
// الشرط الحالي:
- if (sectorId !== currentAttack?.sectorId) {
-   alert("لا يوجد هجوم حالي على هذه المحافظة");
-   return;
- }

// الشرط الجديد:
+ const sectorTargets = infrastructureTargets[sectorId] || [];
+ const hasCompromisedTargets = sectorTargets.some(t => t.status !== 'safe');
+ const isUnderAttack = sectorId === currentAttack?.sectorId;
+ 
+ if (!isUnderAttack && !hasCompromisedTargets) {
+   alert("لا يوجد هجوم حالي ولا ثغرات في هذه المحافظة");
+   return;
+ }
```

**ج. تلوين النقطة بالأحمر في الخريطة:**
```tsx
// في Map.tsx أو حيثما يُعرض القطاع على الخريطة:
// إضافة prop لتحديد القطاعات المهاجمة:
<CityMap 
  sectors={sectors}
  attackedSectors={attackedSectors}
  // ...
/>

// في المكون الداخلي، تلوين الدائرة:
const sectorColor = attackedSectors.has(sector.id) 
  ? '#ef4444' // أحمر
  : sector.status === 'critical' 
    ? '#ef4444' 
    : sector.status === 'warning' 
      ? '#f59e0b' 
      : '#22c55e'; // أخضر (آمن)
```

---

### 4.4 إصلاح التيرمينال في الواجهة الرئيسية

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**المشكلة الجذرية:**
- التيرمينال في الشريط الجانبي يقبل فقط أمر `clear`
- أي أمر آخر يعطي: `[ERROR] Unknown command`
- خلال هجوم نشط: `[ERROR] Global terminal locked during breach`
- **يعني التيرمينال عملياً لا يعمل كتيرمينال حقيقي**

**الحل المقترح:**
إضافة مجموعة أوامر أساسية مفيدة للتيرمينال الرئيسي:

```typescript
const handleTerminalCommand = (input: string) => {
  const cmd = input.trim().toLowerCase();
  const parts = cmd.split(/\s+/);
  const command = parts[0];
  
  switch (command) {
    case 'clear':
      setTerminalHistory([]);
      break;
      
    case 'status':
      // عرض حالة جميع القطاعات
      const statusReport = sectors.map(s => 
        `  [${s.status === 'safe' ? '✅' : s.status === 'warning' ? '⚠️' : '🔴'}] ${s.name}: ${s.status}`
      ).join('\n');
      addTerminalLine('system', `\n📊 حالة القطاعات:\n${statusReport}`);
      break;
      
    case 'budget':
      addTerminalLine('success', `💰 الرصيد التشغيلي: $${budget.toLocaleString()}`);
      break;
      
    case 'attacks':
      addTerminalLine('system', `🎯 الهجمات المحلولة: ${attacksResolved}/${targetRequired}`);
      if (currentAttack) {
        addTerminalLine('warning', `⚠️ هجوم نشط: ${currentAttack.title} على القطاع ${currentAttack.sectorId}`);
      } else {
        addTerminalLine('success', '✅ لا يوجد هجوم نشط حالياً');
      }
      break;
      
    case 'level':
      addTerminalLine('system', `📶 المستوى الحالي: ${level}`);
      break;
      
    case 'scan':
      // فحص شبكة
      addTerminalLine('system', '🔍 جاري فحص الشبكة...');
      setTimeout(() => {
        const compromised = sectors.filter(s => s.status === 'critical').length;
        const warned = sectors.filter(s => s.status === 'warning').length;
        addTerminalLine('success', `📡 نتائج الفحص: ${compromised} قطاع مخترق، ${warned} قطاع مهدد`);
      }, 1500);
      break;
      
    case 'help':
      addTerminalLine('system', `
📋 الأوامر المتاحة:
  status  - عرض حالة القطاعات
  budget  - عرض الرصيد
  attacks - عرض حالة الهجمات
  level   - عرض المستوى
  scan    - فحص الشبكة
  clear   - مسح التيرمينال
  help    - عرض المساعدة
      `);
      break;
      
    default:
      addTerminalLine('error', `[ERROR] أمر غير معروف: '${command}'. اكتب 'help' للمساعدة.`);
  }
};
```

> [!IMPORTANT]
> يجب إزالة شرط قفل التيرمينال أثناء الهجوم النشط، أو تعديله ليسمح بالأوامر المعلوماتية (status, budget, attacks, help) مع قفل الأوامر التنفيذية فقط.

---

### 4.5 إصلاح الدخول للدوائر الحمراء في المستوى 2 و 3

**الملف:** [Map.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/Map.tsx)

**السبب الجذري للمشكلة:**
1. في المستويين 2 و 3، تتوزع القطاعات على إحداثيات متباعدة للغاية في `src/data/cityData.ts`. هذا يجبر المكون `MapBounds` على تصغير زوم الخريطة تلقائياً (الزوم ينخفض إلى 4 أو 5) ليتمكن من احتواء كافة القطاعات.
2. عند الزوم المنخفض، تفشل خوارزمية حساب المسافات وعتبة النقر `threshold` في المكون المساعد `SectorClickHandler` تماماً، لأن الفروق الجغرافية والرياضية بين إحداثيات النقرة على الخريطة وإحداثيات القطاع الفعلي تصبح أكبر بكثير من العتبة الديناميكية المحسوبة.
3. بالإضافة إلى ذلك، فإن الدائرة الداخلية للقطاع `CircleMarker` تم تعيينها بـ `interactive={false}`، مما يمنعها من التقاط النقرات مباشرة ويجعلها تسقط على الخريطة لتمر عبر `SectorClickHandler` الهش والمفلس رياضياً عند زوم منخفض.

**الحل الجذري والنهائي:**
جعل عناصر الـ `CircleMarker` (الخارجية والداخلية) تفاعلية بشكل مباشر عن طريق تعيين `interactive={true}` وإرفاق معالج حدث النقر `eventHandlers` مباشرة بالقطاع، وإلغاء الحاجة لـ `SectorClickHandler` تماماً! هذا يضمن استجابة فورية ونقراً ناجحاً بنسبة 100% على كافة مستويات الزوم وفي المستويات 1 و 2 و 3.

**التعديلات التفصيلية في [Map.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/Map.tsx):**

**أ. تعديل رسم القطاعات في ملف `Map.tsx` (السطور 186-216):**

```tsx
        {sectors.map(sector => {
          const isActive = sector.id === activeSectorId;
          const color = getStatusColor(sector.status);
          const lat = mapYToLat(sector.y);
          const lng = mapXToLng(sector.x);
          
          return (
            <React.Fragment key={sector.id}>
              {/* الدائرة الخارجية التي تظهر عند الهجوم أو التنشيط */}
              {(isActive || sector.status === 'critical' || sector.status === 'warning') && (
                <CircleMarker
                  center={[lat, lng]}
                  radius={isActive ? (isMobile ? 32 : 24) : (isMobile ? 26 : 18)}
                  color={color}
                  fillColor={color}
                  fillOpacity={0.15}
                  weight={isActive ? 3 : 2}
                  dashArray={isActive ? "5, 5" : undefined}
                  interactive={true}
                  eventHandlers={{
                    click: () => {
                      if (onSectorClick) onSectorClick(sector.id);
                    }
                  }}
                />
              )}
              {/* الدائرة الداخلية الرئيسية للقطاع */}
              <CircleMarker
                center={[lat, lng]}
                radius={isActive ? (isMobile ? 22 : 14) : (isMobile ? 16 : 8)}
                color={theme === 'light' ? '#FFFFFF' : '#0f172a'}
                weight={2}
                fillColor={color}
                fillOpacity={1}
                interactive={true}
                eventHandlers={{
                  click: () => {
                    if (onSectorClick) onSectorClick(sector.id);
                  }
                }}
              />
            </React.Fragment>
          );
        })}
```

**ب. إزالة المكون `SectorClickHandler` تماماً من ملف `Map.tsx` ومن استدعائه داخل الخريطة (السطر 162) لتبسيط الكود وتوفير الأداء المفقود في العمليات الحسابية المتكررة.**

---

### 4.6 إظهار الرصيد في المستوى 3

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**المشكلة المحتملة:**
- الرصيد يُعرض في الـ sidebar تحت "VITAL_STATS"
- في المستوى 3 يبدأ بـ $100,000
- **قد يكون الـ sidebar مخفياً أو الرصيد لا يُعرض بسبب شرط ما**

**الحل المقترح:**
- إضافة عرض الرصيد في الهيدر العلوي أيضاً (وليس فقط في الـ sidebar):

```tsx
{/* عرض الرصيد في الهيدر - يظهر دائماً */}
<div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-variant/50">
  <DollarSign className="w-4 h-4" />
  <span className={`font-mono font-bold ${budget < 20000 ? 'text-error' : 'text-primary'}`}>
    ${budget.toLocaleString()}
  </span>
</div>
```

- التأكد من أن `budget` يُعيّن بشكل صحيح عند `loadLevel(3)`:
```typescript
case 3:
  setBudget(100000); // التأكد من أن هذا موجود
  break;
```

---

### 4.7 إضافة/تحسين زر العودة بعد إنهاء المستوى

**الملف:** [SecureCityView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/SecureCityView.tsx)

**الوضع الحالي (سطر ~913-968):**
- عند الفوز: يوجد "ترقية مستوى الوصول" + "القائمة الرئيسية"
- عند الخسارة: يوجد "إعادة تهيئة المستوى" + "القائمة الرئيسية"
- عند الفوز النهائي (مستوى 3): يوجد "القائمة الرئيسية" فقط

**المشكلة:**
- "القائمة الرئيسية" تذهب لشاشة اختيار المستوى وليس للوحة التحكم الرئيسية

**الحل المقترح:**
إضافة زر ثالث "العودة للوحة التحكم" يستدعي `onBack()`:

```tsx
{/* في جميع شاشات النهاية - إضافة هذا الزر */}
<button 
  onClick={onBack}
  className="px-6 py-2 rounded-xl border border-outline text-on-surface 
             hover:bg-surface-variant transition-all text-sm"
>
  ↩ العودة للوحة التحكم الرئيسية
</button>
```

---

## ✅ خطوات التنفيذ

1. [ ] تعديل `playErrorSound()` إلى صوت إنذار حقيقي (siren)
2. [ ] إضافة زر تلميح مرئي في تيرمينال المدافع
3. [ ] إضافة تلميح في ألغاز الأهداف
4. [ ] إضافة `attackedSectors` state وتعديل شرط الدخول كمدافع
5. [ ] تلوين القطاعات المهاجمة بالأحمر في الخريطة
6. [ ] إصلاح التيرمينال الرئيسي بإضافة أوامر مفيدة
7. [ ] فحص وإصلاح مشكلة الدوائر في المستوى 2 و 3
8. [ ] التأكد من عرض الرصيد في المستوى 3
9. [ ] إضافة زر "العودة للوحة التحكم" في شاشات النهاية
10. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- اختبار صوت الإنذار عند الخطأ (يجب أن يكون مختلفاً عن الصوت القديم)
- اختبار زر التلميح في واجهة المدافع
- الهجوم على قطاع ثم محاولة الدخول كمدافع (يجب أن ينجح)
- التأكد من عمل أوامر التيرمينال الرئيسي (status, budget, scan, help)
- الدخول للمستوى 2 و 3 والنقر على الدوائر الحمراء
- التأكد من ظهور الرصيد في المستوى 3
- إكمال مستوى والتأكد من وجود زر عودة واضح
