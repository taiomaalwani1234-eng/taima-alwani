export interface Sector {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'safe' | 'warning' | 'critical' | 'offline';
  description: string;
}

export const LEVEL_1_SECTORS: Sector[] = [
  { id: 'central_hub', name: 'مركز القيادة (دمشق)', x: 110, y: 725, status: 'safe', description: 'العمليات الأساسية للإدارة. محصنة بشدة.' },
  { id: 'power_grid', name: 'شبكة الطاقة (حمص)', x: 170, y: 500, status: 'safe', description: 'التوزيع الرئيسي للطاقة.' },
  { id: 'hospital', name: 'المركز الطبي (حلب)', x: 230, y: 240, status: 'safe', description: 'شبكات دعم الحياة وتخزين البيانات.' },
  { id: 'data_center', name: 'قبو البيانات (اللاذقية)', x: 40, y: 360, status: 'safe', description: 'سجلات المواطنين المشفرة وسجلات المال.' },
  { id: 'bank', name: 'قاعدة الصرافة (حماة)', x: 180, y: 430, status: 'safe', description: 'عقدة تداول عالية التردد لاحتياطيات العملة.' },
  { id: 'comm_tower', name: 'برج الاتصالات (طرطوس)', x: 50, y: 480, status: 'safe', description: 'أنظمة اتصالات وبث الطوارئ.' },
];

export const LEVEL_2_SECTORS: Sector[] = [
  ...LEVEL_1_SECTORS,
  { id: 'traffic_control', name: 'إدارة المرور (السويداء)', x: 150, y: 870, status: 'safe', description: 'أنظمة الإشارات الذكية وتوجيه المركبات ذاتية القيادة.' },
  { id: 'water_plant', name: 'محطة المياه (الرقة)', x: 500, y: 280, status: 'safe', description: 'معالجة وتوزيع المياه النقية.' },
  { id: 'airport', name: 'المطار (درعا)', x: 85, y: 890, status: 'safe', description: 'ملاحة جوية وأنظمة جمارك آلية.' },
  { id: 'police_hq', name: 'مقر الدرع (تدمر)', x: 400, y: 530, status: 'safe', description: 'تنسيق قوات الأمن وتخزين الأدلة الجنائية الرقمية.' },
  { id: 'commercial_zone', name: 'المنطقة التجارية (دير الزور)', x: 660, y: 390, status: 'safe', description: 'مراكز تسوق تعتمد على إنترنت الأشياء (IoT).' },
  { id: 'university', name: 'الجامعة (الحسكة)', x: 750, y: 180, status: 'safe', description: 'أبحاث متقدمة وشبكات اختبار أكاديمية.' },
];

export const LEVEL_3_SECTORS: Sector[] = [
  ...LEVEL_2_SECTORS,
  { id: 'military_base', name: 'القطاع العسكري (القامشلي)', x: 820, y: 80, status: 'safe', description: 'أسلحة ذاتية، رادارات عالية الحساسية.' },
  { id: 'space_port', name: 'منصة الإطلاق', x: 232, y: 300, status: 'safe', description: 'تواصل مع أقمار حماية اصطناعية.' },
  { id: 'subway_system', name: 'المترو العميق', x: 130, y: 700, status: 'safe', description: 'قطارات مغناطيسية تحت أرضية.' },
  { id: 'factory_alpha', name: 'مصنع ألفا', x: 160, y: 460, status: 'safe', description: 'تصنيع أتمتة متقدمة وروبوتات.' },
  { id: 'embassy_district', name: 'الحي الدبلوماسي', x: 90, y: 740, status: 'safe', description: 'شبكات بيانات سيادية خاصة.' },
  { id: 'drone_hub', name: 'مركز الطائرات', x: 190, y: 520, status: 'safe', description: 'تنسيق الطائرات المسيرة للتوصيل والأمن.' },
  { id: 'research_lab', name: 'مختبر سري', x: 680, y: 350, status: 'safe', description: 'أبحاث بيولوجية وإلكترونية غير مصرح بها.' },
  { id: 'nuclear_reactor', name: 'مفاعل متطور', x: 30, y: 400, status: 'safe', description: 'طاقة نووية تغذي المدينة بشبكات مستقلة.' },
  { id: 'media_center', name: 'المركز الإعلامي', x: 120, y: 730, status: 'safe', description: 'بث هولوغرامي وأخبار في الوقت الفعلي.' },
  { id: 'port_auth', name: 'الميناء', x: 35, y: 340, status: 'safe', description: 'إدارة حركة السفن وشحن البضائع الآلي.' },
  { id: 'cloud_archives', name: 'أرشيف السحابة', x: 110, y: 650, status: 'safe', description: 'تخزين بيانات سيادي طويل الأمد.' },
  { id: 'smart_farms', name: 'المزارع الذكية', x: 500, y: 200, status: 'safe', description: 'زراعة آلية معتمدة على الذكاء الاصطناعي.' },
  { id: 'ai_core', name: 'جوهر الذكاء', x: 100, y: 710, status: 'safe', description: 'دماغ المدينة البديل.' },
];

export const ATTACKS_LEVEL_1 = [
  {
    sectorId: 'bank', title: 'هجوم حرمان من الخدمة (DDoS)', desc: 'تدفق بيانات هائل لتعطيل خوادم التداول المركزية.',
    options: [
      { id: '1', text: 'تفعيل خدمة تصفية حركة المرور (Scrubbing)', isCorrect: true, cost: 2500 },
      { id: '2', text: 'إيقاف تشغيل الخوادم مؤقتاً', isCorrect: false, cost: 8000 },
      { id: '3', text: 'حظر جميع العناوين الدولية من الجدار الناري', isCorrect: false, cost: 5000 },
      { id: '4', text: 'تجاهل الهجوم وتقوية التشفير', isCorrect: false, cost: 6000 },
      { id: '5', text: 'إعادة توجيه البيانات لمزود آخر', isCorrect: false, cost: 4000 }
    ]
  },
  {
    sectorId: 'power_grid', title: 'حقن أوامر (Command Injection)', desc: 'مخترق يحاول التلاعب بمعدلات ضخ الطاقة.',
    options: [
      { id: '1', text: 'فصل الشبكة بالكامل', isCorrect: false, cost: 15000 },
      { id: '2', text: 'تنقية البيانات المدخلة وتحديث واجهة التحكم (Sanitization)', isCorrect: true, cost: 1500 },
      { id: '3', text: 'تغيير كلمات مرور المهندسين', isCorrect: false, cost: 2000 },
      { id: '4', text: 'نقل العمليات لخوادم احتياطية', isCorrect: false, cost: 7000 },
      { id: '5', text: 'زيادة سحب الطاقة لإيقاف الهجوم العكسي', isCorrect: false, cost: 10000 }
    ]
  },
  {
    sectorId: 'hospital', title: 'تشفير الفدية (Ransomware)', desc: 'تشفير ملفات أرشفة بيانات المرضى الحيوية.',
    options: [
      { id: '1', text: 'دفع الفدية عبر عملة مشفرة', isCorrect: false, cost: 25000 },
      { id: '2', text: 'إعادة ضبط الأجهزة بالكامل', isCorrect: false, cost: 20000 },
      { id: '3', text: 'استخراج مفتاح التشفير من الذاكرة', isCorrect: false, cost: 8000 },
      { id: '4', text: 'عزل الأجهزة المصابة واستعادة النسخ الاحتياطية', isCorrect: true, cost: 4000 },
      { id: '5', text: 'ترقية نظام التشغيل على الأجهزة المتضررة', isCorrect: false, cost: 6000 }
    ]
  }
];

export const ATTACKS_LEVEL_2 = [
  ...ATTACKS_LEVEL_1,
  {
    sectorId: 'airport', title: 'هجوم عبر هجمات الوسيط (MitM)', desc: 'تم اعتراض بيانات تواصل أبراج المراقبة مع الطائرات.',
    options: [
      { id: '1', text: 'تغيير تردد الراديو للطائرات', isCorrect: false, cost: 5000 },
      { id: '2', text: 'منع الطائرات من الهبوط لعدة ساعات', isCorrect: false, cost: 15000 },
      { id: '3', text: 'تطبيق تشفير TLS متقدم وإجبار التحقق من الشهادات (Mutual TLS)', isCorrect: true, cost: 3500 },
      { id: '4', text: 'استخدام إشارات ضوئية قديمة', isCorrect: false, cost: 2000 },
      { id: '5', text: 'إعادة توجيه الرحلات لمطارات دولية قريبة', isCorrect: false, cost: 20000 },
      { id: '6', text: 'إطفاء الرادارات الرئيسية للمطار', isCorrect: false, cost: 10000 },
      { id: '7', text: 'تغيير مزود خدمة الإنترنت للمطار', isCorrect: false, cost: 8000 },
      { id: '8', text: 'الاعتماد على إحداثيات GPS فقط وتحذير الطيارين', isCorrect: false, cost: 3000 },
      { id: '9', text: 'بث إشارة تشويش كهرومغناطيسية', isCorrect: false, cost: 12000 },
      { id: '10', text: 'تنشيط الاتصال عبر الأقمار الاصطناعية المفتوحة', isCorrect: false, cost: 6000 }
    ]
  },
  {
    sectorId: 'traffic_control', title: 'هجوم التصيد الاحتيالي (Phishing)', desc: 'موظف في التحكم المروري فتح مرفقاً خبيثاً أعطى المخربين ولوجاً لمعلومات الإشارات الذكية.',
    options: [
      { id: '1', text: 'فصل جميع الإشارات الذكية وجعلها يدوية', isCorrect: false, cost: 18000 },
      { id: '2', text: 'إغلاق حسابات الموظفين المصابة وفرض مصادقة ثنائية (MFA)', isCorrect: true, cost: 2500 },
      { id: '3', text: 'طرد جميع الموظفين وإغلاق المبنى', isCorrect: false, cost: 30000 },
      { id: '4', text: 'فتح تحقيق جنائي مع الإبقاء على الأنظمة قيد التشغيل', isCorrect: false, cost: 5000 },
      { id: '5', text: 'إرسال تحذير بالبريد الإلكتروني للجميع', isCorrect: false, cost: 1000 },
      { id: '6', text: 'حظر الإنترنت الخارجي عن جميع الموظفين', isCorrect: false, cost: 6000 },
      { id: '7', text: 'إرسال المرفق الخبيث لفريق الصيانة لتحليله على أجهزتهم', isCorrect: false, cost: 10000 },
      { id: '8', text: 'تدريب الموظفين على الأمان فورا', isCorrect: false, cost: 4000 },
      { id: '9', text: 'استعادة خوادم البريد لنسخة الأمس', isCorrect: false, cost: 7000 },
      { id: '10', text: 'دفع أموال لشركة خارجية لفحص الأجهزة المصابة', isCorrect: false, cost: 9000 },
    ]
  }
];

