import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import '../../../styles/Modal.css';

function EditContainerModal(props) {
  
  const [name, setName] = useState(props.container.name);
  const [quantity, setQuantity] = useState(props.container.quantity || 1);
  const [ownerId, setOwnerId] = useState(props.container.owner_user_id || '');
  const [memo, setMemo] = useState(props.container.remk || '');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  const isItem = props.container.type_cd === 'COM1200003';

  // 구성원 목록 조회 (물품일 때만)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/api/houses/${props.houseId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMembers(response.data.members);
      } catch (err) {
        console.error('구성원 조회 실패:', err);
      }
    };
    
    if (isItem) {
      fetchMembers();
    }
  }, [props.houseId, isItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const data = {
        name: name.trim()
      };

      // 물품일 때만 추가 필드
      if (isItem) {
        data.quantity = parseInt(quantity);
        data.owner_user_id = ownerId || null;
        data.remk = memo.trim() || null;
      }

      await axios.patch(
        `${API_URL}/api/houses/${props.houseId}/containers/${props.container.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      props.onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '수정에 실패했습니다');
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay form-modal"
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
          props.onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>항목 수정</h3>
          <button className="modal-close" onClick={props.onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 이름 */}
            <div className="form-group">
              <label>이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoFocus
                required
              />
            </div>

            {/* 물품 전용 필드 */}
            {isItem && (
              <>
                <div className="form-group">
                  <label>수량</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    placeholder="1"
                  />
                </div>

                <div className="form-group">
                  <label>소유자</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  >
                    <option value="">공용</option>
                    {members.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>메모</label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="메모를 입력하세요"
                    rows="3"
                  />
                </div>
              </>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="error-box">
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button"
              className="cancel-btn"
              onClick={props.onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditContainerModal;