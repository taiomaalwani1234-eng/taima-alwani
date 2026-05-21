import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { getAssessmentQuestions, evaluateLevel, AssessmentQuestion } from '../data/assessment';
import { LogOut, Terminal, CheckCircle2, ChevronDown, Activity, Sparkles, Map as MapIcon, Bot, Route } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateText, generateJSON } from '../services/aiClient';

interface MindMapNode {
  title: string;
  children?: MindMapNode[];
}

const TreeBranch: React.FC<{ node: MindMapNode; depth?: number }> = ({ node, depth = 0 }) => {
  const isLeaf = !node.children || node.children.length === 0;
  
  return (
    <div className="flex items-center gap-6" dir="rtl">
      
      {/* Node Box */}
      <div className={`
        relative shrink-0 flex items-center justify-center text-center max-w-[200px]
        ${depth === 0 ? 'bg-primary text-white p-4 text-lg font-serif font-bold shadow-[4px_4px_0px_rgba(26,26,26,1)] z-10 min-w-[150px]' : 
          depth === 1 ? 'bg-surface-container border-2 border-primary text-[#29396f] p-3 text-sm font-bold z-10' : 
          'bg-on-background border border-white/20 text-[#738cc7] p-2 text-xs z-10'}
      `}>
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

interface AssessmentViewProps {
  onBack: () => void;
  studentName: string;
  onUpdateLevel?: (level: string) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onBack, studentName, onUpdateLevel }) => {
  const [questions] = useState<AssessmentQuestion[]>(() => getAssessmentQuestions(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(10).fill(''));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [aiMindMap, setAiMindMap] = useState<MindMapNode | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // New state for AI hints
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintPassword, setHintPassword] = useState('');
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [hintError, setHintError] = useState('');

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    setCurrentHint(null);
    setShowHintModal(false);
    setHintPassword('');
    setHintError('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
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
        correct => correct.toLowerCase().trim() === ans.toLowerCase().trim()
      );
      if (isCorrect) finalScore++;
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  const generateAIPlan = async (evaluationLevel: string) => {
    setIsLoadingPlan(true);
    try {
      const prompt = `أنت مرشد أكاديمي خبير ومستشار في الأمن السيبراني. 
اسم الطالب: ${studentName || 'المتدرب'}
درجة تقييم تحديد المستوى: ${score} من 10.
المستوى الذي تم تحديده: ${evaluationLevel}

المطلوب إرجاع البيانات بصيغة JSON فقط بهذا الهيكل:
{
  "planMarkdown": "ناقش هنا التقييم، الأهداف، الخطة العملية والنصيحة الذهبية بتنسيق Markdown متكامل.",
  "mindMap": {
    "title": "مستواك المتوقع",
    "children": [
      {
        "title": "نقاط القوة",
        "children": [{"title": "..."}, {"title": "..."}]
      },
      {
        "title": "نقاط التطوير",
        "children": [{"title": "..."}, {"title": "..."}]
      },
      {
        "title": "الأهداف الأساسية",
        "children": [{"title": "..."}, {"title": "..."}]
      }
    ]
  }
}

تأكد من أن النص بالعربية الفصحى. استخدم تنسيق JSON صحيح.`;

      const responseText = await generateJSON(prompt);

      if (responseText) {
        const parsed = JSON.parse(responseText);
        setAiPlan(parsed.planMarkdown || 'تم إنشاء الخطة.');
        setAiMindMap(parsed.mindMap || null);
      } else {
        setAiPlan('عذراً، لم أتمكن من توليد الخطة في الوقت الحالي.');
      }
    } catch (error) {
      console.error('Failed to generate AI plan:', error);
      setAiPlan('حدث خطأ أثناء محاولة الاتصال بنظام الإرشاد الذكي. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleHintRequest = async () => {
    setHintError('');
    if (hintPassword !== 'admin') {
      setHintError('كلمة سر المدير غير صحيحة.');
      return;
    }

    setIsLoadingHint(true);
    try {
      const prompt = `أنت مساعد ذكي للمتدربين في مجال الأمن السيبراني.
المتدرب يواجه صعوبة في السؤال التالي:
"${currentQ.question}"

المطلوب: قدم تلميحاً ذكياً وموجزاً (في سطرين أو ثلاثة كحد أقصى) يساعد المتدرب على الوصول للإجابة دون إعطائه الإجابة بشكل مباشر.
يجب أن يكون التلميح باللغة العربية.`;

      const hint = await generateText(prompt);
      setCurrentHint(hint || 'لم أتمكن من استخراج تلميح في الوقت الحالي.');
      setShowHintModal(false); // Hide modal, show hint in the UI
    } catch (error) {
       console.error('Failed to get hint:', error);
       setHintError('فشل الاتصال بالذكاء الاصطناعي.');
    } finally {
       setIsLoadingHint(false);
    }
  };

  
  if (isFinished) {
    const evaluation = evaluateLevel(score);
    return (
      <div className="w-full h-full bg-background text-on-surface font-body-main selection:bg-primary/30 overflow-y-auto">
      
        

        <main className="max-w-[1440px] mx-auto px-6 py-10" dir="rtl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 text-primary drop-shadow-[0_0_8px_rgba(95,251,214,0.4)]">الخطة الدراسية الذكية</h1>
            <p className="text-on-surface-variant font-body-main opacity-80">تحليل الأداء بناءً على تقييم تحديد المستوى.</p>
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
                    <span className="font-label-caps text-[10px] text-primary block mb-1 tracking-widest uppercase">SYSTEM_SENTINEL_AI</span>
                    <h2 className="text-xl font-bold text-white">المرشد الذكي</h2>
                  </div>
                </div>
                <p className="text-sm mb-6 leading-relaxed text-on-surface-variant">
                  {evaluation.description}
                  <br /><br />
                  مستواك الحالي: <span className="text-primary font-bold text-lg">{evaluation.level}</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-label-caps text-[10px] mb-2 uppercase">
                      <span>النتيجة الإجمالية</span>
                      <span className="text-primary">{score * 10}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${score * 10}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-caps text-[10px] mb-2 uppercase">
                      <span>نسبة الخطأ</span>
                      <span className="text-error">{(10 - score) * 10}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-error transition-all duration-1000" style={{ width: `${(10 - score) * 10}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel bg-surface-container-low/80 p-4 rounded-xl border-r-4 border-r-primary shadow-lg">
                  <span className="font-label-caps text-on-surface-variant text-[10px]">دقة الإجابات</span>
                  <div className="text-2xl font-bold text-primary mt-1">{score * 10}%</div>
                </div>
                <div className="glass-panel bg-surface-container-low/80 p-4 rounded-xl border-r-4 border-r-secondary shadow-lg">
                  <span className="font-label-caps text-on-surface-variant text-[10px]">الأسئلة المجابة</span>
                  <div className="text-2xl font-bold text-secondary mt-1">10/10</div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Plan & Timeline */}
            <div className="lg:col-span-8">
              <div className="glass-panel bg-surface-container-low/80 p-8 rounded-xl min-h-[600px] border border-outline-variant/20 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Route className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-[#473f92]">مسار التعلم الموصى به</h3>
                  </div>
                </div>
                
                {!aiPlan && !isLoadingPlan && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                     <Bot className="w-16 h-16 text-primary opacity-50 mb-4" />
                     <p className="text-on-surface-variant mb-6 max-w-md">اضغط على الزر أدناه ليقوم المرشد الذكي بصياغة مسار تعليمي مخصص بناءً على نقاط الضعف والقوة التي ظهرت في تقييمك.</p>
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
                    <p className="font-bold tracking-widest text-primary animate-pulse text-sm">جاري التخطيط واستخراج المسار...</p>
                  </div>
                )}

                {aiPlan && (
                  <div className="relative pt-4 border-t border-outline-variant/20 mt-4">
                    <div className="markdown-body text-right prose prose-invert prose-p:text-on-surface-variant prose-headings:text-primary prose-strong:text-secondary prose-li:text-on-surface-variant max-w-none">
                      {aiMindMap && (
                      <div className="mb-10 w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-surface/50 border border-outline-variant/20 rounded-xl" dir="ltr">
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

          <div className="mt-12 flex justify-center gap-4 border-t border-background/20 pt-8">
            <button
              onClick={() => onUpdateLevel?.(evaluation.level)}
              className="px-8 py-4 bg-primary text-white font-bold tracking-widest hover:bg-white hover:text-primary transition-colors hover:-translate-y-1"
            >
              الانتقال إلى الألعاب بالمركز التدريبي
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-transparent border-2 border-primary text-primary font-bold tracking-widest hover:bg-primary/10 transition-colors uppercase"
            >
              العودة للوراء
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-on-background text-background flex flex-col font-sans">
      <header className="flex justify-between items-center p-8 border-b border-background/10 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary transition-colors">
          <LogOut className="w-3 h-3" /> إحباط الاختبار
        </button>
        <div className="text-[10px] uppercase tracking-widest font-bold">
          السؤال <span className="text-primary text-sm mx-1">{currentIndex + 1}</span> / 10
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
        <div className="w-full max-w-3xl">
          
          <div className="mb-12 text-right relative">
            <span className="inline-block border border-primary text-primary px-3 py-1 text-[9px] uppercase tracking-widest font-bold mb-6">
              {currentQ.type === 'mcq' ? 'سؤال نظري' : 'تطبيق عملي'}
            </span>
            <div className="flex justify-between items-start gap-4">
               {!currentHint && !isLoadingHint && (
                 <button 
                   onClick={() => setShowHintModal(true)}
                   className="shrink-0 flex items-center gap-2 bg-on-background border border-primary/30 text-primary px-3 py-1.5 hover:bg-primary hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase mb-4"
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
                 <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">جاري الاتصال بالمرشد الذكي...</span>
               </div>
            )}

            {currentHint && (
              <div className="mt-6 p-4 border border-primary/30 bg-primary/5 text-background/80 text-sm font-sans leading-relaxed text-right relative">
                 <Sparkles className="w-4 h-4 text-primary absolute top-4 left-4" />
                 <p className="font-bold text-primary mb-1 text-[10px] uppercase tracking-widest">تلميح المرشد الذكي:</p>
                 <Markdown>{currentHint}</Markdown>
              </div>
            )}
            
            {showHintModal && (
               <div className="mt-4 p-4 border border-on-background bg-surface-container absolute top-12 left-0 w-64 z-20 shadow-2xl shadow-black/50 text-right">
                 <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-3">هذا التلميح مخصص للمدراء فقط</p>
                 <input 
                   type="password" 
                   value={hintPassword}
                   onChange={e => setHintPassword(e.target.value)}
                   placeholder="أدخل كلمة سر المدير"
                   className="w-full bg-black border border-background/20 text-white p-2 text-sm mb-3 focus:outline-none focus:border-primary"
                   onKeyDown={e => e.key === 'Enter' && handleHintRequest()}
                   autoFocus
                 />
                 {hintError && <p className="text-red-500 text-xs mb-3">{hintError}</p>}
                 <div className="flex justify-end gap-2">
                   <button 
                     onClick={() => { setShowHintModal(false); setHintError(''); setHintPassword(''); }}
                     className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors"
                   >
                     إلغاء
                   </button>
                   <button 
                     onClick={handleHintRequest}
                     className="px-3 py-1.5 bg-primary text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors"
                   >
                     تأكيد
                   </button>
                 </div>
               </div>
            )}
          </div>

          <div>
            {currentQ.type === 'mcq' && currentQ.options ? (
              <div className="flex flex-col gap-4" dir="rtl">
                {currentQ.options.map((opt, i) => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(opt)}
                      className={`text-right w-full p-5 border transition-colors flex items-center justify-between gap-4 ${isSelected ? 'border-primary bg-primary/10 text-white' : 'border-background/20 text-background/70 hover:border-background/50 hover:text-background'}`}
                    >
                      <span className="text-lg font-sans leading-relaxed">{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="bg-black border border-background/20 p-4 font-mono text-left" dir="ltr">
                <div className="flex items-center gap-3 text-primary mb-2 text-sm opacity-50">
                  <Terminal className="w-4 h-4" /> root@secure-city:~#
                </div>
                <input 
                  type="text"
                  autoFocus
                  value={userAnswers[currentIndex]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type command here..."
                  className="w-full bg-transparent text-green-400 focus:outline-none text-xl placeholder-green-900/50"
                  onKeyDown={(e) => e.key === 'Enter' && userAnswers[currentIndex].trim() && handleNext()}
                />
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="p-8 border-t border-background/10 flex justify-start shrink-0" dir="ltr">
        <button
          onClick={handleNext}
          disabled={!userAnswers[currentIndex].trim()}
          className="bg-primary text-white px-8 py-4 font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:text-on-background transition-colors disabled:opacity-30 disabled:hover:bg-primary disabled:hover:text-white cursor-pointer disabled:cursor-not-allowed ml-auto"
        >
          {currentIndex === questions.length - 1 ? 'تقديم التقييم' : 'السؤال التالي'}
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

