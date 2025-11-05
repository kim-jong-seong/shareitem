import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../styles/CreateHouseModal.css';

function CreateHouseModal({ onClose, onSuccess }) {
  const [houseName, setHouseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // mousedown과 mouseup 시점의 타겟을 각각 기억
  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!houseName.trim()) {
      setError('집 이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/houses`,
        { name: houseName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('집이 생성되었습니다');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || '집 생성에 실패했습니다');
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
      <div className="modal create-house-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">새 집 등록</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>집 이름</label>
            <input
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="예: 우리집, 부모님집"
              autoFocus
              required
            />
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
              {loading ? '생성 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateHouseModal;