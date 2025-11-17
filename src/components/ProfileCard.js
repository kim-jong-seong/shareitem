import React, { useState } from 'react';
import '../styles/ProfileCard.css';

function ProfileCard({ user, onLogout, onCreateHouse }) {
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
    <div className="app-header">
      {/* 로고 */}
      <div className="app-logo">
        <span className="logo-icon">📦</span>
        <span className="logo-text">ShareItem</span>
      </div>

      {/* 오른쪽 액션 */}
      <div className="header-actions">
        <button
          className="create-house-btn"
          onClick={onCreateHouse}
          title="새 집 만들기"
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">새 집</span>
        </button>

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
              <button className="dropdown-item" onClick={handleLogout}>
                <span>🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;