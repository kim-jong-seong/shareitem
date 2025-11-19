import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { areaIcon, boxIcon, tagIcon } from '../../../utils/iconUtils';
import '../../../styles/Modal.css';

function AddContainerModal(props) {
  
  const [type, setType] = useState('item'); // 'area', 'box', 'item'
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ownerId, setOwnerId] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [mouseDownTarget, setMouseDownTarget] = useState(null);
  const [mouseUpTarget, setMouseUpTarget] = useState(null);

  // 구성원 목록 조회
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
    
    fetchMembers();
  }, [props.houseId]);

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
      
      // 타입 코드 변환
      const typeCd = 
        type === 'area' ? 'COM1200001' :
        type === 'box' ? 'COM1200002' :
        'COM1200003'; // item

      const data = {
        parent_id: props.parentId,
        type_cd: typeCd,
        name: name.trim()
      };

      // 물품일 때만 추가 필드
      if (type === 'item') {
        data.quantity = parseInt(quantity);
        if (ownerId) {
          data.owner_user_id = ownerId;
        }
        if (memo.trim()) {
          data.remk = memo.trim();
        }
      }

      await axios.post(
        `${API_URL}/api/houses/${props.houseId}/containers`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      props.onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || '추가에 실패했습니다');
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
          <h3>항목 추가</h3>
          <button className="modal-close" onClick={props.onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 타입 선택 */}
            <div className="type-selector">
              <div
                className={`type-option ${type === 'area' ? 'active' : ''}`}
                onClick={() => setType('area')}
              >
                <div className="type-option-icon">
                  <img src={areaIcon} alt="area" style={{ width: '32px', height: '32px' }} />
                </div>
                <div className="type-option-label">영역</div>
              </div>
              <div
                className={`type-option ${type === 'box' ? 'active' : ''}`}
                onClick={() => setType('box')}
              >
                <div className="type-option-icon">
                  <img src={boxIcon} alt="box" style={{ width: '32px', height: '32px' }} />
                </div>
                <div className="type-option-label">박스</div>
              </div>
              <div
                className={`type-option ${type === 'item' ? 'active' : ''}`}
                onClick={() => setType('item')}
              >
                <div className="type-option-icon">
                  <img src={tagIcon} alt="item" style={{ width: '32px', height: '32px' }} />
                </div>
                <div className="type-option-label">물품</div>
              </div>
            </div>

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
            {type === 'item' && (
              <>
                <div className="form-group">
                  <label>수량</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
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
              {loading ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddContainerModal;