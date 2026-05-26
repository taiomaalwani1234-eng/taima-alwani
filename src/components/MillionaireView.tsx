import React, { useState } from "react";
import {
  getRandomMillionaireQuestions,
  prizeTree,
  Question,
} from "../data/questions";
import { askFriendForHelp } from "../services/geminiQuizService";
import {
  Users,
  Phone,
  LogOut,
  Loader2,
  Lock,
} from "lucide-react";

import { TutorialOverlay } from "./TutorialOverlay";

interface MillionaireViewProps {
  onBack: () => void;
  studentName: string;
  isTutorial?: boolean;
  onGameComplete?: (money: number) => void;
}

export const MillionaireView: React.FC<MillionaireViewProps> = ({
  onBack,
  studentName,
  isTutorial = false,
  onGameComplete,
}) => {
  const [showTutorial, setShowTutorial] = useState(isTutorial);
  const [questions] = useState<Question[]>(() =>
    getRandomMillionaireQuestions(15),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [money, setMoney] = useState(0);
  const [lockedCheckpoint, setLockedCheckpoint] = useState(-1);
  const [gameOver, setGameOver] = useState<"win" | "lose" | "walk" | null>(
    null,
  );

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
          setGameOver("win");
          onGameComplete?.(newMoney);
        } else {
          setCurrentQuestionIndex((prev) => prev + 1);
          resetTurn();
        }
      } else {
        // Wrong
        setGameOver("lose");
        let finalMoney = 0;
        if (
          lockedCheckpoint !== -1 &&
          currentQuestionIndex > lockedCheckpoint
        ) {
          finalMoney = prizeTree[lockedCheckpoint];
        }
        setMoney(finalMoney);
        onGameComplete?.(finalMoney);
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

    const incorrectOptions = [0, 1, 2, 3].filter(
      (i) => i !== currentQ.correctAnswer,
    );
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
    const others = [0, 1, 2, 3].filter((i) => i !== currentQ.correctAnswer);
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

  const handleWalk = () => {
    setGameOver("walk");
    onGameComplete?.(money);
  };

  const currentPrize = prizeTree[currentQuestionIndex];
  const secureMoney = lockedCheckpoint !== -1 ? prizeTree[lockedCheckpoint] : 0;

  if (gameOver) {
    return (
      <div className="w-full h-full bg-[#0a0f1a] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div className="z-10 bg-[#111827] border-2 border-[#447F98]/50 p-12 max-w-2xl w-full rounded-2xl shadow-[0_0_50px_rgba(68,127,152,0.15)]">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif italic text-[#447F98]">
            {gameOver === "win"
              ? "🏆 تم اختراق النظام بنجاح!"
              : gameOver === "walk"
                ? "🤝 انسحاب تكتيكي ناجح"
                : "💥 فشلت محاكاة الاختراق"}
          </h1>
          
          <div className="my-10 space-y-4">
            {gameOver === "walk" ? (
              <div className="text-center space-y-4">
                <p className="text-gray-400 text-lg">
                  العميل <span className="text-white font-bold">{studentName}</span>، المبلغ المؤمّن من الانسحاب التكتيكي:
                </p>
                <p className="text-6xl font-bold text-green-400"
                   style={{ textShadow: '0 0 35px rgba(74, 222, 128, 0.6)' }}>
                  ${money.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                  لقد فضلت الانسحاب التكتيكي وحفظ رصيدك المالي بدلاً من المغامرة وفقدان كل شيء. خيار سيبراني ذكي!
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-lg">
                  العميل <span className="text-white font-bold">{studentName}</span>، المبلغ المؤمّن من الاختراق:
                </p>
                <p className="text-6xl font-bold text-green-400"
                   style={{ textShadow: '0 0 25px rgba(74, 222, 128, 0.5)' }}>
                  ${money.toLocaleString()}
                </p>
              </>
            )}
          </div>

          <button
            onClick={onBack}
            className="bg-[#447F98] text-white font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-[#447F98]/80 transition-colors shadow-lg shadow-[#447F98]/20 cursor-pointer"
          >
            العودة للمركز التدريبي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#0a0f1a] text-white font-sans relative">
      {showTutorial && (
        <TutorialOverlay
          message="في المليونير السيبراني، ستبدأ بالإجابة على أسئلة متدرجة الصعوبة. استخدم وسائل المساعدة الثلاث بحكمة للوصول إلى السؤال الأخير وجمع النقاط."
          onDismiss={() => setShowTutorial(false)}
        />
      )}
      {/* Right Sidebar: Prize Tree */}
      <div className="w-full md:w-64 border-l border-[#447F98]/10 bg-[#111827] shrink-0 flex flex-col order-last md:order-first border-t md:border-t-0 md:border-l-0 md:border-r">
        <div className="p-6 border-b border-[#447F98]/10">
          <p className="text-[10px] uppercase tracking-widest text-[#447F98] font-bold mb-1">
            نقطة التثبيت الإضافية
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-serif italic text-white">
              ${secureMoney.toLocaleString()}
            </span>
            <button
              onClick={handleCheckpoint}
              disabled={lockedCheckpoint !== -1 || currentQuestionIndex === 0}
              className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded border cursor-pointer ${lockedCheckpoint !== -1 || currentQuestionIndex === 0 ? "border-gray-700 text-gray-600 cursor-not-allowed" : "border-[#447F98] text-[#447F98] hover:bg-[#447F98] hover:text-white transition-colors"}`}
            >
              {lockedCheckpoint !== -1 ? "مُقفل" : "تثبيت الرصيد"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse relative bg-[#0a0f1a]/50">
          {prizeTree.map((amount, idx) => {
            const isActive = idx === currentQuestionIndex;
            const isPassed = idx < currentQuestionIndex;
            const isCheckpoint = idx === lockedCheckpoint;

            let textColor = "text-gray-600";
            if (isActive) textColor = "text-white bg-[#447F98]/80 px-3 font-bold rounded-lg shadow-sm";
            else if (isCheckpoint) textColor = "text-white font-bold";
            else if (isPassed) textColor = "text-[#D97706]";

            return (
              <div
                key={idx}
                className={`flex justify-between items-center py-1.5 ${isActive ? "-mx-3 mb-1 mt-1" : ""}`}
              >
                <span
                  className={`text-[12px] font-bold w-6 ${isActive || isCheckpoint ? "text-white" : "text-gray-600"}`}
                >
                  {idx + 1}
                </span>
                <span
                  className={`text-lg font-serif text-left flex-1 tracking-wider ${textColor} flex items-center justify-between`}
                >
                  <span dir="ltr">${amount.toLocaleString()}</span>
                  {isCheckpoint && (
                    <Lock className="inline w-3 h-3 text-[#D97706] mb-0.5" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-8 md:px-16 md:py-8 justify-between relative order-first md:order-last">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Top Bar: Lifelines & Controls */}
        <div className="flex justify-between items-start z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-300 bg-[#111827] border border-gray-800 shadow-sm hover:bg-gray-800 hover:text-[#447F98] transition-all rounded-lg px-4 py-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> إحباط
          </button>

          <div className="flex gap-3" dir="ltr">
            <button
              disabled={used5050}
              onClick={handle5050}
              className={`w-14 h-10 border border-gray-800 rounded-lg flex items-center justify-center font-bold font-serif cursor-pointer ${used5050 ? "opacity-20 line-through text-gray-500 bg-black/40 cursor-not-allowed" : "bg-[#111827] text-white hover:bg-[#447F98]/20 hover:border-[#447F98]"} transition-colors`}
            >
              50:50
            </button>
            <button
              disabled={usedAudience}
              onClick={handleAudience}
              className={`w-14 h-10 border border-gray-800 rounded-lg flex items-center justify-center cursor-pointer ${usedAudience ? "opacity-20 bg-black/40 text-gray-500 cursor-not-allowed" : "bg-[#111827] text-white hover:bg-[#447F98]/20 hover:border-[#447F98]"} transition-colors relative`}
            >
              <Users className="w-5 h-5" />
              {usedAudience && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
            <button
              disabled={usedFriend}
              onClick={handleFriend}
              className={`w-14 h-10 border border-gray-800 rounded-lg flex items-center justify-center cursor-pointer ${usedFriend ? "opacity-20 bg-black/40 text-gray-500 cursor-not-allowed" : "bg-[#111827] text-white hover:bg-[#447F98]/20 hover:border-[#447F98]"} transition-colors relative`}
            >
              <Phone className="w-4 h-4" />
              {usedFriend && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Center: Question */}
        <div className="flex-1 flex flex-col justify-center z-10 max-w-4xl mx-auto w-full py-6">
          {/* Active Overlays for lifelines */}
          {audienceVotes && (
            <div
              className="mb-8 flex items-end justify-around gap-3 p-4 rounded-xl bg-black/40 border border-gray-800 backdrop-blur"
              style={{ height: '200px' }}
              dir="ltr"
            >
              {audienceVotes.map((vote, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1 max-w-[60px]">
                  {/* النسبة فوق العمود */}
                  <span className="text-xs font-bold text-white bg-[#447F98]/80 px-2 py-0.5 rounded shadow">
                    {vote}%
                  </span>
                  {/* العمود */}
                  <div
                    className="w-full rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    style={{ 
                      height: `${vote * 1.5}px`,
                      background: i === currentQ.correctAnswer 
                        ? 'linear-gradient(to top, #22c55e, #4ade80)' 
                        : 'linear-gradient(to top, #6366f1, #818cf8)'
                    }}
                  ></div>
                  {/* حرف الخيار */}
                  <span className="text-lg font-bold text-white mt-1">
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isCallingFriend && (
            <div className="mb-8 p-6 bg-[#447F98]/5 rounded-2xl border border-[#447F98]/30 text-center flex flex-col items-center gap-4 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-[#447F98]" />
              <p className="font-serif italic text-lg text-[#447F98]">
                جاري إنشاء اتصال آمن مع صديقك الخبير...
              </p>
            </div>
          )}

          {friendAdvice && (
            <div className="mb-8 p-6 bg-[#111827] rounded-2xl border border-[#447F98]/20 border-r-4 border-r-[#447F98] shadow-xl text-right">
              <p className="text-[10px] uppercase tracking-widest text-[#447F98] mb-2 font-bold flex items-center gap-2">
                <Phone className="w-3 h-3" /> نص المكالمة المشفرة
              </p>
              <p className="font-serif italic text-lg leading-relaxed text-gray-300">
                "{friendAdvice}"
              </p>
            </div>
          )}

          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold leading-relaxed text-white">
              {currentQ.question}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const isHidden = hiddenOptions.includes(idx);
              const isSelected = selectedOption === idx;
              const isCorrect = showResult && idx === currentQ.correctAnswer;
              const isWrongSelection =
                showResult && isSelected && idx !== currentQ.correctAnswer;

              const letter = ["A", "B", "C", "D"][idx];

              let bgClass =
                "bg-[#111827]/60 hover:bg-[#447F98]/10 border-gray-800 text-gray-300";
              let textClass = "text-gray-300";
              let letterColor = "text-[#447F98]";

              if (isSelected && !showResult) {
                bgClass = "bg-[#D97706] border-[#D97706]";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              } else if (isCorrect) {
                bgClass = "bg-green-700 border-green-600";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              } else if (isWrongSelection) {
                bgClass = "bg-red-700 border-red-600";
                textClass = "text-white";
                letterColor = "text-white opacity-70";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isHidden || showResult}
                  className={`w-full text-right p-5 border rounded-2xl flex items-center gap-4 transition-all duration-300 cursor-pointer ${bgClass} ${textClass} ${isHidden ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                  <span
                    className={`text-xl font-serif font-bold ${letterColor} w-6 text-center shrink-0`}
                  >
                    {letter}:
                  </span>
                  <span className="text-lg tracking-wide">{opt}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-8 p-5 rounded-2xl border border-gray-800 bg-[#111827]/40 animate-fade-in text-right">
              <p className="text-[10px] uppercase tracking-widest text-[#447F98] mb-1.5 font-bold">
                استخلاص المعلومات
              </p>
              <p className="text-sm font-sans italic text-gray-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center z-10 border-t border-[#447F98]/10 pt-4 mt-2">
          <button
            onClick={handleWalk}
            className="text-[11px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#447F98] transition-colors bg-[#447F98]/5 hover:bg-[#447F98]/10 border border-[#447F98]/10 hover:border-[#447F98]/30 px-3.5 py-1.5 rounded-lg cursor-pointer"
          >
            تراجع الآن (${money.toLocaleString()})
          </button>
          <div className="text-sm uppercase tracking-widest text-center text-gray-400">
            السؤال{" "}
            <span className="font-bold text-[#447F98]">
              {currentQuestionIndex + 1}
            </span>
            <span className="opacity-40">/15</span>
          </div>
        </div>
      </div>
    </div>
  );
};
