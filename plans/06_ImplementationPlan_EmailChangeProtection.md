# 🎯 خطة الإصلاح 06: منع تغيير البريد الإلكتروني

## 📋 ملخص المشكلة

| # | المشكلة | الأولوية | الملف المتأثر |
|---|---------|----------|---------------|
| 6.1 | البريد الإلكتروني يسمح بتغييره ويجب منع ذلك | 🔴 عالية | `DashboardView.tsx` |
| 6.2 | إزالة مسار تحديث الإيميل من الـ API (اختياري) | 🟢 منخفضة | `functions/[[route]].ts` |

---

## 🔧 التحليل التفصيلي

### الوضع الحالي

**في [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx):**
- لوحة الإعدادات (settings panel) تحتوي 3 أزرار: تعديل الاسم، البريد الإلكتروني، كلمة المرور
- زر "البريد الإلكتروني" يفتح نموذج تعديل مع حقل إدخال
- عند الإرسال يستدعي: `await updateProfile(user.id, { email: accountValue.trim() })`
- **لا يوجد أي قيد أو منع**

**في [functions/[[route]].ts](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/functions/%5B%5Broute%5D%5D.ts):**
- مسار `POST /api/user/profile` يقبل `{ email }` في الـ body ويحدّث الـ database مباشرة

---

## 🔧 الحل المقترح

### الطريقة 1: إخفاء/تعطيل زر تغيير البريد (Frontend)

**الملف:** [DashboardView.tsx](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/src/components/DashboardView.tsx)

**الخيار أ: إزالة الزر بالكامل وعرض البريد كنص فقط:**
```tsx
{/* بدلاً من زر قابل للنقر */}
<div className="flex items-center justify-between p-3 rounded-xl bg-surface-variant/50">
  <div className="flex items-center gap-2">
    <Mail className="w-4 h-4 text-on-surface-variant" />
    <span className="text-sm text-on-surface-variant">البريد الإلكتروني</span>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-xs text-on-surface-variant/70 font-mono" dir="ltr">
      {getCurrentUser()?.email || 'غير محدد'}
    </span>
    <Lock className="w-3 h-3 text-on-surface-variant/50" />
  </div>
</div>
```

> [!IMPORTANT]
> يجب استيراد أيقونة `Lock` من `lucide-react`.

**الخيار ب: تعطيل الزر مع رسالة توضيحية:**
```tsx
<button
  disabled
  className="opacity-50 cursor-not-allowed flex items-center justify-between w-full p-3 
             rounded-xl bg-surface-variant/30"
  title="لا يمكن تغيير البريد الإلكتروني"
>
  <div className="flex items-center gap-2">
    <Mail className="w-4 h-4 text-on-surface-variant" />
    <span className="text-sm text-on-surface-variant">البريد الإلكتروني</span>
  </div>
  <div className="flex items-center gap-1 text-xs text-on-surface-variant/50">
    <Lock className="w-3 h-3" />
    <span>مقفل</span>
  </div>
</button>
```

**الخيار المُوصى: الخيار أ** (عرض البريد كنص + أيقونة قفل) — أوضح للمستخدم وأنظف بصرياً.

---

### الطريقة 2: حماية من جهة الـ API (Backend)

**الملف:** [functions/[[route]].ts](file:///C:/Users/Abdalgani/Desktop/taima/final%20project/taima-alwani/functions/%5B%5Broute%5D%5D.ts)

**تعديل مسار `/api/user/profile`:**
```diff
if (path === '/api/user/profile' && method === 'POST') {
  const { user_id, nickname, email, password } = await request.json() as any;
  
+ // منع تغيير البريد الإلكتروني
+ if (email) {
+   return jsonResponse({ error: 'Email cannot be changed' }, 403);
+ }
  
  // ... باقي الكود
}
```

> [!TIP]
> يُوصى بتطبيق **كلتا الطريقتين** (Frontend + Backend) كطبقة حماية مزدوجة (Defense in Depth).

---

## ✅ خطوات التنفيذ

1. [ ] تعديل `DashboardView.tsx`: استبدال زر البريد بعرض نصي مع أيقونة قفل
2. [ ] تعديل `functions/[[route]].ts`: إضافة منع تحديث البريد من الـ API
3. [ ] إزالة حالة `accountField === 'email'` من منطق النموذج (إن وُجدت)
4. [ ] النشر والاختبار على https://taima-alwani.pages.dev/

## 🔍 التحقق

- فتح الإعدادات والتأكد من أن البريد يظهر كنص غير قابل للتعديل
- التأكد من وجود أيقونة القفل بجانب البريد
- محاولة إرسال طلب API مباشر لتغيير البريد (يجب أن يفشل)
