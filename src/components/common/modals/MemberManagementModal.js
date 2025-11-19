import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import SimplifiedInviteModal from './SimplifiedInviteModal';
import userIcon from '../../../assets/icons/user.svg';
import '../../../styles/MemberManagementModal.css';

/************************************************************
 * DESCRIPTION: MemberManagementModal 컴포넌트
 *              집의 구성원 목록을 조회하고 관리하는
 *              모달 컴포넌트 (추방, 초대 기능 포함)
 *
 * PROPS:
 * - houseId: 집 ID
 * - houseName: 집 이름 (모달 제목에 표시)
 * - onClose: 모달 닫기 함수
 * - onSuccess: 변경 사항 발생 시 호출되는 함수
 ************************************************************/
function MemberManagementModal({ houseId, houseName, onClose, onSuccess }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [members, setMembers] = useState([]); // 구성원 목록
    const [myRole, setMyRole] = useState(''); // 현재 사용자의 역할 (관리자/멤버)
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지
    const [showInviteModal, setShowInviteModal] = useState(false); // 초대 모달 표시 여부

    /* 모달 외부 클릭 시 드래그 방지를 위한 상태 */
    const [mouseDownTarget, setMouseDownTarget] = useState(null);
    const [mouseUpTarget, setMouseUpTarget] = useState(null);

    /************************************************************
     * DESCRIPTION: 구성원 목록 조회 함수
     *              서버에서 집의 구성원 목록과 내 역할을 가져옴
     *              useCallback으로 감싸서 함수 재생성을 방지
     ************************************************************/
    const fetchMembers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/houses/${houseId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMembers(response.data.members); // 구성원 목록 설정
            setMyRole(response.data.my_role); // 내 역할 설정
            setLoading(false);
        } catch (err) {
            setError('구성원 목록을 불러오는데 실패했습니다');
            setLoading(false);
            console.error(err);
        }
    }, [houseId]);

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 구성원 목록 조회
     ************************************************************/
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    /************************************************************
     * DESCRIPTION: 구성원 추방 처리 함수 (관리자 전용)
     *              관리자가 멤버를 집에서 추방함
     ************************************************************/
    const handleKick = async (userId, userName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`${userName}님을 정말 추방하시겠습니까?`)) {
            return;
        }

        try {
            /* 2. 서버에 추방 요청 */
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/houses/${houseId}/members/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            /* 3. 성공 처리 */
            // alert(`${userName}님을 추방했습니다`);
            fetchMembers(); // 목록 새로고침
            if (onSuccess) onSuccess(); // 부모 컴포넌트에 알림
        } catch (err) {
            alert('추방에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 초대 성공 시 호출되는 함수
     *              초대가 성공하면 부모 컴포넌트에 알림
     ************************************************************/
    const handleInviteSuccess = () => {
        if (onSuccess) onSuccess();
    };

    /************************************************************
     * DESCRIPTION: 로딩 중일 때 표시되는 UI
     ************************************************************/
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

    /* 현재 사용자가 관리자인지 확인 */
    const isAdmin = myRole === 'COM1100001';

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 구성원 관리 모달 UI
     ************************************************************/
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
                    {/* 모달 헤더 */}
                    <div className="modal-header">
                        <h2>{houseName} 구성원 관리</h2>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>

                    <div className="modal-body">
                        {/* 에러 메시지 표시 */}
                        {error && (
                            <div className="error-box">
                                {error}
                            </div>
                        )}

                        {/* 구성원 목록 */}
                        <div className="member-list">
                            {members.map((member) => (
                                <div key={member.user_id} className="member-card">
                                    {/* 구성원 아이콘 */}
                                    <div className="member-icon">
                                        <img src={userIcon} alt="user" style={{ width: '32px', height: '32px' }} />
                                    </div>

                                    {/* 구성원 정보 */}
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

                                    {/* 구성원 액션 버튼 (관리자만 표시) */}
                                    <div className="member-actions">
                                        {/* 관리자이고, 대상이 관리자가 아닐 때만 추방 버튼 표시 */}
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

                    {/* 모달 푸터 (초대하기 버튼) */}
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

            {/* 초대 모달 (중첩 모달) */}
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