export const ATTACKS_LEVEL_3 = [
  ...ATTACKS_LEVEL_2,
  {
    sectorId: 'nuclear_reactor', title: 'هجوم هجمات يوم الصفر (Zero-Day)', desc: 'استغلال في نظام تبريد المفاعل ينذر بكارثة حرارية لا توجد لها حماية مسبقة.',
    options: [
      { id: '1', text: 'إطفاء المفاعل النووي بشكل كامل وطارئ', isCorrect: false, cost: 45000 },
      { id: '2', text: 'استخدام أجهزة تبريد خارجية متصلة بالشبكة الخبيثة', isCorrect: false, cost: 20000 },
      { id: '3', text: 'تطبيق التحديث الأمني (Patch) مباشرة بدون اختباره', isCorrect: false, cost: 15000 },
      { id: '4', text: 'التحويل للتشغيل اليدوي المستقل كلياً عن الشبكة (Air-Gapping) وعزل النظام المائي', isCorrect: true, cost: 8000 },
      { id: '5', text: 'انتظار صدور التحديث الرسمي من الشركة الموردة', isCorrect: false, cost: 50000 },
      { id: '6', text: 'إعادة توجيه البيانات لمختبر سري للتمويه', isCorrect: false, cost: 10000 },
      { id: '7', text: 'ضخ كميات ضخمة من النيتروجين المبرد يدويا', isCorrect: false, cost: 18000 },
      { id: '8', text: 'تشغيل النظام الاحتياطي المتصل بنفس الشبكة', isCorrect: false, cost: 25000 },
      { id: '9', text: 'عمل إعادة تشغيل للنظام التبريدي', isCorrect: false, cost: 12000 },
      { id: '10', text: 'تغيير خوارزمية التشفير', isCorrect: false, cost: 4000 },
      { id: '11', text: 'محاولة التفاوض مع المهاجمين على الشبكة المظلمة', isCorrect: false, cost: 35000 },
      { id: '12', text: 'إخلاء جميع السكان من المنطقة المحيطة', isCorrect: false, cost: 40000 },
    ]
  },
  {
    sectorId: 'military_base', title: 'هجوم هندسة عكسية (Reverse Engineering)', desc: 'طائرات استطلاع معادية حللت بروتوكولات الاتصال وتحاول الدخول كمستخدم محلي.',
    options: [
      { id: '1', text: 'إسقاط الطائرات المعادية بالصواريخ', isCorrect: false, cost: 30000 },
      { id: '2', text: 'الانسحاب من القواعد الأمامية', isCorrect: false, cost: 25000 },
      { id: '3', text: 'تطبيق تشفير ديناميكي للتردد وتفعيل إدارة هويات متقدمة (Zero Trust)', isCorrect: true, cost: 9000 },
      { id: '4', text: 'التشويش الكهرومغناطيسي على كامل النطاق المدني والعسكري', isCorrect: false, cost: 28000 },
      { id: '5', text: 'استيراد أنظمة اتصال جديدة', isCorrect: false, cost: 35000 },
      { id: '6', text: 'تجاهل الهجوم واعتبار البيانات غير مهمة', isCorrect: false, cost: 40000 },
      { id: '7', text: 'توجيه طائرات مسيرة للإلهاء الميداني', isCorrect: false, cost: 15000 },
      { id: '8', text: 'تقوية جدار الحماية باستخدام أنظمة قديمة موثوقة', isCorrect: false, cost: 8000 },
      { id: '9', text: 'إعادة استخدام مفاتيح الجلسة (Session Keys) القديمة كحل سريع', isCorrect: false, cost: 12000 },
      { id: '10', text: 'تفويض مركز القيادة الرئيسي بتولي الاتصالات مباشرة', isCorrect: false, cost: 10000 },
      { id: '11', text: 'إصدار أمر عام بتقليل الاتصالات العسكرية للنصف', isCorrect: false, cost: 5000 },
      { id: '12', text: 'إغلاق كل منافذ الاتصال تماما لمدة طويلة', isCorrect: false, cost: 22000 },
    ]
  }
];
