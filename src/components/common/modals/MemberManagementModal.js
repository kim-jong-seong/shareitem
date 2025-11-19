import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import SimplifiedInviteModal from './SimplifiedInviteModal';
import userIcon from '../../../assets/icons/user.svg';
import '../../../styles/MemberManagementModal.css';

function MemberManagementModal({ houseId, houseName, onClose, onSuccess }) {
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/houses/${houseId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMembers(response.data.members);
      setMyRole(response.data.my_role);
      setLoading(false);
    } catch (err) {
      setError('구성원 목록을 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  }, [houseId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleKick = async (userId, userName) => {
    if (!window.confirm(`${userName}님을 정말 추방하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/houses/${houseId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // alert(`${userName}님을 추방했습니다`);
      fetchMembers(); // 목록 새로고침
      if (onSuccess) onSuccess();
    } catch (err) {
      alert('추방에 실패했습니다: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleInviteSuccess = () => {
    // 초대 성공 시 처리 (필요시)
    if (onSuccess) onSuccess();
  };

  if (loading) {
    return (
      <div 
        className="modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setMouseDownTarget(e.currentTarget);
          } else {
            setMouseDownTarget(null);
          }
        }}
        onMouseUp={(e) => {
          if (e.target === e.currentTarget) {
            setMouseUpTarget(e.currentTarget);
          } else {
            setMouseUpTarget(null);
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && 
              mouseDownTarget === e.currentTarget && 
              mouseUpTarget === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-box">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const isAdmin = myRole === 'COM1100001';

  return (
    <>
      <div 
        className="modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setMouseDownTarget(e.currentTarget);
          } else {
            setMouseDownTarget(null);
          }
        }}
        onMouseUp={(e) => {
          if (e.target === e.currentTarget) {
            setMouseUpTarget(e.currentTarget);
          } else {
            setMouseUpTarget(null);
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && 
              mouseDownTarget === e.currentTarget && 
              mouseUpTarget === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="modal-content member-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{houseName} 구성원 관리</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <div className="member-list">
              {members.map((member) => (
                <div key={member.user_id} className="member-card">
                  <div className="member-icon">
                    <img src={userIcon} alt="user" style={{ width: '32px', height: '32px' }} />
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {member.user_name}
                      <span className={`role-badge ${member.role_cd === 'COM1100001' ? 'admin' : 'member'}`}>
                        {member.role_nm}
                      </span>
                    </div>
                    <div className="member-email">{member.email}</div>
                    <div className="member-joined">
                      가입일: {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="member-actions">
                    {isAdmin && member.role_cd !== 'COM1100001' && (
                      <button 
                        className="kick-button"
                        onClick={() => handleKick(member.user_id, member.user_name)}
                      >
                        추방
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="invite-button-modal"
              onClick={() => setShowInviteModal(true)}
            >
              + 초대하기
            </button>
          </div>
        </div>
      </div>

      {/* 초대 모달 */}
      {showInviteModal && (
        <SimplifiedInviteModal
          houseId={houseId}
          houseName={houseName}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </>
  );
}

export default MemberManagementModal;