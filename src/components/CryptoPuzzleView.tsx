import React, { useState, useEffect } from "react";
import { GlobalHeader } from "./GlobalHeader";
import { getRandomPuzzles, CryptoPuzzle } from "../data/cryptoPuzzles";
import { LogOut, RefreshCcw, CheckCircle, Terminal } from "lucide-react";

import { TutorialOverlay } from "./TutorialOverlay";

interface CryptoPuzzleViewProps {
  onBack: () => void;
  isTutorial?: boolean;
}

interface PoolChar {
  id: number;
  char: string;
  used: boolean;
}

export const CryptoPuzzleView: React.FC<CryptoPuzzleViewProps> = ({
  onBack,
  isTutorial = false,
}) => {
  const [showTutorial, setShowTutorial] = useState(isTutorial);
  const [currentPuzzles] = useState<CryptoPuzzle[]>(() => getRandomPuzzles(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<PoolChar[]>([]);
  const [slots, setSlots] = useState<(number | null)[]>([]);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const currentPuzzle = currentPuzzles[currentIndex];

  useEffect(() => {
    if (gameComplete) return;

    // Initialize current puzzle
    const answerChars = currentPuzzle.answer.split("");
    const extraCount = Math.max(0, 14 - answerChars.length);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const extraChars = Array.from({ length: extraCount }).map(() =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    );

    const combined = [...answerChars, ...extraChars].sort(
      () => Math.random() - 0.5,
    );

    setPool(combined.map((char, index) => ({ id: index, char, used: false })));
    setSlots(Array(answerChars.length).fill(null));
    setIsError(false);
    setIsSuccess(false);
  }, [currentIndex, gameComplete]);

  useEffect(() => {
    // Check answer when all slots are filled
    if (slots.length > 0 && slots.every((s) => s !== null)) {
      const attempt = slots.map((id) => pool[id!].char).join("");
      if (attempt === currentPuzzle.answer) {
        setIsSuccess(true);
        setTimeout(() => {
          if (currentIndex < currentPuzzles.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setGameComplete(true);
          }
        }, 1500);
      } else {
        setIsError(true);
        setTimeout(() => setIsError(false), 800);
      }
    }
  }, [slots, pool, currentPuzzle, currentIndex]);

  const handlePoolClick = (poolId: number) => {
    if (pool[poolId].used || isSuccess) return;

    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      const newSlots = [...slots];
      newSlots[firstEmptyIndex] = poolId;
      setSlots(newSlots);

      const newPool = [...pool];
      newPool[poolId] = { ...newPool[poolId], used: true };
      setPool(newPool);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (slots[slotIndex] === null || isSuccess) return;

    const poolId = slots[slotIndex]!;
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);

    const newPool = [...pool];
    newPool[poolId] = { ...newPool[poolId], used: false };
    setPool(newPool);
  };

  const clearSlots = () => {
    if (isSuccess) return;
    setSlots(Array(currentPuzzle.answer.length).fill(null));
    setPool(pool.map((p) => ({ ...p, used: false })));
  };

  if (gameComplete) {
    return (
      <div className="w-full h-full bg-on-background text-background flex flex-col items-center justify-center font-sans">
        <CheckCircle className="w-24 h-24 text-green-500 mb-8" />
        <h1 className="text-4xl sm:text-5xl font-serif italic mb-4">
          اكتمل التحدي
        </h1>
        <p className="text-lg opacity-80 mb-8 max-w-lg text-center leading-relaxed">
          أحسنت! لقد تمكنت من حل جميع الألغاز البرمجية والتشفيرية بنجاح. معرفتك
          العملية ممتازة.
        </p>
        <button
          onClick={onBack}
          className="px-8 py-4 bg-primary hover:bg-[#8A3A25] transition-colors text-white text-[11px] uppercase tracking-widest font-bold"
        >
          العودة لمركز الأكاديمية
        </button>
      </div>
    );
  }

  let hintPoolId: number | null = null;
  if (showTutorial) {
    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      const expectedChar = currentPuzzle.answer[firstEmptyIndex];
      const matchingPoolItem = pool.find(
        (p) => p.char === expectedChar && !p.used,
      );
      if (matchingPoolItem) {
        hintPoolId = matchingPoolItem.id;
      }
    }
  }

  return (
    <div className="w-full h-full bg-surface-variant flex flex-col font-sans text-on-background relative overflow-hidden">
      {showTutorial && (
        <TutorialOverlay
          message="قم باختيار الأحرف المناسبة لتكوين أمر النظام الصحيح أو خوارزمية التشفير المطلوبة لملء الفراغات وحل اللغز."
          onDismiss={() => setShowTutorial(false)}
        />
      )}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--sys-on-background) 2px, transparent 2px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <header className="flex justify-between items-end p-8 border-b border-on-background/10 relative z-10 shrink-0">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface bg-surface border border-outline shadow-sm hover:bg-surface-variant hover:text-primary hover:border-primary/50 transition-all rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <LogOut className="w-3 h-3" /> العودة للمركز
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tighter leading-none text-primary">
              تشفير وأوامر
            </h1>
            <button
              onClick={() => setShowTutorial(true)}
              className="px-3 py-1 bg-surface-variant text-on-surface-variant border border-outline/30 rounded-full text-[10px] font-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-1"
            >
              مساعدة؟
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] mt-2 opacity-60 font-semibold">
            حل الشفرات التشغيلية
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] uppercase tracking-widest opacity-50">
            التقدم
          </p>
          <p className="font-serif italic font-bold text-2xl text-primary">
            {currentIndex + 1} / {currentPuzzles.length}
          </p>
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col items-center p-4 sm:p-8 relative overflow-y-auto ${showTutorial ? "z-[60]" : "z-10"}`}
      >
        <div
          className={`w-full max-w-3xl flex flex-col mt-4 sm:mt-12 ${showTutorial ? "bg-background/90 p-8 rounded-3xl shadow-2xl backdrop-blur-sm transition-all" : ""}`}
        >
          <div className="flex items-center gap-3 mb-6 self-start bg-white px-4 py-2 border border-on-background/20 shadow-[4px_4px_0px_#1A1A1A]">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="text-[11px] uppercase tracking-widest font-bold">
              {currentPuzzle.type === "crypto" ? "تحدي تشفير" : "تحدي أوامر"}
            </span>
          </div>

          <div className="mb-12">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-serif leading-relaxed font-light text-right"
              dir="auto"
            >
              "{currentPuzzle.question}"
            </h2>
          </div>

          {/* Slots area */}
          <div
            className={`flex flex-wrap gap-2 lg:gap-3 mb-16 justify-center ${isError ? "animate-shake" : ""}`}
            dir="ltr"
          >
            {slots.map((poolId, i) => (
              <div
                key={i}
                onClick={() => handleSlotClick(i)}
                className={`w-12 h-14 sm:w-16 sm:h-20 border-2 flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold cursor-pointer transition-all ${
                  poolId !== null
                    ? isSuccess
                      ? "bg-green-500 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      : isError
                        ? "bg-red-500 border-red-600 text-white"
                        : "bg-white border-on-background text-on-background shadow-[4px_4px_0px_#1A1A1A]"
                    : "bg-transparent border-on-background/20 border-dashed hover:border-on-background/50"
                }`}
              >
                {poolId !== null ? pool[poolId].char : ""}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={clearSlots}
              disabled={isSuccess || slots.every((s) => s === null)}
              className="flex items-center gap-2 px-4 py-2 border border-on-background/20 hover:bg-on-background hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-background"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                مسح الإجابة
              </span>
            </button>
          </div>

          {/* Available letters pool */}
          <div
            className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-2xl mx-auto"
            dir="ltr"
          >
            {pool.map((p) => {
              const isHint = hintPoolId === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative ${isHint ? "z-[70]" : ""}`}
                >
                  {isHint && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
                      <span
                        className="text-4xl drop-shadow-xl"
                        role="img"
                        aria-label="hint"
                      >
                        👇
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (showTutorial) setShowTutorial(false);
                      handlePoolClick(p.id);
                    }}
                    disabled={p.used || isSuccess}
                    className={`w-10 h-12 sm:w-14 sm:h-16 font-mono text-xl sm:text-2xl font-bold flex items-center justify-center transition-all ${
                      p.used
                        ? "bg-transparent border border-on-background/10 text-transparent pointer-events-none"
                        : "bg-primary text-on-primary hover:brightness-110 hover:-translate-y-1 shadow-md"
                    } ${isHint ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  >
                    {p.char}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Admin Hint Section */}
          <div className="flex flex-col items-center mt-12 gap-4 border-t border-on-background/10 pt-8 w-full max-w-md mx-auto">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">
              تلميح الإدارة
            </p>
            <input
              type="password"
              placeholder="كلمة سر المدير..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="px-4 py-3 bg-transparent border border-on-background/20 text-center font-mono w-full focus:outline-none focus:border-primary transition-colors shadow-inner placeholder-on-background/30"
              dir="ltr"
            />
            {adminPassword === "admin" && (
              <div className="w-full mt-2 text-primary font-mono text-xl font-bold bg-primary/10 px-6 py-4 border border-primary/30 text-center shadow-sm">
                الحل: {currentPuzzle.answer}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};
