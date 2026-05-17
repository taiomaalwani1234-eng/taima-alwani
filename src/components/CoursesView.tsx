import React, { useState } from 'react';
import { GlobalHeader } from './GlobalHeader';
import { LogOut, Sun, Moon, BookOpen, FileText, Video, PlayCircle, ChevronRight, File } from 'lucide-react';
import Markdown from 'react-markdown';

interface CoursesViewProps {
  onBack: () => void;
}

type ContentType = 'video' | 'pdf' | 'markdown';

interface Lecture {
  id: string;
  title: string;
  desc: string;
  contentType: ContentType;
  contentUrl?: string; // For video or PDF
  content?: string; // For markdown
  duration: string;
}

interface Course {
  id: string;
  title: string;
  desc: string;
  lectures: Lecture[];
}

const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'أساسيات الأمن السيبراني',
    desc: 'دورة تمهيدية تأخذك في رحلة للتعرف على مبادئ أمن المعلومات وحماية الأجهزة والشبكات من التهديدات الشائعة.',
    lectures: [
      {
        id: 'c1-l1',
        title: 'مقدمة عن الأمن السيبراني',
        desc: 'ما هو الأمن السيبراني ولماذا هو مهم في عصرنا الحالي؟',
        contentType: 'video',
        contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15:20'
      },
      {
        id: 'c1-l2',
        title: 'مثلث الحماية CIA',
        desc: 'السرية، السلامة، والتوافر.',
        contentType: 'markdown',
        content: '# مثلث الحماية (CIA Triad)\n\nيعتبر مثلث الحماية أو ثالوث CIA من أهم المفاهيم في مجال أمن المعلومات. يتكون من ثلاثة عناصر رئيسية:\n\n1. **السرية (Confidentiality):** ضمان عدم وصول الأشخاص غير المصرح لهم إلى المعلومات.\n2. **السلامة (Integrity):** التأكد من أن البيانات لم يتم العبث بها أو تغييرها من قبل أشخاص غير مخولين.\n3. **التوافر (Availability):** ضمان أن المعلومات والأنظمة متاحة للمستخدمين المصرح لهم عند الحاجة إليها.',
        duration: '5 دقائق قراءة'
      },
      {
        id: 'c1-l3',
        title: 'سياسات أمن المعلومات',
        desc: 'أمثلة لسياسات أمنية معتمدة.',
        contentType: 'pdf',
        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Example dummy pdf
        duration: '10 صفحات'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'اختبار الاختراق والقرصنة الأخلاقية',
    desc: 'تعلم كيف تفكر كمخترق لتتمكن من حماية الأنظمة. يشمل التعرف على الثغرات وكيفية استغلالها بشكل قانوني.',
    lectures: [
      {
        id: 'c2-l1',
        title: 'الهندسة الاجتماعية',
        desc: 'التلاعب النفسي لاختراق العقول بدلاً من الأنظمة.',
        contentType: 'video',
        contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '22:10'
      },
      {
        id: 'c2-l2',
        title: 'ثغرات تطبيقات الويب',
        desc: 'شرح مفصل لثغرات OWASP Top 10.',
        contentType: 'markdown',
        content: '# ثغرات تطبيقات الويب\n\nتطبيقات الويب معرضة للعديد من الهجمات. القائمة التالية من OWASP تلخص أهم الثغرات:\n\n- **حقن SQL:** استغلال مدخلات المستخدم لتنفيذ أوامر قواعد بيانات خبيثة.\n- **البرمجة عبر المواقع (XSS):** حقن نصوص برمجية خبيثة في صفحات الويب لتنفيذها في متصفحات المستخدمين الآخرين.',
        duration: '10 دقائق قراءة'
      }
    ]
  }
];

export const CoursesView: React.FC<CoursesViewProps> = ({ onBack }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  
  
  const bgClass = 'bg-background text-on-background';
  const borderClass = 'border-outline/20';
  const cardBgClass = 'bg-surface hover:bg-surface-container';
  const sidebarClass = 'bg-surface-container';
  const contentBgClass = 'bg-background';
  const primaryText = 'text-primary';
  const activeLectureClass = 'bg-primary text-on-primary border-transparent';
  const inactiveLectureClass = 'border-outline/20 hover:border-primary hover:text-primary';

  const selectedCourse = MOCK_COURSES.find(c => c.id === selectedCourseId);
  const selectedLecture = selectedCourse?.lectures.find(l => l.id === selectedLectureId);

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedLectureId(null);
  };

  const getIconForType = (type: ContentType) => {
    switch(type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'markdown': return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col font-sans transition-colors duration-500 overflow-hidden ${bgClass}`} dir="rtl">
      
      {/* Header */}
      <header className={`p-4 border-b ${borderClass} flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0`}>
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
           {selectedCourseId ? (
              <button 
                onClick={handleBackToCourses} 
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary transition-colors"
                title="العودة لقائمة الدورات"
              >
                <ChevronRight className="w-5 h-5 rtl:scale-x-[-1]" />
              </button>
           ) : (
              <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 hover:text-primary transition-colors"
                title="العودة للمركز"
              >
                <LogOut className="w-4 h-4 rtl:scale-x-[-1]" /> 
              </button>
           )}
           <div>
             <h1 className="text-2xl sm:text-3xl font-serif italic font-light tracking-tighter leading-none">
               {selectedCourse ? selectedCourse.title : 'الدورات التعليمية'}
             </h1>
             <p className="text-[10px] uppercase tracking-[0.2em] mt-1 opacity-60 font-semibold">
               {selectedCourse ? 'بيئة التعلم المدمج (LMS)' : 'مسارات التعلم الأكاديمي الشامل'}
             </p>
           </div>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 sm:p-3 rounded-full border border-outline/20 hover:bg-primary/20 transition-colors"
          title={(theme === 'dark') ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </header>

      {/* Main Content Area */}
      {!selectedCourse ? (
        // Course List View
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             {MOCK_COURSES.map((course) => (
                <button 
                  key={course.id} 
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    if (course.lectures.length > 0) {
                      setSelectedLectureId(course.lectures[0].id);
                    }
                  }}
                  className={`text-right p-6 sm:p-8 bg-surface border border-outline-variant rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-2 flex flex-col group`}
                >
                   <div className={`w-14 h-14 mb-6 rounded-none flex items-center justify-center bg-primary/10 ${primaryText} group-hover:scale-110 transition-transform`}>
                     <BookOpen className="w-7 h-7" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-serif font-bold mb-4 line-clamp-2 leading-snug">{course.title}</h3>
                   <p className="text-sm opacity-70 mb-8 flex-1 leading-relaxed font-medium">{course.desc}</p>
                   <div className={`w-full py-3 inline-flex justify-center text-[10px] uppercase tracking-widest font-bold border ${borderClass} bg-transparent group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-colors`}>
                     دخول للكورس
                   </div>
                </button>
             ))}
          </div>
        </main>
      ) : (
        // LMS View (Sidebar + Content)
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Lecture List */}
          <aside className={`w-full md:w-80 border-l ${borderClass} ${sidebarClass} flex flex-col overflow-y-auto shrink-0 transition-colors duration-500`}>
            <div className={`p-4 border-b ${borderClass}`}>
              <h2 className="text-sm font-bold uppercase tracking-widest">محتويات الكورس</h2>
            </div>
            <div className="flex flex-col p-2 gap-2">
               {selectedCourse.lectures.map((lecture, idx) => {
                 const isActive = selectedLectureId === lecture.id;
                 return (
                   <button
                     key={lecture.id}
                     onClick={() => setSelectedLectureId(lecture.id)}
                     className={`text-right p-3 border-l-4 rounded-sm flex flex-col gap-2 transition-all duration-200 ${
                       isActive ? activeLectureClass : inactiveLectureClass
                     }`}
                   >
                     <div className="flex items-start justify-between w-full">
                       <span className="text-xs font-bold font-serif leading-snug break-words pl-2">
                         {idx + 1}. {lecture.title}
                       </span>
                       <span className="shrink-0 mt-0.5 opacity-80" title={lecture.contentType}>
                         {getIconForType(lecture.contentType)}
                       </span>
                     </div>
                     <div className="flex justify-between items-center opacity-70">
                       <span className="text-[10px] font-sans">{lecture.duration}</span>
                     </div>
                   </button>
                 );
               })}
            </div>
          </aside>

          {/* Lecture Content */}
          <main className={`flex-1 overflow-y-auto transition-colors duration-500 ${contentBgClass} relative`}>
             {selectedLecture ? (
                <div className="max-w-4xl mx-auto p-4 sm:p-8 flex flex-col h-full">
                   <div className="mb-6">
                      <h2 className="text-2xl sm:text-4xl font-serif font-light mb-2">{selectedLecture.title}</h2>
                      <p className="opacity-70 text-sm leading-relaxed">{selectedLecture.desc}</p>
                   </div>
                   
                   <div className={`flex-1 rounded-sm border ${borderClass} overflow-hidden bg-black/5`}>
                     {selectedLecture.contentType === 'video' && selectedLecture.contentUrl && (
                        <div className="w-full h-full min-h-[400px]">
                           <iframe 
                             src={selectedLecture.contentUrl} 
                             className="w-full h-full"
                             title="Video player"
                             frameBorder="0" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                           />
                        </div>
                     )}
                     
                     {selectedLecture.contentType === 'pdf' && selectedLecture.contentUrl && (
                        <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-8 text-center text-primary">
                           <FileText className="w-16 h-16 mb-4 opacity-50" />
                           <p className="mb-4 text-sm font-bold text-inherit">عارض الـ PDF يتطلب مكتبة إضافية أو إطار متصفح لدعمه في هذه البيئة.</p>
                           <a 
                             href={selectedLecture.contentUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className={`px-6 py-3 border border-primary hover:bg-primary hover:text-on-primary transition-colors text-[10px] uppercase tracking-widest font-bold font-sans inline-flex items-center gap-2`}
                           >
                             فتح الملف في نافذة جديدة <FileText className="w-4 h-4" />
                           </a>
                        </div>
                     )}

                     {selectedLecture.contentType === 'markdown' && selectedLecture.content && (
                        <div className="p-6 sm:p-8 font-sans leading-loose text-sm sm:text-base prose prose-neutral max-w-none dark:prose-invert">
                           <Markdown>{selectedLecture.content}</Markdown>
                        </div>
                     )}
                   </div>
                   
                   {/* Next / Prev navigation (Optional, omitted for simplicity but easy to add) */}
                </div>
             ) : (
                <div className="w-full h-full flex items-center justify-center p-8 text-center">
                  <div>
                    <h3 className="text-xl font-bold mb-2">مرحباً بك في الكورس</h3>
                    <p className="opacity-70 text-sm">اختر محاضرة من القائمة الجانبية للبدء.</p>
                  </div>
                </div>
             )}
          </main>
        </div>
      )}
    </div>
  );
  };

