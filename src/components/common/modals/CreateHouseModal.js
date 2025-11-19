import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import '../../../styles/CreateHouseModal.css';

/************************************************************
 * DESCRIPTION: CreateHouseModal 컴포넌트
 *              새로운 집을 생성하는 모달 컴포넌트
 *
 * PROPS:
 * - onClose: 모달 닫기 함수
 * - onSuccess: 집 생성 성공 시 호출되는 함수
 ************************************************************/
function CreateHouseModal({ onClose, onSuccess }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [houseName, setHouseName] = useState(''); // 입력한 집 이름
    const [loading, setLoading] = useState(false); // 생성 중 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 집 생성 처리 함수
     *              서버에 새로운 집 생성 요청을 보냄
     ************************************************************/
    const handleSubmit = async (e) => {
        /* 1. 폼 제출 준비 */
        e.preventDefault(); // 페이지 새로고침 방지

        if (!houseName.trim()) {
            setError('집 이름을 입력해주세요');
            return;
        }

        /* 2. 로딩 시작 */
        setLoading(true);
        setError('');

        try {
            /* 3. 서버에 집 생성 요청 */
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/houses`,
                { name: houseName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 4. 성공 처리 */
            alert('집이 생성되었습니다');
            onSuccess(); // 부모 컴포넌트에 성공 알림 (목록 새로고침용)
            onClose(); // 모달 닫기
        } catch (err) {
            setError(err.response?.data?.error || '집 생성에 실패했습니다');
            setLoading(false);
        }
    };

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 집 생성 모달 UI
     ************************************************************/
    return (
        <div
            className="modal-overlay"
            onMouseDown={(e) => {
                /* 마우스 다운 시 타겟 기억 (드래그 방지용) */
                if (e.target === e.currentTarget) {
                    setMouseDownTarget(e.currentTarget);
                } else {
                    setMouseDownTarget(null);
                }
            }}
            onMouseUp={(e) => {
                /* 마우스 업 시 타겟 기억 (드래그 방지용) */
                if (e.target === e.currentTarget) {
                    setMouseUpTarget(e.currentTarget);
                } else {
                    setMouseUpTarget(null);
                }
            }}
            onClick={(e) => {
                /* 배경 클릭 시 모달 닫기 (드래그가 아닐 때만) */
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
                    {/* 집 이름 입력창 */}
                    <div className="form-group">
                        <label>집 이름</label>
                        <input
                            type="text"
                            value={houseName}
                            onChange={(e) => setHouseName(e.target.value)}
                            placeholder="예: 우리집, 부모님집"
                            autoFocus // 모달 열릴 때 자동 포커스
                            required
                        />
                    </div>

                    {/* 에러 메시지 표시 */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* 버튼 영역 */}
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
