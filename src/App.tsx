/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { MillionaireView } from './components/MillionaireView';
import { SecureCityView } from './components/SecureCityView';
import { FlashcardsView } from './components/FlashcardsView';
import { AssessmentView } from './components/AssessmentView';
import { CryptoPuzzleView } from './components/CryptoPuzzleView';
import { CoursesView } from './components/CoursesView';

type ViewState = 'auth' | 'dashboard' | 'city' | 'millionaire' | 'flashcards' | 'assessment' | 'crypto' | 'courses';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('auth');
  const [studentName, setStudentName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');

  const handleLogin = (name: string, level: string) => {
    setStudentName(name);
    setStudentLevel(level);
    setCurrentView('dashboard');
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
          onSelectGame={(game) => setCurrentView(game)} 
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
        <FlashcardsView 
          onBack={() => setCurrentView('dashboard')} 
        />
      )}

      {currentView === 'assessment' && (
        <AssessmentView 
          studentName={studentName}
          onBack={() => setCurrentView('dashboard')} 
          onUpdateLevel={(level) => {
            setStudentLevel(level);
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView === 'crypto' && (
        <CryptoPuzzleView 
          onBack={() => setCurrentView('dashboard')} 
        />
      )}

      {currentView === 'courses' && (
        <CoursesView 
          onBack={() => setCurrentView('dashboard')} 
        />
      )}
    </div>
  );
}
