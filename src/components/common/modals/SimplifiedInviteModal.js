import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import '../../../styles/Modal.css';

function SimplifiedInviteModal({ houseId, houseName, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }

    // 이메일 형식 간단 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/houses/${houseId}/invitations`,
        {
          invitee_email: email.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('초대를 보냈습니다');
      setEmail('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // 서버에서 보낸 에러 메시지 그대로 사용
      const errorMessage = err.response?.data?.error || '초대에 실패했습니다';
      setError(errorMessage);
      setLoading(false);
    }
  };

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
        <div className="modal-header">
          <h2>"{houseName}"에 초대하기</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="초대할 사람의 이메일을 입력하세요"
                disabled={loading}
                autoFocus
              />
              <p className="form-hint">
                등록된 이메일로만 초대할 수 있습니다
              </p>
            </div>
          </div>

          <div className="modal-footer">
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
              {loading ? '초대 중...' : '초대하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimplifiedInviteModal;