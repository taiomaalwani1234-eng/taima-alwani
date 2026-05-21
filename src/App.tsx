import { useState } from 'react';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { MillionaireView } from './components/MillionaireView';
import { SecureCityView } from './components/SecureCityView';
import { FlashcardsView } from './components/FlashcardsView';
import { AssessmentView } from './components/AssessmentView';
import { CryptoPuzzleView } from './components/CryptoPuzzleView';
import { CoursesView } from './components/CoursesView';
import { AdminView } from './components/AdminView';
import { saveProgress, updateLevel } from './services/backendApi';

type ViewState = 'auth' | 'dashboard' | 'city' | 'millionaire' | 'flashcards' | 'assessment' | 'crypto' | 'courses' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [studentName, setStudentName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [userId, setUserId] = useState<number>(0);

  const handleLogin = (name: string, level: string, id: number) => {
    setStudentName(name);
    setStudentLevel(level);
    setUserId(id);
    setCurrentView('dashboard');
  };

  const handleUpdateLevel = async (level: string) => {
    setStudentLevel(level);
    if (userId) {
      try {
        await updateLevel(userId, level);
        await saveProgress(userId, 'assessment', { level, completedAt: new Date().toISOString() });
      } catch (err) {
        console.error('Failed to save level:', err);
      }
    }
    setCurrentView('dashboard');
  };

  const handleGameEnd = async (gameType: string, data: any) => {
    if (userId) {
      try {
        await saveProgress(userId, gameType, data);
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  return (
    <div dir="rtl" className="w-screen h-screen overflow-hidden bg-background text-on-background selection:bg-primary selection:text-white" style={{ fontFamily: 'Georgia, serif' }}>
      {currentView === 'auth' && (
        <AuthView onLogin={handleLogin} />
      )}
      
      {currentView === 'dashboard' && (
        <DashboardView 
          studentName={studentName} 
          studentLevel={studentLevel} 
          onSelectGame={(game) => setCurrentView(game as ViewState)} 
          userId={userId}
          onLogout={() => {
            localStorage.removeItem('taima_user');
            setUserId(0);
            setStudentName('');
            setStudentLevel('');
            setCurrentView('auth');
          }}
        />
      )}
      
      {currentView === 'millionaire' && (
        <MillionaireView 
          studentName={studentName} 
          onBack={() => setCurrentView('dashboard')} 
        />
      )}
      
      {currentView === 'city' && (
        <SecureCityView studentName={studentName} studentLevel={studentLevel} onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'flashcards' && (
        <FlashcardsView onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'assessment' && (
        <AssessmentView 
          studentName={studentName}
          onBack={() => setCurrentView('dashboard')} 
          onUpdateLevel={handleUpdateLevel}
        />
      )}

      {currentView === 'crypto' && (
        <CryptoPuzzleView onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'courses' && (
        <CoursesView onBack={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'admin' && (
        <AdminView onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}
