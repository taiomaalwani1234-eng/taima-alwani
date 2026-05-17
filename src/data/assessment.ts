import { questionBank } from './questionBank';

export type QuestionType = 'mcq' | 'command';

export interface AssessmentQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // Only for multiple choice
  correctAnswers: string[]; // Can accept multiple valid command outputs or the exact MCQ option
}

export function getAssessmentQuestions(count: number = 10): AssessmentQuestion[] {
  const mcqs = questionBank.filter(q => q.type === 'mcq');
  const commands = questionBank.filter(q => q.type === 'command');

  const randomMcqs = [...mcqs].sort(() => 0.5 - Math.random()).slice(0, 7);
  const randomCommands = [...commands].sort(() => 0.5 - Math.random()).slice(0, 3);

  const mixed = [...randomMcqs, ...randomCommands].sort(() => 0.5 - Math.random());
  return mixed.slice(0, count);
}

export function evaluateLevel(score: number): { level: string, description: string, color: string } {
  if (score <= 3) return { level: "المستوى الأول: متدرب (Script Kiddie)", description: "أنت في بداية رحلتك. ركز على أساسيات الشبكات وأنظمة Linux والثغرات القياسية.", color: "#555" };
  if (score <= 6) return { level: "المستوى الثاني: محلل مبتدئ (Junior Analyst)", description: "لديك أساس متين، لكنك بحاجة إلى المزيد من الخبرة العملية وفهم أعمق لتوجهات الهجوم المختلفة.", color: "#D97706" };
  if (score <= 8) return { level: "المستوى الثالث: مُشغل أمن (Security Operator)", description: "عمل رائع! أنت تفهم مبادئ الأمان جيدًا وتعرف كيف تتنقل في سطر الأوامر وأدوات الأمان الحقيقية.", color: "#4D7C0F" };
  return { level: "المستوى الرابع: خبير اختراق سيبراني (Cyber Hacker)", description: "استثنائي! معرفتك التقنية حادة وتظهر عقلية محترف حقيقي ومخضرم في الأمن السيبراني.", color: "#B44C32" };
}
