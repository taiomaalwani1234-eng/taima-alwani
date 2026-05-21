import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { chatWithCyberAssistant } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatPanelProps {
  onMapUpdate: (sectorId: string, status?: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onMapUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'تم اتصال شبكة مدينة آمنة. أنا الذكاء الاصطناعي Locus، مستشارك للأمن السيبراني. يمكنك إطلاق هجمات محاكاة أو نشر دفاعات. كيف سنمضي قدما؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [history, setHistory] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'تم اتصال شبكة مدينة آمنة. أنا الذكاء الاصطناعي Locus، مستشارك للأمن السيبراني. يمكنك إطلاق هجمات محاكاة أو نشر دفاعات. كيف سنمضي قدما؟' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    const tempHistory = [...history];
    setIsTyping(true);
    
    try {
      const response = await chatWithCyberAssistant(userText, tempHistory);
      
      let textResponse = response.text || '';
      
      const functionCall = response.functionCall;
      if (functionCall && functionCall.name === 'updateSectorStatus') {
        const args = JSON.parse(functionCall.arguments || '{}');
        const { targetSectorId, status } = args;
        if (targetSectorId && status) {
          onMapUpdate(targetSectorId, status);
        }
      }
      
      if (!textResponse && functionCall) {
          textResponse = "لقد قمت بتحديث التمثيل الآلي للشبكة من أجلك.";
      }

      setMessages(prev => [...prev, { role: 'model', text: textResponse }]);
      
      setHistory(prev => [
        ...prev, 
        { role: 'user', content: userText },
        { role: 'assistant', content: textResponse }
      ]);
      
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "فشل حاسم في الاتصال مع الجوهر المنطقي. حاول مرة أخرى." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-on-background">
      {/* Top Status */}
      <div className="p-8 border-b border-on-background/10 bg-background">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">حالة النظام</span>
          <p className="text-sm leading-relaxed text-[#555]">تم الاتصال بعقدة مدينة آمنة. المراقبة نشطة. بانتظار أوامرك...</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className="group">
            <div className="flex justify-between items-baseline mb-2 flex-row-reverse">
              <span className={`text-[11px] font-bold uppercase tracking-tighter ${msg.role === 'model' ? 'text-primary' : ''}`}>
                {msg.role === 'model' ? 'استجابة Locus' : 'استفسار المستخدم'}
              </span>
              <span className="text-[9px] opacity-40 uppercase" dir="ltr">Log {idx + 1}</span>
            </div>
            
            <div className="mt-1 text-right">
              {msg.role === 'model' ? (
                <div className="markdown-body text-sm leading-relaxed text-[#333] prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-primary text-right" dir="auto">
                  <Markdown>{msg.text}</Markdown>
                </div>
              ) : (
                <p className="font-serif text-lg leading-snug italic text-on-background max-w-[90%] inline-block">"{msg.text}"</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="group">
             <div className="flex justify-between items-baseline mb-2 flex-row-reverse">
              <span className="text-[11px] font-bold uppercase tracking-tighter text-primary">
                استجابة Locus
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#333] flex-row-reverse">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm italic font-serif">جاري تحليل بيانات البنية التحتية...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 bg-on-background text-background text-right">
        <div className="flex items-center justify-between border-b border-background/20 pb-2 relative flex-row-reverse">
          <span className="text-[10px] uppercase tracking-widest font-bold shrink-0">الوحدة الطرفية</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب أمرك هنا..."
            className="flex-1 bg-transparent px-4 py-0 focus:outline-none text-[13px] text-background placeholder:text-background/40 text-right"
            dir="auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="text-background hover:text-primary transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 transform rotate-180" />
          </button>
        </div>
        <p className="mt-4 text-[13px] opacity-50">بلغ عن الحالات الشاذة، اطلب الحالة، أو ابدأ بروتوكولات الدفاع...</p>
      </div>
    </div>
  );
};
