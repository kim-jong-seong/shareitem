/************************************************************
 * FILE: App.js
 * DESCRIPTION: React 애플리케이션 최상위 컴포넌트
 *              인증, 라우팅, 전역 상태 관리를 담당
 *              로그인/회원가입, 대시보드, 집 상세보기 화면 관리
 *
 * COMPONENTS:
 * - HouseDetailViewWrapper: 집 상세보기 Wrapper (Header와 HouseDetailView 통합)
 * - App: 메인 컴포넌트 (라우팅 및 인증 처리)
 ************************************************************/

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Dashboard from './components/dashboard'
import InfoBox from './components/dashboard/InfoBox'
import Header from './components/layout/Header'
import HouseDetailView from './components/houseDetail'
import searchIcon from './assets/icons/search.svg';
import refreshIcon from './assets/icons/refresh.svg';
import boxTempIcon from './assets/icons/box_temp.svg';
import arrowBlueIcon from './assets/icons/arrow_blue.svg';
import homeIcon from './assets/icons/home.svg';

/************************************************************
 * DESCRIPTION: HouseDetailView Wrapper 컴포넌트
 *              집 상세보기 화면의 Header와 HouseDetailView를 통합
 *              forwardRef로 노출된 HouseDetailView의 메서드를 Header에서 호출
 *
 * PROPS:
 * - user: 사용자 정보
 * - onLogout: 로그아웃 함수
 * - selectedHouse: 선택된 집 정보
 * - onBack: 대시보드로 돌아가기 함수
 *
 * WHY:
 * - HouseDetailView는 forwardRef로 메서드를 노출하는데,
 *   Header에서 이 메서드들을 호출해야 하므로 Wrapper가 필요
 * - ref를 통해 HouseDetailView의 currentPath, tempStorage에 접근하여
 *   Header에 상태 전달 (상위 버튼 표시 여부, 임시보관함 개수 등)
 ************************************************************/
function HouseDetailViewWrapper({ user, onLogout, selectedHouse, onBack }) {
  /* 1. HouseDetailView에 대한 ref (메서드 호출용) */
  const houseDetailViewRef = useRef(null);

  /* 2. HouseDetailView의 상태를 추적할 로컬 state */
  const [detailState, setDetailState] = useState({
    currentPath: [], // 현재 경로 (상위 버튼 표시 여부 판단)
    tempStorage: [] // 임시보관함 (개수 표시용)
  });

  /************************************************************
   * DESCRIPTION: HouseDetailView 상태 추적
   *              100ms마다 HouseDetailView의 상태를 폴링하여 업데이트
   *              Header에 currentPath와 tempStorage 정보 전달
   *
   * WHY:
   * - HouseDetailView의 상태 변경을 실시간으로 Header에 반영하기 위함
   * - forwardRef로 노출된 currentPath와 tempStorage를 주기적으로 조회
   ************************************************************/
  useEffect(() => {
    /* 100ms마다 상태 업데이트 */
    const interval = setInterval(() => {
      if (houseDetailViewRef.current) {
        setDetailState({
          currentPath: houseDetailViewRef.current.currentPath || [],
          tempStorage: houseDetailViewRef.current.tempStorage || []
        });
      }
    }, 100);

    /* cleanup: 컴포넌트 언마운트 시 interval 정리 */
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Header - 집 상세보기 모드 */}
      <Header
        user={user}
        onLogout={onLogout}
        isDetailView={true} // 상세보기 모드 활성화
        detailViewProps={{
          searchIcon,
          refreshIcon,
          boxTempIcon,
          arrowBlueIcon,
          homeIcon,
          onBack: onBack, // 대시보드로 돌아가기
          onUpClick: () => houseDetailViewRef.current?.handleUpClick(), // 상위로 이동
          showUpButton: detailState.currentPath.length > 0, // 경로가 있을 때만 상위 버튼 표시
          onAddClick: () => houseDetailViewRef.current?.handleAddClick(), // 추가
          onSearchClick: () => houseDetailViewRef.current?.handleSearchClick(), // 검색
          onRefreshClick: () => houseDetailViewRef.current?.handleRefreshClick(), // 새로고침
          onTempStorageClick: () => houseDetailViewRef.current?.handleTempStorageClick(), // 임시보관함
          tempStorageCount: detailState.tempStorage.length // 임시보관함 개수
        }}
      />

      {/* 집 상세보기 컴포넌트 */}
      <HouseDetailView
        ref={houseDetailViewRef}
        houseId={selectedHouse.id}
        houseName={selectedHouse.name}
        onBack={onBack}
      />
    </>
  );
}

