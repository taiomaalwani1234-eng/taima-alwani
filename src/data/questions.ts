export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const millionaireQuestionBank: Question[] = [
  { id: 1, question: "إلى ماذا يرمز حرف 'S' في HTTPS؟", options: ["نظام (System)", "آمن (Secure)", "خادم (Server)", "معيار (Standard)"], correctAnswer: 1, explanation: "HTTPS تعني بروتوكول نقل النص التشعبي الآمن (Secure)." },
  { id: 2, question: "ما هو نوع البرمجيات الخبيثة المصممة لغلق نظامك حتى يتم دفع مبلغ من المال؟", options: ["برامج التجسس (Spyware)", "البرامج الإعلانية (Adware)", "فيروس الفدية (Ransomware)", "حصان طروادة (Trojan)"], correctAnswer: 2, explanation: "فيروس الفدية يقوم بتشفير ملفاتك ويطلب فدية." },
  { id: 3, question: "ما هو الغرض الأساسي من جدار الحماية (Firewall)؟", options: ["تسريع الاتصال بالإنترنت", "تصفية حركة مرور الشبكة الواردة والصادرة", "تنظيف الفيروسات من القرص الصلب", "تشفير كلمات المرور"], correctAnswer: 1, explanation: "يقوم جدار الحماية بمراقبة والتحكم في حركة مرور الشبكة." },
  { id: 4, question: "ما هو التصيد الاحتيالي (Phishing)؟", options: ["طريقة لتأمين الشبكة", "محاولة احتيالية للحصول على معلومات حساسة", "أداة لفحص المنافذ", "نوع من النسخ الاحتياطي للبيانات"], correctAnswer: 1, explanation: "التصيد هو هجوم إلكتروني يخادع المستلمين لسرقة بياناتهم." },
  { id: 5, question: "أي مما يلي يُعد خوارزمية تشفير متماثل (Symmetric Encryption)؟", options: ["RSA", "ECC", "AES", "Diffie-Hellman"], correctAnswer: 2, explanation: "AES هي خوارزمية تشفير متماثل تستخدم مفتاحاً واحداً للتشفير وفك التشفير." },
  { id: 6, question: "ما هو هجوم حجب الخدمة الموزع (DDoS)؟", options: ["تدمير بيانات الخوادم", "تعطيل الخدمة بإغراق الخادم بالزيارات", "نظام تجاوز النطاق المباشر", "الدفاع الرقمي للتخزين"], correctAnswer: 1, explanation: "إغراق الخادم بحركة مرور كثيفة من عدة أجهزة." },
  { id: 7, question: "ما هي عملية إخفاء البيانات داخل ملف أو رسالة أخرى؟", options: ["التشفير", "إخفاء المعلومات (Steganography)", "التجزئة", "التشويش"], correctAnswer: 1, explanation: "Steganography هو إخفاء ملف داخل آخر." },
  { id: 8, question: "في نموذج OSI، أي طبقة مسؤولة عن توجيه الحزم (Routing)؟", options: ["الطبقة 2: Data Link", "الطبقة 3: Network", "الطبقة 4: Transport", "الطبقة 7: Application"], correctAnswer: 1, explanation: "تتعامل طبقة الشبكة مع توجيه الحزم عبر الشبكات." },
  { id: 9, question: "ما هو الهدف الرئيسي لهجوم حقن قوعد البيانات (SQL Injection)؟", options: ["متصفحات الويب", "أنظمة التشغيل", "قواعد البيانات", "الشبكات اللاسلكية"], correctAnswer: 2, explanation: "حقن قواعد البيانات بالاستعلامات الخبيثة." },
  { id: 10, question: "ما هو البروتوكول المستخدم عادة للوصول الآمن عن بعد؟", options: ["Telnet", "FTP", "SSH", "HTTP"], correctAnswer: 2, explanation: "يستخدم SSH للوصول الآمن عن بعد." },
  { id: 11, question: "ما هي شبكة الروبوت (Botnet)؟", options: ["شبكة من المحللين", "مجموعة أجهزة مخترقة تتحكم بها جهة هجومية", "أداة تكوين", "قاعدة بيانات سحابية"], correctAnswer: 1, explanation: "Botnet شبكة أجهزة مخترقة." },
  { id: 12, question: "أي خوارزمية تجزئة تعتبر الآن مكسورة تشفيرياً؟", options: ["SHA-256", "Bcrypt", "MD5", "Argon2"], correctAnswer: 2, explanation: "MD5 تعاني من ضعف التصادم." },
  { id: 13, question: "في التشفير بالمفتاح العام، أي مفتاح يستخدم للتحقق من التوقيع الرقمي؟", options: ["المفتاح الخاص للمرسل", "المفتاح العام للمرسل", "المفتاح الخاص للمستلم", "المفتاح العام للمستلم"], correctAnswer: 1, explanation: "يستخدم المفتاح العام للمرسل لعملية التحقق." },
  { id: 14, question: "ما هي ثغرة يوم الصفر (Zero-Day)؟", options: ["خلل تم إصلاحه", "ثغرة غير معروفة للمورد تستغل فوراً", "شبكة تعمل بدون توقف", "ثغرة بدون خطورة"], correctAnswer: 1, explanation: "تستغل الثغرة قبل طرح التحديث الخاص بها." },
  { id: 15, question: "ما هو إطار المصادقة الذي يستخدم التذاكر (Tickets)؟", options: ["OAuth", "RADIUS", "Kerberos", "SAML"], correctAnswer: 2, explanation: "يعتمد Kerberos على التذاكر." },
  { id: 16, question: "ما هو المنفذ (Port) الافتراضي لبروتوكول HTTPS؟", options: ["21", "22", "80", "443"], correctAnswer: 3, explanation: "يستخدم HTTPS المنفذ 443 افتراضياً." },
  { id: 17, question: "ما الذي يقوم به الـ DNS؟", options: ["ترجمة أسماء النطاقات لعناوين IP", "منع الفيروسات", "تشفير الشبكة", "توجيه الحزم"], correctAnswer: 0, explanation: "الـ DNS يترجم النطاقات لعناوين IP." },
  { id: 18, question: "ما هو هجوم XSS؟", options: ["سرقة الخادم", "حقن أكواد برمجية خبيثة في متصفح المستخدم", "تعطيل الشبكة", "تخمين كلمات المرور"], correctAnswer: 1, explanation: "هجوم البرمجية عبر المواقع (XSS)." },
  { id: 19, question: "أي مما يلي يُعد عنوان IP من الفئة C (Private)؟", options: ["8.8.8.8", "192.168.1.1", "10.0.0.1", "172.16.0.1"], correctAnswer: 1, explanation: "192.168.x.x هي شبكة خاصة شهيرة." },
  { id: 20, question: "ما المقصود بـ Social Engineering؟", options: ["تطوير الأنظمة", "اختراق العقول وخداع المستخدمين للحصول على معلومات", "بناء الشبكات المعقدة", "تشفير قواعد البيانات"], correctAnswer: 1, explanation: "الهندسة الاجتماعية تعتمد على الخداع البشري." },
  { id: 21, question: "أداة شهيرة لتحليل والتقاط الحزم في الشبكة؟", options: ["Wireshark", "Photoshop", "Notepad", "Excel"], correctAnswer: 0, explanation: "Wireshark يقوم بتحليل الحزم." },
  { id: 22, question: "ما هو نظام كشف التسلل (IDS)؟", options: ["يمنع تلقائياً جميع الهجمات", "يكتشف النشاط المشبوه والمخالفات ويبلغ عنها", "يسرع التصفح", "يشفر الملفات"], correctAnswer: 1, explanation: "الـ IDS يراقب وينبه، بينما IPS يمنع." },
  { id: 23, question: "ما هو الهجوم بـ Man-in-the-Middle؟", options: ["اعتراض الاتصال والتنصت عليه", "إيقاف المودم", "تكسير الشاشة", "تصيد الروابط"], correctAnswer: 0, explanation: "يتم اعتراض الاتصال بين الطرفين." },
  { id: 24, question: "ما هو الـ Honeypot؟", options: ["مكافح فيروسات", "نظام مصيدة وهمي لجذب وتتبع المخترقين", "نوع من الفدية", "أداة حفظ كلمات المرور"], correctAnswer: 1, explanation: "المصيدة تجذب المهاجمين لدراسة سلوكهم." },
  { id: 25, question: "خوارزمية RSA تنتمي إلى أي نوع من التشفير؟", options: ["تشفير متماثل", "تشفير غير متماثل", "تجزئة (Hashing)", "تشفير متدفق (Stream)"], correctAnswer: 1, explanation: "تستخدم مفتاحين: عام وخاص." },
  { id: 26, question: "ما هو البروتوكول الأقل أماناً للدخول عن بعد؟", options: ["SSH", "VPN", "Telnet", "RDP مع NLA"], correctAnswer: 2, explanation: "يرسل Telnet كل شيء كنص غير مشفر." },
  { id: 27, question: "ما هي هجمات Brute Force؟", options: ["تخمين وتجربة كل الاحتمالات الممكنة لكلمة المرور", "إرسال روابط خبيثة", "زرع باب خلفي في الخادم", "قطع كابلات الشبكة"], correctAnswer: 0, explanation: "هجوم القوة الغاشمة يجرب كل شيء." },
  { id: 28, question: "الأداة Nmap تُستخدم بشكل أساسي في ماذا؟", options: ["صناعة الفيروسات", "فحص المنافذ واستكشاف الشبكات", "برمجة تطبيقات الويب", "تنظيف المتصفح"], correctAnswer: 1, explanation: "Nmap أداة أساسية لفحص الشبكات." },
  { id: 29, question: "ما هي التجزئة (Hashing)؟", options: ["عملية تشفير باتجاهين", "تحويل البيانات بنص ثابت الطول باتجاه واحد", "نسخ البيانات الاحتياطية", "تبادل المفاتيح"], correctAnswer: 1, explanation: "التجزئة دالة رياضية غير انعكاسية." },
  { id: 30, question: "كيف تحمي ملفاتك في حال فقدان الجهاز أو سرقته؟", options: ["تغيير الخلفية", "تشفير القرص الصلب (Full Disk Encryption)", "فتح جميع المنافذ", "استخدام شبكة سلكية"], correctAnswer: 1, explanation: "التشفير الكامل يحمي البيانات عند السرقة المادية." }
];

export function getRandomMillionaireQuestions(count: number = 15): Question[] {
  const shuffled = [...millionaireQuestionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const prizeTree = [
  100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 250000, 500000, 750000, 1000000
];


