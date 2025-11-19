import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import inviteIcon from '../../assets/icons/invite.svg';
import sendIcon from '../../assets/icons/send.svg';
import '../../styles/InvitationList.css';

/************************************************************
 * DESCRIPTION: InvitationList 컴포넌트
 *              집 초대 관리 기능을 제공하는 컴포넌트
 *              받은 초대와 보낸 초대를 조회하고 수락/거절/취소할 수 있음
 *
 * PROPS:
 * - onInvitationUpdate: 초대 상태 변경 시 호출되는 콜백 함수
 *                       (부모 컴포넌트에 알림용)
 ************************************************************/
function InvitationList({ onInvitationUpdate }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [receivedInvitations, setReceivedInvitations] = useState([]); // 받은 초대 목록
    const [sentInvitations, setSentInvitations] = useState([]); // 보낸 초대 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(''); // 에러 메시지

    /************************************************************
     * DESCRIPTION: 초대 목록 조회 함수
     *              받은 초대와 보낸 초대를 동시에 조회함
     ************************************************************/
    const fetchInvitations = useCallback(async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            /* 받은 초대와 보낸 초대를 병렬로 조회 (Promise.all 사용) */
            const [receivedResponse, sentResponse] = await Promise.all([
                axios.get(`${API_URL}/api/invitations/received`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/invitations/sent`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setReceivedInvitations(receivedResponse.data.invitations);
            setSentInvitations(sentResponse.data.invitations);
            setLoading(false);
        } catch (err) {
            setError('초대 목록을 불러오는데 실패했습니다');
            setLoading(false);
            console.error(err);
        }
    }, []);

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 초대 목록 조회
     ************************************************************/
    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    /************************************************************
     * DESCRIPTION: 초대 수락 처리 함수
     *              받은 초대를 수락하여 집 멤버로 등록됨
     ************************************************************/
    const handleAccept = async (invitationId, houseName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`"${houseName}"의 초대를 수락하시겠습니까?`)) {
            return;
        }

        try {
            /* 2. 서버에 수락 요청 */
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/api/invitations/${invitationId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 3. 목록 새로고침 및 부모 컴포넌트에 알림 */
            fetchInvitations();
            if (onInvitationUpdate) onInvitationUpdate();
        } catch (err) {
            alert('초대 수락에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 초대 거절 처리 함수
     *              받은 초대를 거절함
     ************************************************************/
    const handleReject = async (invitationId, houseName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`"${houseName}"의 초대를 거절하시겠습니까?`)) {
            return;
        }

        try {
            /* 2. 서버에 거절 요청 */
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/api/invitations/${invitationId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 3. 목록 새로고침 및 부모 컴포넌트에 알림 */
            fetchInvitations();
            if (onInvitationUpdate) onInvitationUpdate();
        } catch (err) {
            alert('초대 거절에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /************************************************************
     * DESCRIPTION: 초대 취소 처리 함수
     *              내가 보낸 초대를 취소함
     ************************************************************/
    const handleCancel = async (invitationId, inviteeName) => {
        /* 1. 사용자 확인 */
        if (!window.confirm(`${inviteeName}님에게 보낸 초대를 취소하시겠습니까?`)) {
            return;
        }

        try {
            /* 2. 서버에 취소 요청 */
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/api/invitations/${invitationId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            /* 3. 목록 새로고침 */
            fetchInvitations();
        } catch (err) {
            alert('초대 취소에 실패했습니다: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    /* 로딩 중일 때 */
    if (loading) {
        return <div className="loading-box">데이터를 불러오는 중...</div>;
    }

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 초대 목록 UI
     ************************************************************/
    return (
        <div className="invitation-container">
            {/* 에러 메시지 표시 */}
            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            {/* 받은 초대 섹션 */}
            <div className="invitation-section">
                <h3 className="section-title">
                    받은 초대
                    {receivedInvitations.length > 0 && (
                        <span className="section-count">({receivedInvitations.length})</span>
                    )}
                </h3>
                <div className="invitation-list">
                    {receivedInvitations.length === 0 ? (
                        <div className="empty-invitation">
                            <p>받은 초대가 없습니다</p>
                        </div>
                    ) : (
                        receivedInvitations.map((invitation) => (
                            <div key={invitation.id} className="invitation-card">
                                <div className="invitation-icon">
                                    <img src={inviteIcon} alt="받은초대" style={{ width: '32px', height: '32px' }} />
                                </div>
                                <div className="invitation-content">
                                    <p className="invitation-text">
                                        <strong>{invitation.inviter_name}</strong>님이{' '}
                                        <strong>"{invitation.house_name}"</strong>에 초대했습니다
                                    </p>
                                </div>
                                <div className="invitation-actions">
                                    <button
                                        className="accept-button"
                                        onClick={() => handleAccept(invitation.id, invitation.house_name)}
                                    >
                                        수락
                                    </button>
                                    <button
                                        className="reject-button"
                                        onClick={() => handleReject(invitation.id, invitation.house_name)}
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 보낸 초대 섹션 */}
            <div className="invitation-section">
                <h3 className="section-title">
                    보낸 초대
                    {sentInvitations.length > 0 && (
                        <span className="section-count">({sentInvitations.length})</span>
                    )}
                </h3>
                <div className="invitation-list">
                    {sentInvitations.length === 0 ? (
                        <div className="empty-invitation">
                            <p>보낸 초대가 없습니다</p>
                        </div>
                    ) : (
                        sentInvitations.map((invitation) => (
                            <div key={invitation.id} className="invitation-card">
                                <div className="invitation-icon">
                                    <img src={sendIcon} alt="보낸초대" style={{ width: '32px', height: '32px' }} />
                                </div>
                                <div className="invitation-content">
                                    <p className="invitation-text">
                                        <strong>{invitation.invitee_name}</strong>님을{' '}
                                        <strong>"{invitation.house_name}"</strong>에 초대했습니다
                                        <span className="invitation-email">({invitation.invitee_email})</span>
                                    </p>
                                </div>
                                <div className="invitation-actions">
                                    <button
                                        className="cancel-button-inv"
                                        onClick={() => handleCancel(invitation.id, invitation.invitee_name)}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default InvitationList;
