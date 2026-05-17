import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { cyberTips, Tip } from '../data/tips';
import { ChevronLeft, ChevronRight, LogOut, Lightbulb, Activity, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface FlashcardsViewProps {
  onBack: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CACHE_KEY = "cyber_daily_tips_v1";
const CACHE_DATE_KEY = "cyber_daily_tips_date_v1";

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onBack }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to load the daily tips from AI
  const loadDailyTips = async (forceRefresh = false) => {
    setIsLoading(!forceRefresh);
    if (forceRefresh) setIsRefreshing(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!forceRefresh) {
        const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
        if (cachedDate === today) {
           const cachedTips = localStorage.getItem(CACHE_KEY);
           if (cachedTips) {
              setTips(JSON.parse(cachedTips));
              setIsLoading(false);
              return;
           }
        }
      }

      // Generate prompt for AI
       const prompt = `أنت مهندس وخبير أمن سيبراني محترف. 
قم بتوليد ما بين 10 إلى 20 نصيحة أمنية ومعلومات سيبرانية وتكتيكات متقدمة (مثل تقنيات الاختراق، الدفاع الاستباقي، التشفير المتقدم، والتهديدات الحديثة).
يجب أن تكون هذه المعلومات جديدة ومتنوعة، مكتوبة بلغة عربية فصحى احترافية ومفهومة للطلاب.
يجب إرجاع الرد بصيغة JSON Array حصراً.
كل كائن Object في المصفوفة يحتوي على:
- id: رقم عشوائي فريد
- title: عنوان النصيحة (أقل من 5 كلمات)
- category: مجال النصيحة (مثل: هندسة الشبكات، أمن الويب، أمن تطبيقات الهاتف، الجدار الناري البشري، الذكاء الاصطناعي الأمني، التشفير)
- content: محتوى النصيحة المفصّل (واضح، علمي دقيق، وبناء).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const rawText = response.text || "[]";
      const generatedTips = JSON.parse(rawText) as Tip[];
      
      if (generatedTips.length > 0) {
        setTips(generatedTips);
        setCurrentIndex(0);
        setIsFlipped(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(generatedTips));
        localStorage.setItem(CACHE_DATE_KEY, today);
      } else {
        setTips(cyberTips); // Fallback
      }
    } catch (error) {
      console.error("Failed to generate tips:", error);
      // Fallback to static tips on failure
      setTips(cyberTips);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDailyTips();
  }, []);

  const currentTip = tips[currentIndex] || cyberTips[0];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
    }, 150);
  };

  return (
    <div className="w-full h-full bg-surface-variant flex flex-col font-sans text-on-background relative overflow-hidden">
      
      {/* Background styling */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Header */}
      <header className="flex justify-between items-end p-4 sm:p-8 border-b border-on-background/10 relative z-10 shrink-0">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary mb-2 sm:mb-4 transition-colors">
            <LogOut className="w-3 h-3" /> العودة للمركز
          </button>
          <h1 className="text-3xl sm:text-5xl font-serif italic font-light tracking-tighter leading-none">الرؤى السيبرانية</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] mt-2 opacity-60 font-semibold">رؤى ونصائح متجددة يومياً بالطاقة الاصطناعية</p>
        </div>
        
        {!isLoading && (
           <button 
             onClick={() => loadDailyTips(true)} 
             disabled={isRefreshing}
             className="flex flex-col items-center gap-1 group disabled:opacity-50"
             title="توليد معرفة جديدة"
           >
             <div className="bg-on-background text-white p-2 sm:p-3 group-hover:bg-primary transition-colors rounded-full shadow-[4px_4px_0px_rgba(26,26,26,0.3)]">
               <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
             </div>
             <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold opacity-60 hidden sm:block">تحديث الآن</span>
           </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-6 h-full opacity-60">
            <Activity className="w-16 h-16 animate-spin-slow text-primary" />
            <p className="text-[11px] font-bold tracking-widest uppercase animate-pulse">جاري استخراج وتحليل بيانات استخبارات التهديدات اليومية...</p>
          </div>
        ) : (
          <>
            {/* Flashcard Container */}
            <div className="w-full max-w-2xl aspect-[3/2] sm:aspect-video relative perspective-1000 mb-12">
              
              <div 
                className={`w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                
                {/* Front of Card */}
                <div className="absolute inset-0 backface-hidden bg-background border border-on-background shadow-[-16px_16px_0px_#1A1A1A] flex flex-col items-center justify-center p-8 xs:p-12 text-center group">
                   <span className="absolute top-6 right-6 text-[10px] uppercase tracking-widest font-bold opacity-30 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                     <Lightbulb className="w-4 h-4" /> نصيحة {currentIndex + 1}
                   </span>
                   <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white bg-primary px-3 py-1 mb-6">
                     {currentTip.category}
                   </span>
                   <h2 className="text-3xl sm:text-5xl font-serif leading-tight">
                     {currentTip.title}
                   </h2>
                   <p className="absolute bottom-6 text-[10px] uppercase tracking-widest font-bold text-primary animate-pulse">
                    انقر للإظهار
                   </p>
                </div>

                {/* Back of Card */}
                <div className="absolute inset-0 backface-hidden bg-on-background text-background shadow-[-16px_16px_0px_#B44C32] flex items-center justify-center p-6 sm:p-12 rotate-y-180 text-right overflow-y-auto aspect-[3/2] sm:aspect-video scrollbar-hide">
                  <span className="absolute top-6 right-6 text-[10px] uppercase tracking-widest font-bold opacity-30 text-background">
                     التعريف والمفهوم
                   </span>
                   <p className="text-base sm:text-xl lg:text-2xl font-serif italic leading-relaxed text-center opacity-90 max-w-xl my-auto">
                     "{currentTip.content}"
                   </p>
                </div>

              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8" dir="ltr">
              <button 
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center border border-on-background bg-white hover:bg-on-background hover:text-background transition-colors shadow-[-4px_4px_0px_rgba(26,26,26,0.2)] active:shadow-none active:translate-y-1 active:-translate-x-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-[10px] uppercase tracking-widest font-bold tabular-nums">
                {currentIndex + 1} / {tips.length}
              </span>
              
              <button 
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center border border-on-background bg-white hover:bg-on-background hover:text-background transition-colors shadow-[-4px_4px_0px_rgba(26,26,26,0.2)] active:shadow-none active:translate-y-1 active:-translate-x-1"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
  };