/************************************************************
 * DESCRIPTION: App 메인 컴포넌트
 *              애플리케이션의 최상위 컴포넌트로서 다음을 담당:
 *              - 사용자 인증 상태 관리
 *              - 화면 라우팅 (login/signup/dashboard/houseDetail)
 *              - JWT 토큰 자동 로그인 및 만료 처리
 *
 * STATES:
 * - currentView: 현재 표시할 화면 ('login', 'signup', 'dashboard', 'houseDetail')
 * - user: 로그인된 사용자 정보 (null이면 로그인 전)
 * - isLoading: 초기 로딩 상태 (자동 로그인 체크 중)
 * - selectedHouse: 상세보기 중인 집 정보
 * - createHouseHandler: Dashboard에서 전달받은 집 생성 함수 참조
 ************************************************************/
function App() {
  /* 1. 화면 상태 관리 */
  const [currentView, setCurrentView] = useState('login'); // 현재 화면
  const [user, setUser] = useState(null); // 사용자 정보
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  /* 2. 집 관련 상태 */
  const [selectedHouse, setSelectedHouse] = useState(null); // 선택된 집 정보
  const [createHouseHandler, setCreateHouseHandler] = useState(null); // 집 생성 핸들러

  /************************************************************
   * DESCRIPTION: JWT 토큰 만료 처리를 위한 axios 인터셉터
   *              모든 API 응답을 가로채서 401 에러 시 자동 로그아웃
   *
   * FLOW:
   * 1. axios 응답 인터셉터 등록
   * 2. 401 에러 발생 시 (토큰 만료 or 인증 실패)
   * 3. localStorage에서 토큰과 사용자 정보 삭제
   * 4. 상태 초기화 및 로그인 화면으로 이동
   * 5. 사용자에게 세션 만료 알림
   *
   * WHY:
   * - JWT 토큰이 만료되면 서버가 401 응답을 반환
   * - 자동으로 로그아웃 처리하여 UX 개선
   * - 매번 수동으로 체크할 필요 없음
   ************************************************************/
  useEffect(() => {
    /* 1. axios 응답 인터셉터 등록 */
    const interceptor = axios.interceptors.response.use(
      (response) => response, // 정상 응답은 그대로 반환
      (error) => {
        /* 2. 401 에러 체크 (토큰 만료 or 인증 실패) */
        if (error.response?.status === 401) {
          /* 3. 로그아웃 처리 */
          localStorage.removeItem('token'); // 토큰 삭제
          localStorage.removeItem('user'); // 사용자 정보 삭제
          setUser(null); // 상태 초기화
          setCurrentView('login'); // 로그인 화면으로 이동
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        return Promise.reject(error); // 에러는 그대로 전파
      }
    );

    /* 4. cleanup: 컴포넌트 언마운트 시 인터셉터 제거 */
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  /************************************************************
   * DESCRIPTION: 초기 로드 시 자동 로그인 처리
   *              localStorage에 저장된 토큰이 있으면 자동으로 로그인
   *
   * FLOW:
   * 1. localStorage에서 토큰과 사용자 정보 조회
   * 2. 둘 다 있으면 JSON 파싱 후 상태 복원
   * 3. 대시보드 화면으로 이동
   * 4. 데이터가 유효하지 않으면 초기화
   * 5. 로딩 상태 해제
   *
   * WHY:
   * - 새로고침 시에도 로그인 상태 유지
   * - UX 개선 (매번 로그인할 필요 없음)
   * - 토큰 검증은 서버에서 수행 (401 시 자동 로그아웃)
   ************************************************************/
  useEffect(() => {
    /* 1. localStorage에서 토큰과 사용자 정보 조회 */
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    /* 2. 둘 다 있으면 자동 로그인 시도 */
    if (token && savedUser) {
      try {
        /* 3. JSON 파싱 및 상태 복원 */
        const userData = JSON.parse(savedUser);
        setUser(userData); // 사용자 정보 복원
        setCurrentView('dashboard'); // 대시보드로 이동
      } catch (error) {
        /* 4. 저장된 데이터가 유효하지 않으면 초기화 */
        console.error('Invalid saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    /* 5. 로딩 상태 해제 (자동 로그인 체크 완료) */
    setIsLoading(false);
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  /************************************************************
   * DESCRIPTION: 회원가입 화면으로 전환
   *              Login 컴포넌트에서 "회원가입" 버튼 클릭 시 호출
   ************************************************************/
  const onSwitchToSignup = (e) =>
  {
    setCurrentView('signup');
  };

  /************************************************************
   * DESCRIPTION: 로그인 화면으로 전환
   *              Signup 컴포넌트에서 "로그인" 버튼 클릭 시 호출
   ************************************************************/
  const onSwitchToLogin = (e) =>
  {
    setCurrentView('login');
  }

  /************************************************************
   * DESCRIPTION: 로그인 성공 처리
   *              Login 컴포넌트에서 로그인 성공 시 호출
   *
   * PARAMS:
   * - userData: 로그인된 사용자 정보 (id, username, email 등)
   *
   * FLOW:
   * 1. 사용자 정보를 state에 저장
   * 2. localStorage에도 JSON 문자열로 저장 (자동 로그인용)
   * 3. 대시보드 화면으로 이동
   ************************************************************/
  const handleLoginSuccess = (userData) =>
  {
    setUser(userData); // 사용자 정보 저장
    localStorage.setItem('user', JSON.stringify(userData)); // localStorage에 저장
    setCurrentView('dashboard'); // 대시보드로 이동
  }

  /************************************************************
   * DESCRIPTION: 로그아웃 처리
   *              Header 컴포넌트에서 로그아웃 버튼 클릭 시 호출
   *
   * FLOW:
   * 1. 사용자 정보 초기화
   * 2. 선택된 집 정보 초기화
   * 3. localStorage에서 토큰과 사용자 정보 삭제
   * 4. 로그인 화면으로 이동
   ************************************************************/
  const onLogout = (e) =>
  {
    setUser(null); // 사용자 정보 초기화
    setSelectedHouse(null); // 선택된 집 초기화
    localStorage.removeItem('token'); // 토큰 삭제
    localStorage.removeItem('user'); // 사용자 정보 삭제
    setCurrentView('login'); // 로그인 화면으로
  }

  /************************************************************
   * DESCRIPTION: 집 상세보기 화면으로 이동
   *              Dashboard 컴포넌트에서 집 조회 버튼 클릭 시 호출
   *
   * PARAMS:
   * - house: 선택된 집 정보 (id, name 등)
   ************************************************************/
  const handleViewHouse = (house) => {
    setSelectedHouse(house); // 선택된 집 저장
    setCurrentView('houseDetail'); // 상세보기 화면으로
  }

  /************************************************************
   * DESCRIPTION: 대시보드(집 목록)로 돌아가기
   *              HouseDetailView에서 뒤로가기 버튼 클릭 시 호출
   ************************************************************/
  const handleBackToDashboard = () => {
    setSelectedHouse(null); // 선택된 집 초기화
    setCurrentView('dashboard'); // 대시보드로
  }

  /************************************************************
   * DESCRIPTION: 로딩 화면
   *              초기 로드 시 자동 로그인 체크 중일 때 표시
   ************************************************************/
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

  /************************************************************
   * DESCRIPTION: 메인 렌더링 - 조건부 렌더링으로 화면 전환
   *              currentView 상태에 따라 다른 화면을 표시
   *
   * SCREENS:
   * 1. login: 로그인 화면
   * 2. signup: 회원가입 화면
   * 3. dashboard: 대시보드 (집 목록) - Header + InfoBox + Dashboard
   * 4. houseDetail: 집 상세보기 - HouseDetailViewWrapper
   *
   * WHY:
   * - React Router를 사용하지 않고 상태 기반 라우팅
   * - 단순한 화면 전환에는 충분
   * - 별도 라우팅 라이브러리 설치 불필요
   ************************************************************/
  return (
    <div>
        {/* 1. 로그인 화면 */}
        {currentView === "login" && <Login onSwitchToSignup={onSwitchToSignup}
                                           onLoginSuccess={handleLoginSuccess} />}

        {/* 2. 회원가입 화면 */}
        {currentView === "signup" && <Signup onSwitchToLogin={onSwitchToLogin} />}

        {/* 3. 대시보드 (집 목록) */}
        {currentView === "dashboard" && (
          <>
            {/* Header - 사용자 정보, 로그아웃, 집 생성 버튼 */}
            <Header
              user={user}
              onLogout={onLogout}
              onCreateHouse={() => {
                /* Dashboard에서 전달받은 집 생성 함수 호출 */
                if (createHouseHandler) {
                  createHouseHandler();
                }
              }}
            />
            <div className="dashboard-wrapper">
              {/* 안내 정보 박스 */}
              <InfoBox />
              {/* 집 목록 */}
              <Dashboard
                onViewHouse={handleViewHouse} // 집 조회 버튼 클릭 시
                onCreateHouse={(handler) => setCreateHouseHandler(() => handler)} // 집 생성 함수 등록
              />
            </div>
          </>
        )}

        {/* 4. 집 상세 조회 */}
        {currentView === "houseDetail" && selectedHouse && (
          <HouseDetailViewWrapper
            user={user}
            onLogout={onLogout}
            selectedHouse={selectedHouse}
            onBack={handleBackToDashboard}
          />
        )}
    </div>
  );
}

export default App;