export interface GameProgress {
  assessment: boolean;    // تحديد المستوى
  crypto: boolean;        // تشفير الأوامر  
  millionaire: boolean;   // المليونير السيبراني
  city_level1: boolean;   // المدينة - القطاع الأساسي
  city_level2: boolean;   // المدينة - البنية التحتية
  city_level3: boolean;   // المدينة - الحالة الحرجة
  ssh: boolean;           // اختراق الخادم
}

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

export const CITY_LEVEL_RULES = {
  1: { requires: [] },                              // القطاع الأساسي — يفتح مع المدينة
  2: { requires: ['city_level1'] },                  // البنية التحتية
  3: { requires: ['city_level1', 'city_level2'] },   // الحالة الحرجة
};

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
