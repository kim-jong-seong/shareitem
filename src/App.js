import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import InfoBox from './components/InfoBox'
import ProfileCard from './components/ProfileCard'
import HouseDetailView from './components/HouseDetailView'

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState(null); // 선택된 집 정보

  // JWT 토큰 만료 처리를 위한 axios 인터셉터
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // 401 에러 = 토큰 만료 or 인증 실패
        if (error.response?.status === 401) {
          // 로그아웃 처리
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setCurrentView('login');
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        return Promise.reject(error);
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

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
    setSelectedHouse(null);
    // 로그아웃 시 토큰과 user 정보 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  }

  // 집 조회 버튼 클릭
  const handleViewHouse = (house) => {
    setSelectedHouse(house);
    setCurrentView('houseDetail');
  }

  // 집 목록으로 돌아가기
  const handleBackToDashboard = () => {
    setSelectedHouse(null);
    setCurrentView('dashboard');
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
        
        {/* 대시보드 (집 목록) */}
        {currentView === "dashboard" && (
          <div className="dashboard-wrapper">
            <ProfileCard user={user} onLogout={onLogout} />
            <InfoBox />
            <Dashboard onViewHouse={handleViewHouse} />
          </div>
        )}

        {/* 집 상세 조회 */}
        {currentView === "houseDetail" && selectedHouse && (
          <HouseDetailView 
            houseId={selectedHouse.id}
            houseName={selectedHouse.name}
            onBack={handleBackToDashboard}
          />
        )}
    </div>
  );
}

export default App;