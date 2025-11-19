import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import '../../../styles/Modal.css';

/************************************************************
 * DESCRIPTION: EditContainerModal 컴포넌트
 *              기존 컨테이너(영역/박스/물품)를 수정하는
 *              모달 컴포넌트
 *
 * PROPS:
 * - houseId: 집 ID
 * - container: 수정할 컨테이너 객체 (기존 데이터)
 * - onClose: 모달 닫기 함수
 * - onSuccess: 수정 성공 시 호출되는 함수
 ************************************************************/
function EditContainerModal(props) {

    /************************************************************
     * DESCRIPTION: State 선언부
     *              기존 컨테이너 데이터로 초기화
     ************************************************************/
    const [name, setName] = useState(props.container.name); // 컨테이너 이름
    const [quantity, setQuantity] = useState(props.container.quantity || 1); // 물품 수량
    const [ownerId, setOwnerId] = useState(props.container.owner_user_id || ''); // 물품 소유자 ID
    const [memo, setMemo] = useState(props.container.remk || ''); // 물품 메모
    const [members, setMembers] = useState([]); // 집 구성원 목록
    const [loading, setLoading] = useState(false); // 수정 중 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /* 현재 컨테이너가 물품인지 여부 확인 */
    const isItem = props.container.type_cd === 'COM1200003';

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 구성원 목록 조회 (물품일 때만)
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

        /* 물품일 때만 구성원 목록을 조회함 */
        if (isItem) {
            fetchMembers();
        }
    }, [props.houseId, isItem]);

    /************************************************************
     * DESCRIPTION: 컨테이너 수정 처리 함수
     *              서버에 수정된 데이터를 전송함
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

            /* 3. 요청 데이터 구성 (기본 필드) */
            const data = {
                name: name.trim()
            };

            /* 물품일 때만 추가 필드 포함 */
            if (isItem) {
                data.quantity = parseInt(quantity);
                data.owner_user_id = ownerId || null; // 빈 값이면 null로 (공용)
                data.remk = memo.trim() || null; // 빈 값이면 null로
            }

            /* 4. 서버에 수정 요청 (PATCH) */
            await axios.patch(
                `${API_URL}/api/houses/${props.houseId}/containers/${props.container.id}`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 5. 성공 처리 */
            props.onSuccess(); // 부모 컴포넌트에 알림 (목록 새로고침 및 모달 닫기)
        } catch (err) {
            setError(err.response?.data?.error || '수정에 실패했습니다');
            setLoading(false);
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 컨테이너 수정 모달 UI
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
                    <h3>항목 수정</h3>
                    <button className="modal-close" onClick={props.onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
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
                            {loading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditContainerModal;
