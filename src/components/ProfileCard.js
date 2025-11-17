import React from 'react';
import '../styles/ProfileCard.css';

function ProfileCard({ user, onLogout }) {
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
  };

  return (
    <div className="profile-card">
      <div className="profile-info">
        <div className="profile-avatar">{getUserInitial()}</div>
        <div className="profile-name">{user ? user.name : '사용자'}</div>
        <div className="profile-email">{user ? user.email : 'guest@shareitem.com'}</div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        로그아웃
      </button>
    </div>
  );
}

export default ProfileCard;