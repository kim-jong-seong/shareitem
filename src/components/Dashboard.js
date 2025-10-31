import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/Dashboard.css';

function Dashboard(props) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');

  // 집 목록 조회
  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/houses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHouses(response.data.houses);
      setLoading(false);
    } catch (err) {
      setError('집 목록을 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  };

  // 집 생성
  const handleCreateHouse = async (e) => {
    e.preventDefault();
    
    if (!newHouseName.trim()) {
      alert('집 이름을 입력해주세요');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/houses`,
        { name: newHouseName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('집이 생성되었습니다');
      setNewHouseName('');
      setShowCreateModal(false);
      fetchHouses(); // 목록 새로고침
    } catch (err) {
      alert('집 생성에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  // 집 삭제
  const handleDeleteHouse = async (houseId, houseName) => {
    if (!window.confirm(`"${houseName}"을(를) 정말 삭제하시겠습니까?\n\n관련된 모든 데이터가 삭제됩니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/houses/${houseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('집이 삭제되었습니다');
      fetchHouses(); // 목록 새로고침
    } catch (err) {
      alert('집 삭제에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  // 집 조회 (상세 페이지로 이동 등)
  const handleViewHouse = (houseId, houseName) => {
    // TODO: 집 상세 페이지로 이동하거나 상세 정보 표시
    alert(`"${houseName}" 조회 기능은 추후 구현 예정입니다`);
    console.log('View house:', houseId);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      props.onLogout();
    }
  };

  // 사용자 이름의 첫 글자 추출
  const getUserInitial = () => {
    if (props.user && props.user.name) {
      return props.user.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-box">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 고정 핀 공지사항 */}
      <div className="info-box">
        <span className="pin-icon">📌</span>
        <p>Share Item에서 물품을 관리해보세요</p>
      </div>

      {/* 프로필 카드 (로그인 정보) */}
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">{getUserInitial()}</div>
          <div className="profile-text">
            <h3>{props.user ? `${props.user.name}님` : '사용자님'}</h3>
            <p>{props.user ? props.user.email : 'guest@shareitem.com'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* 헤더 */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>집 관리</h2>
          <p>내가 속한 집 목록을 관리합니다</p>
        </div>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + 새 집 등록
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* 집 목록 테이블 */}
      <div className="table-container">
        <table className="house-table">
          <thead>
            <tr>
              <th>집 이름</th>
              <th>나의 역할</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {houses.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-cell">
                  등록된 집이 없습니다. 새 집을 등록해주세요.
                </td>
              </tr>
            ) : (
              houses.map((house) => (
                <tr key={house.id}>
                  <td>
                    <strong>{house.name}</strong>
                  </td>
                  <td>
                    <span className={house.role_cd === 'COM1100001' ? 'badge admin-badge' : 'badge member-badge'}>
                      {house.role_nm}
                    </span>
                  </td>
                  <td>
                    <div className="button-group">
                      <button 
                        className="view-button"
                        onClick={() => handleViewHouse(house.id, house.name)}
                      >
                        조회
                      </button>
                      {house.role_cd === 'COM1100001' && (
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteHouse(house.id, house.name)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 집 생성 모달 */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">새 집 등록</h3>
            <form onSubmit={handleCreateHouse}>
              <div className="form-group">
                <label>집 이름</label>
                <input
                  type="text"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="예: 우리집, 부모님집"
                  autoFocus
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button type="submit" className="submit-button">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;