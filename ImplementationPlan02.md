# ImplementationPlan02 - تحسينات لوحة الإدارة

## ملخص

تحسين لوحة الإدارة من ناحية الواجهة والصلاحيات: عرض بيانات المستخدمين كاملة، صلاحيات كاملة للمدير (تغيير كلمات المرور، حظر، تعديل)، وإخفاء زر لوحة الإدارة عن المستخدمين العاديين.

---

## المرحلة 1: نظام الأدوار (role) في قاعدة البيانات

### 1.1 إضافة عمود `role` لجدول المستخدمين

**الملفات**: `functions/[[route]].ts`
**الأولوية**: P0

**الوضع الحالي**: لا يوجد مفهوم "أدمن" في قاعدة البيانات. كلمة المرور `admin` مكتوبة يدويا في الكود.

**المطلوب**:
1. إضافة عمود `role TEXT DEFAULT 'user'` لجدول `users` عبر migration آمن
2. القيم المسموحة: `user` (عادي)، `admin` (مدير كامل)
3. أول مستخدم يسجل يصبح `admin` تلقائيا، أو يتم ترقية مستخدم معين يدويا

**التعديلات في `functions/[[route]].ts`**:
```
initDB() → إضافة migration:
  if (!columns.includes('role')) {
    migrations.push(db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"));
  }
```

**إضافة endpoint لترقية الدور** `POST /api/admin/users/:id/role`:
```
- يقبل: { role: 'admin' | 'user' }
- يتطلب: X-Admin-Token
- يحدث عمود role للمستخدم المحدد
```

### 1.2 إرجاع `role` مع بيانات المستخدم عند تسجيل الدخول

**الملفات**: `functions/[[route]].ts` (endpoints: login, register, profile)

**الوضع الحالي**: SELECT يرجع `id, username, email, nickname, level, created_at` — بدون `role`.

**المطلوب**: إضافة `role` لكل SELECT يرجع بيانات المستخدم:
```sql
SELECT id, username, email, nickname, level, role, created_at FROM users WHERE id = ?
```

هذا يشمل:
- `/api/auth/register` (سطر 186)
- `/api/auth/login` (سطر 213, 226, 233)
- `/api/user/profile` (سطر 256)

---

## المرحلة 2: إخفاء زر لوحة الإدارة عن المستخدمين العاديين

### 2.1 تمرير `role` من App إلى DashboardView

**الملفات**: `src/App.tsx`, `src/components/DashboardView.tsx`, `src/services/backendApi.ts`

**الوضع الحالي**: زر "لوحة الإدارة" ظاهر لكل مستخدم في قائمة الإعدادات (`DashboardView.tsx:337-343`).

**المطلوب**:

**في `App.tsx`**:
- إضافة state: `const [userRole, setUserRole] = useState<string>('user');`
- عند تسجيل الدخول (`handleLogin`): استقبال `role` وتخزينها
- تمرير `userRole` إلى `DashboardView`

**في `DashboardView.tsx`**:
- إضافة prop: `userRole?: string`
- لف زر لوحة الإدارة بشرط:
```tsx
{userRole === 'admin' && (
  <button onClick={() => onSelectGame("admin" as any)} ...>
    لوحة الإدارة
  </button>
)}
```

**في `backendApi.ts`**:
- التأكد من أن `getCurrentUser()` يرجع `role` المخزن في localStorage

### 2.2 حماية route الأدمن في App.tsx

**الملف**: `src/App.tsx:142-144`

**المطلوب**: منع الوصول إلى AdminView إذا لم يكن المستخدم admin:
```tsx
{currentView === 'admin' && userRole === 'admin' && (
  <AdminView onBack={() => setCurrentView('dashboard')} />
)}
```

---

## المرحلة 3: تحسين واجهة لوحة الإدارة (UI)

### 3.1 عرض بيانات المستخدمين كاملة

**الملف**: `src/components/AdminView.tsx` (تبويب المستخدمون)

**الوضع الحالي**: الجدول يعرض فقط: ID، اسم المستخدم، المستوى، الكنية، إجراءات.

**المطلوب**: إضافة الأعمدة التالية:

| العمود | المصدر | ملاحظة |
|--------|--------|--------|
| البريد الإلكتروني | `user.email` | عرض مع أيقونة Mail |
| الدور | `user.role` | badge ملون: admin=أخضر، user=رمادي |
| تاريخ التسجيل | `user.created_at` | تنسيق تاريخ عربي |
| آخر دخول | `user.last_login` | تنسيق تاريخ عربي |

**تحديث interface**:
```typescript
interface User {
  id: number;
  username: string;
  email: string;       // جديد
  nickname: string;
  level: string;
  role: string;        // جديد
  created_at: string;
  last_login: string;
}
```

**تصميم الجدول المحسن**: تحويل الجدول من `<table>` إلى بطاقات (cards) على الموبايل، مع الإبقاء على الجدول في سطح المكتب:

```
Desktop: جدول كامل بكل الأعمدة
Mobile: بطاقة لكل مستخدم تعرض:
  - الاسم + البريد (أعلى البطاقة)
  - المستوى + الدور (badges)
  - تاريخ التسجيل + آخر دخول
  - أزرار الإجراءات (أسفل البطاقة)
```

### 3.2 تحسين تبويب الإحصائيات

**الملف**: `src/components/AdminView.tsx` (تبويب الإحصائيات)

**الوضع الحالي**: 3 بطاقات فقط (إجمالي المستخدمين، إجمالي العمليات، مسجلين اليوم).

**المطلوب**: إضافة إحصائيات جديدة:

| الإحصائية | API الجديد | الوصف |
|-----------|-----------|-------|
| مستخدمين نشطين (آخر 7 أيام) | `/api/stats` | `WHERE last_login > datetime('now', '-7 days')` |
| إجمالي الأدمن | `/api/stats` | `WHERE role = 'admin'` |
| أكثر لعبة نشاطا | `/api/stats` | `GROUP BY game_type ORDER BY COUNT DESC` |

**تحديث `/api/stats` في الـ backend**:
```sql
-- مستخدمين نشطين
SELECT COUNT(*) FROM users WHERE last_login > datetime('now', '-7 days')

-- عدد الأدمن
SELECT COUNT(*) FROM users WHERE role = 'admin'

-- أكثر لعبة نشاطا
SELECT game_type, COUNT(*) as cnt FROM progress GROUP BY game_type ORDER BY cnt DESC LIMIT 1
```

### 3.3 تحسين تبويب السجلات

**الملف**: `src/components/AdminView.tsx` (تبويب السجلات)

**المطلوب**:
1. إضافة فلتر حسب نوع الإجراء (register, login, save_progress, level_up)
2. إضافة فلتر حسب المستخدم (dropdown)
3. إضافة pagination (10/25/50 سجل في الصفحة)
4. تحسين عرض التفاصيل (JSON → عرض مقروء)

---

## المرحلة 4: صلاحيات الأدمن الكاملة

### 4.1 تغيير كلمة مرور أي مستخدم

**الملفات**: `functions/[[route]].ts`, `src/components/AdminView.tsx`

**Endpoint جديد**: `POST /api/admin/users/:id/password`
```
- يقبل: { new_password: string }
- يتطلب: X-Admin-Token
- يهش كلمة المرور الجديدة بـ PBKDF2
- يحدث password_hash للمستخدم المحدد
- يسجل في logs: action = 'admin_password_reset'
```

**في AdminView**: إضافة زر "تغيير كلمة المرور" بجانب كل مستخدم:
- يفتح modal/نافذة صغيرة
- حقل كلمة المرور الجديدة + تأكيد
- validation: minimum 4 أحرف
- عند النجاح: toast "تم تغيير كلمة المرور"

### 4.2 تغيير دور المستخدم (ترقية/تخفيض)

**الملفات**: `functions/[[route]].ts`, `src/components/AdminView.tsx`

**Endpoint جديد**: `POST /api/admin/users/:id/role`
```
- يقبل: { role: 'admin' | 'user' }
- يتطلب: X-Admin-Token
- يحدث عمود role
- يسجل في logs: action = 'admin_role_change'
```

**في AdminView**: إضافة dropdown لتغيير الدور في وضع التعديل:
```tsx
<select value={editRole} onChange={...}>
  <option value="user">مستخدم عادي</option>
  <option value="admin">مدير</option>
</select>
```

### 4.3 تعديل بيانات أي مستخدم

**الملفات**: `functions/[[route]].ts`, `src/components/AdminView.tsx`

**Endpoint محسن**: `POST /api/admin/users/:id/update`
```
- يقبل: { nickname?, email?, level?, role? }
- يتطلب: X-Admin-Token
- يحدث كل الحقول المرسلة
- يسجل في logs: action = 'admin_user_edit'
```

**الوضع الحالي**: التعديل يستخدم `/api/user/level` فقط لتغيير المستوى (سطر 252-258).

**المطلوب**: وضع التعديل الموسع يسمح بتغيير:
- الكنية (nickname)
- البريد الإلكتروني (email)
- المستوى (level)
- الدور (role)

### 4.4 حظر/تعطيل مستخدم (اختياري)

**الملفات**: `functions/[[route]].ts`, `src/components/AdminView.tsx`

**Endpoint جديد**: `POST /api/admin/users/:id/ban`
```
- يضيف عمود is_banned BOOLEAN DEFAULT 0 لجدول users
- يمنع المستخدم المحظور من تسجيل الدخول
- يعرض badge "محظور" في لوحة الإدارة
```

---

## المرحلة 5: تحسين نظام التوثيق للأدمن

### 5.1 استبدال كلمة المرور الثابتة بتوثيق حقيقي

**الملف**: `src/components/AdminView.tsx:48-51, 124-151`

