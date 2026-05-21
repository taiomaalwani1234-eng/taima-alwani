import React, { useState } from 'react';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { MillionaireView } from './components/MillionaireView';
import { SecureCityView } from './components/SecureCityView';
import { FlashcardsView } from './components/FlashcardsView';
import { AssessmentView } from './components/AssessmentView';
import { CryptoPuzzleView } from './components/CryptoPuzzleView';
import { CoursesView } from './components/CoursesView';
import { AdminView } from './components/AdminView';
import { saveProgress, updateLevel, getCurrentUser, saveUserLocally } from './services/backendApi';

type ViewState = 'auth' | 'dashboard' | 'city' | 'millionaire' | 'flashcards' | 'assessment' | 'crypto' | 'courses' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [studentName, setStudentName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [userId, setUserId] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>('user');
  const [tutorialMode, setTutorialMode] = useState<boolean>(false);
  const [avatarSeed, setAvatarSeed] = useState<string>('Aneka');

  // Restore session on mount
  React.useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setStudentName(user.nickname || user.username);
      setStudentLevel(user.level || 'متدرب');
      setUserId(user.id);
      setUserRole(user.role || 'user');
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (name: string, level: string, id: number) => {
    const user = getCurrentUser();
    setStudentName(name);
    setStudentLevel(level);
    setUserId(id);
    setUserRole(user?.role || 'user');
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

  const handleSelectGame = (game: ViewState, isTutorial: boolean = false) => {
    setTutorialMode(isTutorial);
    setCurrentView(game);
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
          avatarSeed={avatarSeed}
          onAvatarSelect={setAvatarSeed}
          onSelectGame={(game, tutorial) => handleSelectGame(game as ViewState, tutorial)} 
          userId={userId}
          userRole={userRole}
          onLogout={() => {
            localStorage.removeItem('taima_user');
            setUserId(0);
            setStudentName('');
            setStudentLevel('');
            setUserRole('user');
            setCurrentView('auth');
          }}
        />
      )}
      
      {currentView === 'millionaire' && (
        <MillionaireView 
          studentName={studentName} 
          onBack={() => setCurrentView('dashboard')} 
          isTutorial={tutorialMode}
        />
      )}
      
      {currentView === 'city' && (
        <SecureCityView 
          studentName={studentName} 
          studentLevel={studentLevel} 
          avatarSeed={avatarSeed}
          onAvatarSelect={setAvatarSeed}
          onBack={() => setCurrentView('dashboard')} 
          isTutorial={tutorialMode}
        />
      )}

      {currentView === 'flashcards' && (
        <FlashcardsView 
          onBack={() => setCurrentView('dashboard')} 
          isTutorial={tutorialMode}
        />
      )}

      {currentView === 'assessment' && (
        <AssessmentView 
          studentName={studentName}
          onBack={() => setCurrentView('dashboard')} 
          onUpdateLevel={handleUpdateLevel}
          isTutorial={tutorialMode}
        />
      )}

      {currentView === 'crypto' && (
        <CryptoPuzzleView 
          onBack={() => setCurrentView('dashboard')} 
          isTutorial={tutorialMode}
        />
      )}

      {currentView === 'courses' && (
        <CoursesView 
          onBack={() => setCurrentView('dashboard')} 
          isTutorial={tutorialMode}
        />
      )}

      {currentView === 'admin' && userRole === 'admin' && (
        <AdminView onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
}
