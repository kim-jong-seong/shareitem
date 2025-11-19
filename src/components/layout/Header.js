import React, { useState } from 'react';
import '../../styles/ProfileCard.css';
import boxIcon from '../../assets/icons/box.svg';
import logoutIcon from '../../assets/icons/logout.svg';

function ProfileCard({
  user,
  onLogout,
  onCreateHouse,
  isDetailView = false,
  detailViewProps = null
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      onLogout();
    }
    setDropdownOpen(false);
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className={`app-header ${isDetailView ? 'full-width' : ''}`}>
      <div className="app-header-inner">
        {/* 왼쪽 영역 */}
        <div className="header-left-section">
          {/* 로고 */}
          <div className="app-logo">
            <img src={boxIcon} alt="box" className="logo-icon" />
            <span className="logo-text">ShareItem</span>
          </div>

          {/* 상세 화면 전용 네비게이션 버튼 */}
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

        {/* 오른쪽 액션 */}
        <div className="header-actions">
          {/* 상세 화면 전용 도구 버튼 */}
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

export default ProfileCard;