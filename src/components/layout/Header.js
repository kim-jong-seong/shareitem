import React, { useState } from 'react';
import '../../styles/ProfileCard.css';
import boxIcon from '../../assets/icons/box.svg';
import logoutIcon from '../../assets/icons/logout.svg';

/************************************************************
 * DESCRIPTION: Header 컴포넌트
 *              앱 상단의 헤더 영역을 담당하며 로고, 네비게이션,
 *              프로필 드롭다운을 제공하는 컴포넌트
 *
 * PROPS:
 * - user: 현재 로그인한 사용자 정보
 * - onLogout: 로그아웃 처리 함수
 * - onCreateHouse: 새 집 만들기 함수 (대시보드에서만 사용)
 * - isDetailView: 상세 화면 여부 (기본값: false)
 * - detailViewProps: 상세 화면에서 사용할 props 객체
 *                    (목록/상위 버튼, 추가/검색/새로고침/임시보관함 버튼 등)
 ************************************************************/
function Header({
  user,
  onLogout,
  onCreateHouse,
  isDetailView = false,
  detailViewProps = null
}) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [dropdownOpen, setDropdownOpen] = useState(false); // 프로필 드롭다운 열림/닫힘 상태

    /************************************************************
     * DESCRIPTION: 사용자 이름의 첫 글자를 추출하는 함수
     *              프로필 아이콘에 표시하기 위함
     ************************************************************/
    const getUserInitial = () => {
        if (user && user.name) {
            return user.name.charAt(0).toUpperCase(); // 첫 글자를 대문자로 변환
        }
        return '?'; // 사용자 정보가 없으면 물음표 표시
    };

    /************************************************************
     * DESCRIPTION: 로그아웃 처리 함수
     *              사용자 확인 후 로그아웃 실행
     ************************************************************/
    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            onLogout(); // 부모 컴포넌트의 로그아웃 함수 호출
        }
        setDropdownOpen(false); // 드롭다운 닫기
    };

    /************************************************************
     * DESCRIPTION: 드롭다운 토글 함수
     *              프로필 버튼 클릭 시 드롭다운 열기/닫기
     ************************************************************/
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    /************************************************************
     * DESCRIPTION: 외부 클릭 감지 및 드롭다운 닫기
     *              드롭다운 외부를 클릭하면 자동으로 닫힘
     ************************************************************/
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            /* 드롭다운 외부 클릭 시 닫기 */
            if (dropdownOpen && !event.target.closest('.profile-dropdown')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside); // 이벤트 리스너 등록
        return () => document.removeEventListener('click', handleClickOutside); // 컴포넌트 언마운트 시 제거
    }, [dropdownOpen]); // dropdownOpen이 변경될 때마다 실행

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 헤더 UI 구조
     ************************************************************/
    return (
        <div className={`app-header ${isDetailView ? 'full-width' : ''}`}>
            <div className="app-header-inner">
                {/* 왼쪽 영역: 로고 + 네비게이션 버튼 */}
                <div className="header-left-section">
                    {/* 로고 */}
                    <div className="app-logo">
                        <img src={boxIcon} alt="box" className="logo-icon" />
                        <span className="logo-text">ShareItem</span>
                    </div>

                    {/* 상세 화면 전용 네비게이션 버튼 (목록, 상위) */}
                    {isDetailView && detailViewProps && (
                        <div className="detail-nav-buttons">
                            <button
                                className="nav-icon-btn"
                                onClick={detailViewProps.onBack}
                                title="목록"
                            >
                                <img src={detailViewProps.homeIcon} alt="목록" style={{ width: '20px', height: '20px' }} />
                            </button>
                            {detailViewProps.showUpButton && (
                                <button
                                    className="nav-icon-btn"
                                    onClick={detailViewProps.onUpClick}
                                    title="상위"
                                >
                                    <img src={detailViewProps.arrowBlueIcon} alt="상위" style={{ width: '20px', height: '20px' }} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* 오른쪽 영역: 액션 버튼 + 프로필 */}
                <div className="header-actions">
                    {/* 상세 화면 전용 도구 버튼 (추가, 검색, 새로고침, 임시보관함) */}
                    {isDetailView && detailViewProps && (
                        <>
                            <button
                                className="add-icon-btn"
                                onClick={detailViewProps.onAddClick}
                                title="추가"
                            >
                                +
                            </button>
                            <button
                                className="tool-icon-btn"
                                onClick={detailViewProps.onSearchClick}
                                title="검색"
                            >
                                <img src={detailViewProps.searchIcon} alt="검색" style={{ width: '20px', height: '20px' }} />
                            </button>
                            <button
                                className="tool-icon-btn"
                                onClick={detailViewProps.onRefreshClick}
                                title="새로고침"
                            >
                                <img src={detailViewProps.refreshIcon} alt="새로고침" style={{ width: '20px', height: '20px' }} />
                            </button>
                            {/* 임시보관함 개수가 있을 때만 표시 */}
                            {detailViewProps.tempStorageCount > 0 && (
                                <button
                                    className="temp-badge-btn"
                                    onClick={detailViewProps.onTempStorageClick}
                                    title="임시보관함"
                                >
                                    <img src={detailViewProps.boxTempIcon} alt="임시보관함" style={{ width: '16px', height: '16px' }} />
                                    <span className="temp-count">{detailViewProps.tempStorageCount}</span>
                                </button>
                            )}
                        </>
                    )}

                    {/* 대시보드 화면 전용: 새 집 만들기 버튼 */}
                    {!isDetailView && (
                        <button
                            className="create-house-btn"
                            onClick={onCreateHouse}
                            title="새 집 만들기"
                        >
                            <span className="btn-icon">+</span>
                            <span className="btn-text">새 집</span>
                        </button>
                    )}

                    {/* 프로필 드롭다운 */}
                    <div className="profile-dropdown">
                        <button
                            className={`profile-btn ${dropdownOpen ? 'active' : ''}`}
                            onClick={toggleDropdown}
                        >
                            {getUserInitial()}
                        </button>

                        {/* 드롭다운 메뉴 (열려있을 때만 표시) */}
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <div className="dropdown-user-name">{user ? user.name : '사용자'}</div>
                                    <div className="dropdown-user-email">{user ? user.email : 'guest@shareitem.com'}</div>
                                </div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <img src={logoutIcon} alt="로그아웃" className="dropdown-icon" />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
