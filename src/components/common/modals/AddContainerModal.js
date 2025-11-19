import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { areaIcon, boxIcon, tagIcon } from '../../../utils/iconUtils';
import '../../../styles/Modal.css';

/************************************************************
 * DESCRIPTION: AddContainerModal 컴포넌트
 *              새로운 컨테이너(영역/박스/물품)를 추가하는
 *              모달 컴포넌트
 *
 * PROPS:
 * - houseId: 집 ID
 * - parentId: 부모 컨테이너 ID (null이면 루트)
 * - onClose: 모달 닫기 함수
 * - onSuccess: 추가 성공 시 호출되는 함수
 ************************************************************/
function AddContainerModal(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [type, setType] = useState('item'); // 컨테이너 타입 ('area', 'box', 'item')
    const [name, setName] = useState(''); // 컨테이너 이름
    const [quantity, setQuantity] = useState(1); // 물품 수량
    const [ownerId, setOwnerId] = useState(''); // 물품 소유자 ID
    const [memo, setMemo] = useState(''); // 물품 메모
    const [members, setMembers] = useState([]); // 집 구성원 목록
    const [loading, setLoading] = useState(false); // 추가 중 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 구성원 목록 조회
     *              물품의 소유자를 선택할 수 있도록 함
     ************************************************************/
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

    /************************************************************
     * DESCRIPTION: 컨테이너 추가 처리 함수
     *              서버에 새로운 컨테이너 생성 요청을 보냄
     ************************************************************/
    const handleSubmit = async (e) => {
        /* 1. 폼 제출 준비 */
        e.preventDefault();

        if (!name.trim()) {
            setError('이름을 입력해주세요');
            return;
        }

        /* 2. 로딩 시작 */
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            /* 3. 타입 코드 변환 (area/box/item -> COM1200001/002/003) */
            const typeCd =
                type === 'area' ? 'COM1200001' :
                type === 'box' ? 'COM1200002' :
                'COM1200003'; // item

            /* 4. 요청 데이터 구성 */
            const data = {
                parent_id: props.parentId, // 부모 컨테이너 ID
                type_cd: typeCd,
                name: name.trim()
            };

            /* 물품일 때만 추가 필드 */
            if (type === 'item') {
                data.quantity = parseInt(quantity);
                if (ownerId) {
                    data.owner_user_id = ownerId;
                }
                if (memo.trim()) {
                    data.remk = memo.trim();
                }
            }

            /* 5. 서버에 추가 요청 */
            await axios.post(
                `${API_URL}/api/houses/${props.houseId}/containers`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 6. 성공 처리 */
            props.onSuccess(); // 부모 컴포넌트에 알림 (목록 새로고침 및 모달 닫기)
        } catch (err) {
            setError(err.response?.data?.error || '추가에 실패했습니다');
            setLoading(false);
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 컨테이너 추가 모달 UI
     ************************************************************/
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
                {/* 모달 헤더 */}
                <div className="modal-header">
                    <h3>항목 추가</h3>
                    <button className="modal-close" onClick={props.onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* 타입 선택 (영역/박스/물품) */}
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

                        {/* 이름 입력 */}
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

                        {/* 물품 전용 필드 (수량, 소유자, 메모) */}
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

                        {/* 에러 메시지 표시 */}
                        {error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* 모달 푸터 (버튼 영역) */}
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
