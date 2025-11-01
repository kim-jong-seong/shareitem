import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import InfoBox from './components/InfoBox'
import ProfileCard from './components/ProfileCard'

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 토큰 확인 (자동 로그인)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('dashboard');
      } catch (error) {
        // 저장된 데이터가 유효하지 않으면 초기화
        console.error('Invalid saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const onSwitchToSignup = (e) => 
  {
    setCurrentView('signup');
  };

  const onSwitchToLogin = (e) => 
  {
    setCurrentView('login');
  }

  const handleLoginSuccess = (userData) =>
  {
    setUser(userData);
    // user 정보도 localStorage에 저장
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('dashboard');
  }

  const onLogout = (e) =>
  {
    setUser(null);
    // 로그아웃 시 토큰과 user 정보 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  }

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#4a90e2',
        color: 'white',
        fontSize: '18px'
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div>
        {currentView === "login" && <Login onSwitchToSignup={onSwitchToSignup}
                                           onLoginSuccess={handleLoginSuccess} />}
        {currentView === "signup" && <Signup onSwitchToLogin={onSwitchToLogin} />}
        
        {/* 로그인 후 항상 표시되는 영역 */}
        {currentView === "dashboard" && (
          <div className="dashboard-wrapper">
            <InfoBox />
            <ProfileCard user={user} onLogout={onLogout} />
            <Dashboard />
          </div>
        )}
    </div>
  );
}

export default App;