**الوضع الحالي**: لوحة الإدارة تسأل عن كلمة مرور ثابتة (`admin`) عند الدخول. هذا غير آمن ولا ضروري إذا تم تنفيذ نظام الأدوار.

**المطلوب**: إزالة بوابة كلمة المرور بالكامل. بدلا منها:
1. التحقق من `role === 'admin'` قبل عرض AdminView (المرحلة 2.2)
2. استخدام `X-Admin-Token` = كلمة مرور المستخدم الحالي أو JWT بسيط
3. أو الاحتفاظ بها كطبقة حماية إضافية مع ربطها بـ `ADMIN_SECRET` من بيئة Cloudflare

**الخيار الموصى به**: إزالة بوابة كلمة المرور والاعتماد على `role` فقط. الأدمن المسجل دخوله لا يحتاج لكتابة كلمة مرور مرة ثانية. `X-Admin-Token` يبقى في الـ backend للحماية على مستوى API.

### 5.2 تمرير token الأدمن بشكل آمن

**الملف**: `src/components/AdminView.tsx:51-58`

**الوضع الحالي**: `adminPass` يمرر كـ header مع كل طلب. قيمته هي ما أدخله المستخدم يدويا.

**المطلوب** (إذا أبقينا على بوابة كلمة المرور):
- تخزين token في sessionStorage (ليس localStorage) حتى يضيع عند إغلاق المتصفح
- أو استخدام user session token بدلا من كلمة مرور ثابتة

---

## المرحلة 6: تحسينات UI إضافية

### 6.1 تصميم responsive محسن للوحة

**الملف**: `src/components/AdminView.tsx`

**المطلوب**:
- Header ثابت (sticky) مع اسم التبويب الحالي
- Sidebar navigation على الشاشات الكبيرة بدل tabs أفقية
- أيقونة عدد المستخدمين/السجلات بجانب كل tab
- Loading skeleton بدل مؤشر التحميل البسيط

### 6.2 إضافة Toast notifications

**الملف**: `src/components/AdminView.tsx`

**المطلوب**: عند نجاح أو فشل العمليات:
- "تم حذف المستخدم بنجاح" (أخضر)
- "تم تغيير كلمة المرور" (أخضر)
- "خطأ في الاتصال بالخادم" (أحمر)
- استخدام `Toast` component الموجود في `src/components/Toast.tsx`

### 6.3 تأكيد العمليات الحساسة

**الملف**: `src/components/AdminView.tsx`

**المطلوب**: استبدال `window.confirm()` بـ modal مخصص:
- حذف مستخدم: "هل أنت متأكد من حذف [اسم المستخدم]؟ سيتم حذف جميع بياناته."
- تغيير كلمة المرور: "سيتم تغيير كلمة مرور [اسم المستخدم]"
- تغيير الدور: "سيتم ترقية/تخفيض [اسم المستخدم]"

---

## ملخص الملفات المتأثرة

| الملف | التغييرات |
|-------|----------|
| `functions/[[route]].ts` | migration لـ role، endpoints جديدة (password reset, role change, user edit, ban)، تحسين stats |
| `src/components/AdminView.tsx` | إعادة بناء شبه كامل: جدول محسن، بطاقات موبايل، إجراءات جديدة، فلاتر، toasts |
| `src/components/DashboardView.tsx` | إخفاء زر الأدمن عن المستخدمين العاديين (شرط `role === 'admin'`) |
| `src/App.tsx` | إضافة `userRole` state، تمريره لـ Dashboard، حماية route الأدمن |
| `src/services/backendApi.ts` | لا تغييرات جوهرية — `role` يرجع تلقائيا مع بيانات المستخدم |

---

## ترتيب التنفيذ

| # | المهمة | الأولوية | الجهد |
|---|--------|----------|-------|
| 1 | إضافة عمود `role` + migration | P0 | صغير |
| 2 | إرجاع `role` مع بيانات المستخدم | P0 | صغير |
| 3 | إخفاء زر الأدمن عن المستخدمين العاديين | P0 | صغير |
| 4 | حماية route الأدمن في App.tsx | P0 | صغير |
| 5 | Endpoint تغيير كلمة مرور المستخدم | P0 | متوسط |
| 6 | Endpoint تغيير الدور | P0 | صغير |
| 7 | Endpoint تعديل بيانات المستخدم | P1 | متوسط |
| 8 | تحسين جدول المستخدمين (أعمدة + بطاقات) | P1 | متوسط |
| 9 | تحسين الإحصائيات | P1 | متوسط |
| 10 | فلاتر السجلات + pagination | P2 | متوسط |
| 11 | استبدال بوابة كلمة المرور | P2 | صغير |
| 12 | Toast notifications + confirmation modals | P2 | متوسط |
| 13 | تحسينات UI إضافية (responsive, skeleton) | P3 | كبير |
| 14 | نظام الحظر (اختياري) | P3 | متوسط |

**إجمالي الأسطر الجديدة/المعدلة**: ~400-500 سطر
**Endpoints جديدة**: 3 (password reset, role change, user edit)
