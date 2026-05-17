import React, { useState, useEffect } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { getRandomMillionaireQuestions, prizeTree, Question } from '../data/questions';
import { askFriendForHelp } from '../services/geminiQuizService';
import { Users, Phone, HelpCircle, Check, X, LogOut, Loader2, Lock } from 'lucide-react';

interface MillionaireViewProps {
  onBack: () => void;
  studentName: string;
}

export const MillionaireView: React.FC<MillionaireViewProps> = ({ onBack, studentName }) => {
  const [questions] = useState<Question[]>(() => getRandomMillionaireQuestions(15));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [money, setMoney] = useState(0);
  const [lockedCheckpoint, setLockedCheckpoint] = useState(-1);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | 'walk' | null>(null);
  
  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedFriend, setUsedFriend] = useState(false);
  
  // Lifeline Effects
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [audienceVotes, setAudienceVotes] = useState<number[] | null>(null);
  const [friendAdvice, setFriendAdvice] = useState<string | null>(null);
  const [isCallingFriend, setIsCallingFriend] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (showResult || hiddenOptions.includes(idx)) return;
    
    setSelectedOption(idx);
    setShowResult(true);

    setTimeout(() => {
      if (idx === currentQ.correctAnswer) {
        // Correct
        const newMoney = prizeTree[currentQuestionIndex];
        setMoney(newMoney);
        
        if (currentQuestionIndex === prizeTree.length - 1) {
          setGameOver('win');
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          resetTurn();
        }
      } else {
        // Wrong
        setGameOver('lose');
        // Drop to checkpoint or 0
        if (lockedCheckpoint !== -1 && currentQuestionIndex > lockedCheckpoint) {
          setMoney(prizeTree[lockedCheckpoint]);
        } else {
          setMoney(0);
        }
      }
    }, 2500);
  };

  const resetTurn = () => {
    setSelectedOption(null);
    setShowResult(false);
    setHiddenOptions([]);
    setAudienceVotes(null);
    setFriendAdvice(null);
  };

  const handle5050 = () => {
    if (used5050 || hiddenOptions.length > 0) return;
    setUsed5050(true);
    
    const incorrectOptions = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswer);
    // Shuffle and pick 2 to hide
    const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
    setHiddenOptions([shuffled[0], shuffled[1]]);
  };

  const handleAudience = () => {
    if (usedAudience || audienceVotes) return;
    setUsedAudience(true);
    
    // Generate fake votes. Correct answer gets highest probability.
    const votes = [0, 0, 0, 0];
    let remaining = 100;
    
    // Correct answer gets between 40% and 80% usually
    const correctVote = Math.floor(Math.random() * 40) + 40; 
    votes[currentQ.correctAnswer] = correctVote;
    remaining -= correctVote;
    
    // Distribute rest
    const others = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswer);
    others.forEach((idx, i) => {
      if (i === 2) {
        votes[idx] = remaining; // give the rest
      } else {
        const v = Math.floor(Math.random() * remaining);
        votes[idx] = v;
        remaining -= v;
      }
    });
    
    setAudienceVotes(votes);
  };

  const handleFriend = async () => {
    if (usedFriend || friendAdvice) return;
    setUsedFriend(true);
    setIsCallingFriend(true);
    
    const advice = await askFriendForHelp(currentQ.question, currentQ.options);
    setFriendAdvice(advice);
    setIsCallingFriend(false);
  };

  const handleCheckpoint = () => {
    if (lockedCheckpoint === -1 && currentQuestionIndex > 0) {
      setLockedCheckpoint(currentQuestionIndex - 1);
    }
  };

  const currentPrize = prizeTree[currentQuestionIndex];
  const secureMoney = lockedCheckpoint !== -1 ? prizeTree[lockedCheckpoint] : 0;

  if (gameOver) {
    return (
      <div className="w-full h-full bg-on-background text-background flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#F8F5F2 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="z-10 bg-on-background border-2 border-primary p-12 max-w-2xl w-full">
          <h1 className="text-6xl font-serif italic mb-6">
            {gameOver === 'win' ? 'تم اختراق النظام (فزت).' : gameOver === 'walk' ? 'انسحاب تكتيكي.' : 'فشلت المحاكاة (خسرت).'}
          </h1>
          <p className="text-xl opacity-70 mb-8 font-sans">
            العميل {studentName}، الأموال النهائية المُؤمّنة لك:
          </p>
          <div className="text-7xl font-bold text-primary mb-12">${money.toLocaleString()}</div>
          
          <button onClick={onBack} className="bg-background text-on-background px-8 py-4 font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
            العودة للمركز
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-on-background text-background font-sans">
      {/* Right Sidebar: Prize Tree (Moved visually to the right through standard RTL flex order) */}
      <div className="w-full md:w-64 border-l border-background/10 bg-surface-container-low shrink-0 flex flex-col order-last md:order-first border-t md:border-t-0 md:border-l-0 md:border-r">
        <div className="p-6 border-b border-background/10">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">نقطة التثبيت الإضافية</p>
          <div className="flex justify-between items-center">
             <span className="text-lg font-serif italic flex-1 border-b border-transparent">${secureMoney.toLocaleString()}</span>
             <button 
                onClick={handleCheckpoint}
                disabled={lockedCheckpoint !== -1 || currentQuestionIndex === 0}
                className={`text-[9px] uppercase tracking-widest px-2 py-1 border ${(lockedCheckpoint !== -1 || currentQuestionIndex === 0) ? 'border-background/20 opacity-30 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-white transition-colors'}`}
             >
                {lockedCheckpoint !== -1 ? 'مُقفل' : 'تثبيت الرصيد'}
             </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse relative">
           {prizeTree.map((amount, idx) => {
             const isActive = idx === currentQuestionIndex;
             const isPassed = idx < currentQuestionIndex;
             const isCheckpoint = idx === lockedCheckpoint;
             
             let textColor = "text-background/30";
             if (isActive) textColor = "text-white bg-primary px-3 font-bold";
             else if (isCheckpoint) textColor = "text-white font-bold";
             else if (isPassed) textColor = "text-[#D97706]";
             
             return (
               <div key={idx} className={`flex justify-between items-center py-2 ${isActive ? '-mx-3 mb-1 mt-1 rounded-sm' : ''}`}>
                 <span className={`text-[12px] font-bold w-6 ${isActive || isCheckpoint ? 'text-white' : 'text-background/30'}`}>{idx + 1}</span>
                 <span className={`text-xl font-serif text-left flex-1 tracking-wider ${textColor}`}>
                    <span dir="ltr">${amount.toLocaleString()}</span>
                    {isCheckpoint && <Lock className="inline w-3 h-3 mr-2 text-[#D97706] mb-1" />}
                 </span>
               </div>
             )
           })}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-8 md:px-16 md:py-8 justify-between relative order-first md:order-last">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F8F5F2 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Top Bar: Lifelines & Controls */}
        <div className="flex justify-between items-start z-10">
          <button onClick={onBack} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity uppercase text-[10px] tracking-widest">
            <LogOut className="w-4 h-4" /> إحباط
          </button>
          
          <div className="flex gap-4" dir="ltr">
            <button 
              disabled={used5050} 
              onClick={handle5050}
              className={`w-14 h-10 border border-background/30 flex items-center justify-center font-bold font-serif ${used5050 ? 'opacity-20 line-through' : 'hover:bg-background hover:text-on-background'} transition-colors`}
            >
              50:50
            </button>
            <button 
              disabled={usedAudience} 
              onClick={handleAudience}
              className={`w-14 h-10 border border-background/30 flex items-center justify-center ${usedAudience ? 'opacity-20' : 'hover:bg-background hover:text-on-background'} transition-colors relative`}
            >
              <Users className="w-5 h-5" />
              {usedAudience && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[2px] bg-red-500 rotate-45"></div></div>}
            </button>
            <button 
              disabled={usedFriend} 
              onClick={handleFriend}
              className={`w-14 h-10 border border-background/30 flex items-center justify-center ${usedFriend ? 'opacity-20' : 'hover:bg-background hover:text-on-background'} transition-colors relative`}
            >
              <Phone className="w-4 h-4" />
              {usedFriend && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[2px] bg-red-500 rotate-45"></div></div>}
            </button>
          </div>
        </div>

        {/* Center: Question */}
        <div className="flex-1 flex flex-col justify-center z-10 max-w-4xl mx-auto w-full py-12">
          
          {/* Active Overlays for lifelines */}
          {audienceVotes && (
            <div className="mb-8 p-4 border border-background/20 flex justify-center gap-6 text-[10px] uppercase tracking-widest h-32 items-end" dir="ltr">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div key={letter} className="flex flex-col items-center gap-2">
                  <span className="opacity-80">{audienceVotes[i]}%</span>
                  <div className="w-8 bg-primary transition-all duration-1000" style={{ height: `${audienceVotes[i]}px` }}></div>
                  <span className="font-bold">{letter}</span>
                </div>
              ))}
            </div>
          )}

          {isCallingFriend && (
             <div className="mb-8 p-6 border border-primary text-center flex flex-col items-center gap-4 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="font-serif italic text-lg text-primary">جاري إنشاء اتصال آمن مع صديقك الخبير...</p>
             </div>
          )}

          {friendAdvice && (
            <div className="mb-8 p-6 bg-on-background border-r-4 border-primary shadow-xl text-right">
              <p className="text-[10px] uppercase tracking-widest text-primary mb-2 font-bold flex items-center gap-2">
                <Phone className="w-3 h-3" /> نص المكالمة المشفرة
              </p>
              <p className="font-serif italic text-lg leading-relaxed text-background/90">"{friendAdvice}"</p>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-light leading-snug">
              {currentQ.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
            {currentQ.options.map((opt, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              const isSelected = selectedOption === idx;
              const isCorrect = showResult && idx === currentQ.correctAnswer;
              const isWrongSelection = showResult && isSelected && idx !== currentQ.correctAnswer;
              
              const letter = ['A', 'B', 'C', 'D'][idx];

              let bgClass = "bg-transparent hover:bg-primary/10 border-background/30";
              let textClass = "text-background";
              let letterColor = "text-primary";

              if (isSelected && !showResult) {
                bgClass = "bg-[#D97706] border-[#D97706]";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              } else if (isCorrect) {
                bgClass = "bg-green-700 border-green-600";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              } else if (isWrongSelection) {
                bgClass = "bg-primary border-primary";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isHidden || showResult}
                  className={`w-full text-right p-5 border flex items-center gap-4 transition-all duration-300 ${bgClass} ${textClass} ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <span className={`text-xl font-serif font-bold ${letterColor} w-6 text-center shrink-0`}>{letter}:</span>
                  <span className="text-lg tracking-wide">{opt}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
             <div className="mt-8 p-4 border border-background/10 bg-background/5 animate-fade-in text-right">
               <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">استخلاص المعلومات</p>
               <p className="text-sm font-sans italic opacity-90">{currentQ.explanation}</p>
             </div>
          )}
        </div>

        <div className="flex justify-between items-center z-10 border-t border-background/20 pt-4">
           <button 
             onClick={() => setGameOver('walk')}
             className="text-[11px] uppercase tracking-widest font-bold opacity-60 hover:opacity-100 hover:text-primary transition-colors"
           >
             تراجع الآن (${money.toLocaleString()})
           </button>
           <div className="text-sm uppercase tracking-widest text-center">
             السؤال <span className="font-bold text-primary">{currentQuestionIndex + 1}</span><span className="opacity-40">/15</span>
           </div>
        </div>
      </div>
    </div>
  );
}
