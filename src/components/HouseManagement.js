import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import CreateHouseModal from './CreateHouseModal';
import MemberManagementModal from './MemberManagementModal';
import usersIcon from '../assets/icons/users.svg';

function HouseManagement(props) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);

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

  // 집 삭제 (관리자)
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

  // 집 나가기 (멤버)
  const handleLeaveHouse = async (houseId, houseName) => {
    if (!window.confirm(`"${houseName}"에서 정말 나가시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/houses/${houseId}/leave`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('집에서 나갔습니다');
      fetchHouses(); // 목록 새로고침
    } catch (err) {
      alert('나가기에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  // 집 조회 (HouseDetailView로 이동)
  const handleViewHouse = (house) => {
    props.onViewHouse(house);
  };

  // 구성원 관리 모달 열기
  const handleManageMembers = (house) => {
    setSelectedHouse(house);
    setShowMemberModal(true);
  };

  // 로딩 중
  if (loading) {
    return <div className="loading-box">데이터를 불러오는 중...</div>;
  }

  return (
    <>
      {/* 헤더 */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>집 목록</h2>
          <p>내가 속한 집 목록을 관리합니다</p>
        </div>
        <div className="header-buttons">
          <button className="create-button" onClick={() => setShowCreateModal(true)}>
            + 새 집 등록
          </button>
        </div>
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
              <th>관리자</th>
              <th>나의 역할</th>
              <th>구성원</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {houses.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
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
                    {house.admin_name || '-'}
                  </td>
                  <td>
                    <span className={house.role_cd === 'COM1100001' ? 'badge admin-badge' : 'badge member-badge'}>
                      {house.role_nm}
                    </span>
                  </td>
                  <td
                    className="member-count-cell clickable"
                    onClick={() => handleManageMembers(house)}
                    title="클릭하여 구성원 관리"
                  >
                    <span className="member-count-badge">
                      <img src={usersIcon} alt="구성원" style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
                      {house.member_count || 0}명
                    </span>
                  </td>
                  <td>
                    <div className="button-group">
                      <button 
                        className="view-button"
                        onClick={() => handleViewHouse(house)}
                      >
                        조회
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => 
                          house.role_cd === 'COM1100001' 
                            ? handleDeleteHouse(house.id, house.name)
                            : handleLeaveHouse(house.id, house.name)
                        }
                      >
                        삭제
                      </button>
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
        <CreateHouseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchHouses}
        />
      )}

      {/* 구성원 관리 모달 */}
      {showMemberModal && selectedHouse && (
        <MemberManagementModal
          houseId={selectedHouse.id}
          houseName={selectedHouse.name}
          onClose={() => {
            setShowMemberModal(false);
            setSelectedHouse(null);
          }}
          onSuccess={fetchHouses}
        />
      )}
    </>
  );
}

export default HouseManagement;