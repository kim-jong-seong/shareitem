import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/InviteModal.css';

function InviteModal({ houses, onClose, onSuccess }) {
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHouseId) {
      setError('집을 선택해주세요');
      return;
    }
    
    if (!inviteeEmail.trim()) {
      setError('초대할 사용자의 이메일을 입력해주세요');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteeEmail)) {
      setError('올바른 이메일 형식이 아닙니다');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/houses/${selectedHouseId}/invitations`,
        { invitee_email: inviteeEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('초대를 보냈습니다');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || '초대 전송에 실패했습니다');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal invite-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">집원 초대</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>집 선택</label>
            <select
              value={selectedHouseId}
              onChange={(e) => setSelectedHouseId(e.target.value)}
              required
            >
              <option value="">집을 선택하세요</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>초대할 사용자 이메일</label>
            <input
              type="email"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
            <p className="input-hint">가입된 이메일 주소를 입력하세요</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? '전송 중...' : '초대 보내기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteModal;