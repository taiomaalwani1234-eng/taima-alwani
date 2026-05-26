import React, { useState, useEffect } from "react";
import { GlobalHeader } from "./GlobalHeader";
import {
  getAssessmentQuestions,
  evaluateLevel,
  AssessmentQuestion,
} from "../data/assessment";
import {
  LogOut,
  Terminal,
  CheckCircle2,
  ChevronDown,
  Activity,
  Sparkles,
  Map as MapIcon,
  Bot,
  Route,
  Gamepad2,
  RefreshCcw,
} from "lucide-react";
import Markdown from "react-markdown";
import { generateText, generateJSON } from "../services/aiClient";

interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

const TreeBranch: React.FC<{ node: MindMapNode; depth?: number }> = ({
  node,
  depth = 0,
}) => {
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div className="flex items-center gap-6" dir="rtl">
      {/* Node Box */}
      <div
        className={`
        relative shrink-0 flex items-center justify-center text-center max-w-[200px] rounded-lg
        ${
          depth === 0
            ? "bg-primary text-white p-4 text-lg font-serif font-bold shadow-[4px_4px_0px_rgba(26,26,26,1)] z-10 min-w-[150px]"
            : depth === 1
              ? "bg-surface-container border-2 border-primary text-on-surface p-3 text-sm font-bold z-10"
              : "bg-surface-container-high border border-outline/25 text-on-surface-variant p-2 text-xs z-10 font-medium"
        }
      `}
      >
        {node.title}
      </div>

      {/* Children */}
      {!isLeaf && (
        <div className="relative flex flex-col justify-center py-2 min-h-[40px]">
          {/* Horizontal Line connecting parent to spine */}
          <div className="absolute top-1/2 bottom-1/2 right-0 w-[24px] h-[2px] bg-primary/40" />

          <div className="relative border-r-2 border-primary/40 pr-6 py-4 flex flex-col gap-6 ml-6 mr-[24px]">
            {node.children!.map((child, i) => (
              <div key={i} className="relative">
                {/* Horizontal Line connecting spine to child */}
                <div className="absolute top-1/2 right-[-24px] w-[24px] h-[2px] bg-primary/40 -translate-y-1/2" />
                <TreeBranch node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LevelHistogram: React.FC<{ score: number; totalQuestions: number }> = ({ score, totalQuestions }) => {
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
    <div className="w-full p-6 rounded-2xl bg-surface-container-low border border-outline/20 shadow-inner">
      <h3 className="text-on-background font-bold text-lg mb-6 text-center flex items-center justify-center gap-2">
        📊 <span>توزيع المستوى المتوقع</span>
      </h3>
      <div className="flex items-end justify-around gap-3 pt-6" style={{ height: '200px' }}>
        {levels.map((level) => {
          const isActive = level.name === currentLevel.name;
          const midpoint = (level.min + level.max) / 2;
          const distance = Math.abs(percentage - midpoint);
          const barHeight = Math.max(15, 100 - distance);
          
          return (
            <div key={level.name} className="flex flex-col items-center gap-2 flex-1 group">
              <span className={`text-xs font-bold transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-0 group-hover:opacity-100'}`} style={{ color: level.color }}>
                {isActive ? `${percentage.toFixed(0)}%` : `${midpoint}%`}
              </span>
              <div 
                className={`w-full rounded-t-xl transition-all duration-700 relative ${isActive ? 'animate-pulse' : 'hover:opacity-60 cursor-pointer'}`}
                style={{ 
                  height: `${barHeight}%`,
                  backgroundColor: level.color,
                  opacity: isActive ? 1 : 0.25,
                  boxShadow: isActive ? `0 0 25px ${level.color}80` : 'none',
                }}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-md animate-ping" />
                )}
              </div>
              <span className="text-sm text-center">
                {level.icon}
              </span>
              <span className={`text-[11px] text-center transition-colors duration-300 ${isActive ? 'text-primary font-bold animate-pulse' : 'text-on-surface-variant font-medium'}`}>
                {level.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { TutorialOverlay } from "./TutorialOverlay";

interface AssessmentViewProps {
  onBack: () => void;
  studentName: string;
  onUpdateLevel?: (level: string) => void;
  isTutorial?: boolean;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onBack,
  studentName,
  onUpdateLevel,
  isTutorial = false,
}) => {
  const [showTutorial, setShowTutorial] = useState(isTutorial);
  const [questions] = useState<AssessmentQuestion[]>(() =>
    getAssessmentQuestions(10),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(10).fill(""));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [aiMindMap, setAiMindMap] = useState<MindMapNode | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // New state for AI hints
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintPassword, setHintPassword] = useState("");
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hintError, setHintError] = useState("");

  const currentQ = questions[currentIndex];

  const handlePrevious = () => {
    setCurrentHint(null);
    setShowHintModal(false);
    setHintPassword("");
    setHintError("");
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    setCurrentHint(null);
    setShowHintModal(false);
    setHintPassword("");
    setHintError("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishAssessment();
    }
  };

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const finishAssessment = () => {
    let finalScore = 0;
    userAnswers.forEach((ans, idx) => {
      const q = questions[idx];
      const isCorrect = q.correctAnswers.some(
        (correct) => correct.toLowerCase().trim() === ans.toLowerCase().trim(),
      );
      if (isCorrect) finalScore++;
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  const generateAIPlan = async (evaluationLevel: string) => {
    setIsLoadingPlan(true);
    try {
      const prompt = `أنت مستشار تعليمي ومرشد أكاديمي خبير في الأمن السيبراني. 
الطالب "${studentName || "المتدرب"}" حصل على ${score}/10 في اختبار تحديد المستوى.
المستوى المقيّم والمحدد له: ${evaluationLevel}

## الألعاب والموارد التعليمية المتاحة في المنصة:
1. **الدورات التعليمية**: دورات نظرية في أساسيات الأمن السيبراني.
2. **الرؤى السيبرانية**: بطاقات معرفية سريعة عن مفاهيم الأمان.
3. **تشفير الأوامر**: ألغاز تشفير وأوامر Linux عملية.
4. **المليونير السيبراني**: مسابقة معرفية شاملة بأسلوب من سيربح المليون.
5. **محاكاة المدينة الآمنة (Secure City)**: محاكاة هجمات ودفاع على بنية تحتية حرجة (3 مستويات).
6. **اختراق الخادم (SSH)**: محاكاة اختراق خادم عملي عبر منفذ SSH.

## المطلوب:
بناءً على مستوى الطالب المقيّم "${evaluationLevel}"، أنشئ خطة دراسية مرحلية متكاملة تربطه بالألعاب والموارد أعلاه:
- **إذا كان مبتدئ/متدرب**: يبدأ بالدورات التعليمية والرؤى السيبرانية كخطوة أولى، ثم ينتقل لتشفير الأوامر والمليونير كخطوة ثانية.
- **إذا كان متوسط**: يراجع الرؤى السيبرانية سريعاً ثم ينتقل مباشرة لتشفير الأوامر ولعبة المليونير السيبراني ومستويات المدينة الآمنة الأولى.
- **إذا كان متقدم/خبير**: يبدأ مباشرة بالمليونير، ثم يدخل لمحاكاة المدينة الآمنة المتقدمة وتجربة اختراق الخادم التفاعلية (SSH).

كل مرحلة يجب أن تحتوي على:
- اسم اللعبة/المورد المطلوب.
- الهدف التعليمي من المرحلة.
- معيار الانتقال والنجاح للمرحلة التالية.

المطلوب إرجاع البيانات بصيغة JSON فقط بهذا الهيكل الدقيق (باللغة العربية الفصحى):
{
  "planMarkdown": "اكتب الخطة الدراسية هنا بصيغة Markdown متكاملة وجميلة مع عناوين ورموز تعبيرية ملائمة وجداول إن أمكن.",
  "mindMap": {
    "title": "مستواك المتوقع: ${evaluationLevel}",
    "children": [
      {
        "title": "نقاط القوة",
        "children": [{"title": "قوة 1"}, {"title": "قوة 2"}]
      },
      {
        "title": "مجالات التطوير",
        "children": [{"title": "تطوير 1"}, {"title": "تطوير 2"}]
      },
      {
        "title": "المرحلة 1: التأسيس",
        "children": [{"title": "المورد: [اسم اللعبة/الدورة]"}, {"title": "الهدف: [الهدف]"}]
      },
      {
        "title": "المرحلة 2: التطبيق",
        "children": [{"title": "المورد: [اسم اللعبة]"}, {"title": "الهدف: [الهدف]"}]
      },
      {
        "title": "المرحلة 3: الاحتراف",
        "children": [{"title": "المورد: [اسم اللعبة]"}, {"title": "الهدف: [الهدف]"}]
      }
    ]
  }
}

تأكد من أن النص بالعربية الفصحى، ولا تضف أي نص خارج كود الـ JSON. استخدم تنسيق JSON صحيح وخالٍ من الأخطاء.`;

      const response = await generateJSON(prompt);

      const parsed = JSON.parse(response);
      setAiPlan(parsed.planMarkdown || "تم إنشاء الخطة.");
      setAiMindMap(parsed.mindMap || null);
    } catch (error) {
      console.error("Failed to generate AI plan:", error);
      setAiPlan(
        "حدث خطأ أثناء محاولة الاتصال بنظام الإرشاد الذكي. يرجى المحاولة لاحقاً.",
      );
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleHintRequest = async () => {
    setHintError("");
    if (hintPassword !== "admin") {
      setHintError("كلمة سر المدير غير صحيحة.");
      return;
    }

    setIsLoadingHint(true);
    try {
      const prompt = `أنت مساعد ذكي للمتدربين في مجال الأمن السيبراني.
المتدرب يواجه صعوبة في السؤال التالي:
"${currentQ.question}"

المطلوب: قدم تلميحاً ذكياً وموجزاً (في سطرين أو ثلاثة كحد أقصى) يساعد المتدرب على الوصول للإجابة دون إعطائه الإجابة بشكل مباشر.
يجب أن يكون التلميح باللغة العربية.`;

      const response = await generateText(prompt);
      setCurrentHint(response || "لم أتمكن من استخراج تلميح في الوقت الحالي.");
      setShowHintModal(false); // Hide modal, show hint in the UI
    } catch (error) {
      console.error("Failed to get hint:", error);
      setHintError("فشل الاتصال بالذكاء الاصطناعي.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  useEffect(() => {
    if (isFinished && !aiPlan && !isLoadingPlan) {
      generateAIPlan(evaluateLevel(score).level);
    }
  }, [isFinished, score]);

  if (isFinished) {
    const evaluation = evaluateLevel(score);
    return (
      <div className="w-full h-full bg-background text-on-surface font-body-main selection:bg-primary/30 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto px-6 py-10" dir="rtl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 text-primary drop-shadow-[0_0_8px_rgba(95,251,214,0.4)]">
              الخطة الدراسية الذكية
            </h1>
            <p className="text-on-surface-variant font-body-main opacity-80">
              تحليل الأداء بناءً على تقييم تحديد المستوى.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Mentor & Assessment Summary */}
            <div className="lg:col-span-4 space-y-8">
              {/* AI Mentor Card */}
              <div className="glass-panel bg-surface-container-low/80 p-6 rounded-xl border border-primary/20 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-full h-1 bg-primary"></div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/30 shadow-[0_0_10px_rgba(95,251,214,0.1)]">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span className="font-label-caps text-[10px] text-primary block mb-1 tracking-widest uppercase">
                      SYSTEM_SENTINEL_AI
                    </span>
                    <h2 className="text-xl font-bold text-on-surface">
                      المرشد الذكي
                    </h2>
                  </div>
                </div>
                <p className="text-sm mb-6 leading-relaxed text-on-surface-variant">
                  {evaluation.description}
                  <br />
                  <br />
                  مستواك الحالي:{" "}
                  <span className="text-primary font-bold text-lg">
                    {evaluation.level}
                  </span>
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-label-caps text-[10px] mb-2 uppercase">
                      <span>النتيجة الإجمالية</span>
                      <span className="text-primary">{score * 10}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-caps text-[10px] mb-2 uppercase">
                      <span>نسبة الخطأ</span>
                      <span className="text-error">{(10 - score) * 10}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div
                        className="h-full bg-error transition-all duration-1000"
                        style={{ width: `${(10 - score) * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Histogram */}
              <LevelHistogram score={score} totalQuestions={questions.length} />

              {/* Stats Bento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel bg-surface-container-low/80 p-4 rounded-xl border-r-4 border-r-primary shadow-lg">
                  <span className="font-label-caps text-on-surface-variant text-[10px]">
                    دقة الإجابات
                  </span>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {score * 10}%
                  </div>
                </div>
                <div className="glass-panel bg-surface-container-low/80 p-4 rounded-xl border-r-4 border-r-primary shadow-lg">
                  <span className="text-on-surface text-xs font-medium">
                    الأسئلة المجابة
                  </span>
                  <div className="text-2xl font-bold text-primary mt-1">
                    10/10
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Plan & Timeline */}
            <div className="lg:col-span-8">
              <div className="glass-panel bg-surface-container-low/80 p-8 rounded-xl min-h-[600px] border border-outline-variant/20 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Route className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-primary">
                      مسار التعلم الموصى به
                    </h3>
                  </div>
                </div>

                {!aiPlan && !isLoadingPlan && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Bot className="w-16 h-16 text-primary opacity-50 mb-4" />
                    <p className="text-on-surface-variant mb-6 max-w-md">
                      اضغط على الزر أدناه ليقوم المرشد الذكي بصياغة مسار تعليمي
                      مخصص بناءً على نقاط الضعف والقوة التي ظهرت في تقييمك.
                    </p>
                    <button
                      onClick={() => generateAIPlan(evaluation.level)}
                      className="bg-primary text-on-primary px-6 py-3 font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(95,251,214,0.3)]"
                    >
                      <Sparkles className="w-5 h-5" />
                      صياغة المسار باستخدام الذكاء الاصطناعي
                    </button>
                  </div>
                )}

                {isLoadingPlan && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Activity className="w-12 h-12 text-primary animate-spin-slow mb-4" />
                    <p className="font-bold tracking-widest text-primary animate-pulse text-sm">
                      جاري التخطيط واستخراج المسار...
                    </p>
                  </div>
                )}

                {aiPlan && (
                  <div className="relative pt-4 border-t border-outline-variant/20 mt-4">
                    <div className="markdown-body text-right prose prose-invert prose-p:text-on-surface-variant prose-headings:text-primary prose-strong:text-secondary prose-li:text-on-surface-variant max-w-none">
                      {aiMindMap && (
                        <div
                          className="mb-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-surface/50 border border-outline-variant/20 rounded-xl"
                          dir="ltr"
                        >
                          <div className="min-w-max px-8 py-12 flex justify-end">
                            <TreeBranch node={aiMindMap} />
                          </div>
                        </div>
                      )}
                      <Markdown>{aiPlan}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-4 border-t border-outline/20 pt-8 pb-12">
            {/* زر 1: الانتقال للألعاب (يحدّث المستوى ويعود) */}
            <button 
              onClick={() => onUpdateLevel?.(evaluation.level)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold 
                         hover:bg-primary/80 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5" />
              الانتقال إلى الألعاب بالمركز التدريبي
            </button>

            {/* زر 2: إعادة الاختبار */}
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setIsFinished(false);
                setUserAnswers(Array(10).fill(""));
                setAiPlan(null);
                setAiMindMap(null);
                setCurrentHint(null);
                setShowHintModal(false);
                setHintPassword("");
                setHintError("");
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-outline 
                         text-on-surface hover:bg-surface-variant transition-all cursor-pointer"
            >
              <RefreshCcw className="w-5 h-5" />
              إعادة الاختبار
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background text-on-background flex flex-col font-sans relative">
      {showTutorial && (
        <TutorialOverlay
          message="قم بالإجابة عن هذا التقييم لتحديد مستواك في الأمن السيبراني. بناءً على نتيجتك، سيقوم المرشد الذكي ببناء خطة دراسية مخصصة لك."
          onDismiss={() => setShowTutorial(false)}
        />
      )}
      <header className="flex justify-between items-center p-8 border-b border-outline/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface bg-surface border border-outline shadow-sm hover:bg-surface-variant hover:text-primary hover:border-primary/50 transition-all rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <LogOut className="w-3 h-3" /> إحباط الاختبار
        </button>
        <div className="text-[10px] uppercase tracking-widest font-bold">
          السؤال{" "}
          <span className="text-primary text-sm mx-1">{currentIndex + 1}</span>{" "}
          / 10
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="mb-12 text-right relative">
            <span className="inline-block border border-primary text-primary px-3 py-1 text-[9px] uppercase tracking-widest font-bold mb-6">
              {currentQ.type === "mcq" ? "سؤال نظري" : "تطبيق عملي"}
            </span>
            <div className="flex justify-between items-start gap-4">
              {!currentHint && !isLoadingHint && (
                <button
                  onClick={() => setShowHintModal(true)}
                  className="shrink-0 flex items-center gap-2 bg-transparent border border-primary/30 text-primary px-3 py-1.5 hover:bg-primary hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase mb-4 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  تلميح ذكي
                </button>
              )}
              <h2 className="text-3xl sm:text-4xl font-serif font-light leading-snug flex-1">
                {currentQ.question}
              </h2>
            </div>

            {isLoadingHint && (
              <div className="flex items-center gap-2 text-primary mt-4 opacity-70">
                <Activity className="w-4 h-4 animate-spin-slow" />
                <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">
                  جاري الاتصال بالمرشد الذكي...
                </span>
              </div>
            )}

            {currentHint && (
              <div className="mt-6 p-4 border border-primary/30 bg-primary/5 text-on-surface-variant text-sm font-sans leading-relaxed text-right relative rounded-lg">
                <Sparkles className="w-4 h-4 text-primary absolute top-4 left-4" />
                <p className="font-bold text-primary mb-1 text-[10px] uppercase tracking-widest">
                  تلميح المرشد الذكي:
                </p>
                <Markdown>{currentHint}</Markdown>
              </div>
            )}

            {showHintModal && (
              <div className="mt-4 p-4 border border-outline bg-surface-container absolute top-12 left-0 w-64 z-20 shadow-2xl shadow-black/50 text-right rounded-lg">
                <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-3">
                  هذا التلميح مخصص للمدراء فقط
                </p>
                <input
                  type="password"
                  value={hintPassword}
                  onChange={(e) => setHintPassword(e.target.value)}
                  placeholder="أدخل كلمة سر المدير"
                  className="w-full bg-black border border-outline/25 text-white p-2 text-sm mb-3 focus:outline-none focus:border-primary rounded"
                  onKeyDown={(e) => e.key === "Enter" && handleHintRequest()}
                  autoFocus
                />
                {hintError && (
                  <p className="text-red-500 text-xs mb-3">{hintError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowHintModal(false);
                      setHintError("");
                      setHintPassword("");
                    }}
                    className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleHintRequest}
                    className="px-3 py-1.5 bg-primary text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors cursor-pointer rounded"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            {currentQ.type === "mcq" && currentQ.options ? (
              <div className="flex flex-col gap-4" dir="rtl">
                {currentQ.options.map((opt, i) => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(opt)}
                      className={`text-right w-full p-5 border transition-colors flex items-center justify-between gap-4 cursor-pointer rounded-lg ${isSelected ? "border-primary bg-primary/10 text-on-surface font-semibold" : "border-outline/20 text-on-surface-variant hover:border-primary/50 hover:text-on-surface"}`}
                    >
                      <span className="text-lg font-sans leading-relaxed">
                        {opt}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className="bg-black border border-outline/25 p-4 font-mono text-left rounded-lg"
                dir="ltr"
              >
                <div className="flex items-center gap-3 text-primary mb-2 text-sm opacity-50">
                  <Terminal className="w-4 h-4" /> root@secure-city:~#
                </div>
                <input
                  type="text"
                  autoFocus
                  value={userAnswers[currentIndex]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type command here..."
                  className="w-full bg-transparent text-green-400 focus:outline-none text-xl placeholder-green-500/30"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    userAnswers[currentIndex].trim() &&
                    handleNext()
                  }
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer
        className="p-8 border-t border-outline/10 flex justify-between items-center shrink-0 w-full"
        dir="rtl"
      >
        {currentIndex > 0 ? (
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface bg-surface border border-outline shadow-sm hover:bg-surface-variant hover:text-primary hover:border-primary/50 transition-all rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            السؤال السابق
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={handleNext}
          disabled={!userAnswers[currentIndex].trim()}
          className="bg-primary text-white px-8 py-4 font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-primary/80 transition-all disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed rounded-lg shadow-md"
        >
          {currentIndex === questions.length - 1
            ? "تقديم التقييم"
            : "السؤال التالي"}
        </button>
      </footer>

      <style>{`
        .markdown-body ul {
          list-style-type: disc;
          padding-right: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-body ol {
          list-style-type: decimal;
          padding-right: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-body blockquote {
          border-right: 4px solid #B44C32;
          padding-right: 1rem;
          opacity: 0.8;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
