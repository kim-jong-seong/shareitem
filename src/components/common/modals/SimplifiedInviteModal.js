import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import '../../../styles/Modal.css';

/************************************************************
 * DESCRIPTION: SimplifiedInviteModal 컴포넌트
 *              집에 다른 사용자를 초대하는 간단한 모달
 *              이메일 주소로 초대를 보냄
 *
 * PROPS:
 * - houseId: 집 ID
 * - houseName: 집 이름 (모달 제목에 표시)
 * - onClose: 모달 닫기 함수
 * - onSuccess: 초대 성공 시 호출되는 함수
 ************************************************************/
function SimplifiedInviteModal({ houseId, houseName, onClose, onSuccess }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [email, setEmail] = useState(''); // 초대할 이메일 주소
    const [loading, setLoading] = useState(false); // 초대 중 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 초대 제출 처리 함수
     *              이메일 유효성 검사 후 서버에 초대 요청
     ************************************************************/
    const handleSubmit = async (e) => {
        /* 1. 폼 제출 준비 */
        e.preventDefault();

        if (!email.trim()) {
            setError('이메일을 입력해주세요');
            return;
        }

        /* 2. 이메일 형식 검증 */
        // 간단한 정규식으로 이메일 형식 확인
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('올바른 이메일 형식이 아닙니다');
            return;
        }

        /* 3. 로딩 시작 */
        setLoading(true);
        setError('');

        try {
            /* 4. 서버에 초대 요청 */
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/houses/${houseId}/invitations`,
                {
                    invitee_email: email.trim() // 초대받을 사람의 이메일
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            /* 5. 성공 처리 */
            alert('초대를 보냈습니다');
            setEmail(''); // 입력창 초기화
            if (onSuccess) onSuccess(); // 부모 컴포넌트에 알림
            onClose(); // 모달 닫기
        } catch (err) {
            /* 서버에서 보낸 에러 메시지 그대로 표시 */
            // 예: "이미 초대를 보낸 사용자입니다", "등록되지 않은 이메일입니다" 등
            const errorMessage = err.response?.data?.error || '초대에 실패했습니다';
            setError(errorMessage);
            setLoading(false);
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 초대 모달 UI
     ************************************************************/
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
                {/* 모달 헤더 */}
                <div className="modal-header">
                    <h2>"{houseName}"에 초대하기</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* 에러 메시지 표시 */}
                        {error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )}

                        {/* 이메일 입력 */}
                        <div className="form-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="초대할 사람의 이메일을 입력하세요"
                                disabled={loading}
                                autoFocus // 모달 열릴 때 자동 포커스
                            />
                            <p className="form-hint">
                                등록된 이메일로만 초대할 수 있습니다
                            </p>
                        </div>
                    </div>

                    {/* 모달 푸터 (버튼 영역) */}
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
