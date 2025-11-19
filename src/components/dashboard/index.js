import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import HouseManagement from './HouseManagement';
import InvitationList from './InvitationList';
import '../../styles/Dashboard.css';

/************************************************************
 * DESCRIPTION: Dashboard 컴포넌트
 *              메인 대시보드 화면으로 집 목록과 초대 내역을
 *              탭으로 전환하며 보여주는 컴포넌트
 *
 * PROPS:
 * - onViewHouse: 집 조회 시 호출되는 함수
 * - onCreateHouse: 집 만들기 함수를 상위 컴포넌트에 전달
 ************************************************************/
function Dashboard({ onViewHouse, onCreateHouse }) {

    /************************************************************
     * DESCRIPTION: State 선언부
     ************************************************************/
    const [activeTab, setActiveTab] = useState('houses'); // 현재 활성화된 탭 ('houses' 또는 'invitations')
    const [invitationCount, setInvitationCount] = useState(0); // 받은 초대 개수 (배지 표시용)
    const [triggerCreateHouse, setTriggerCreateHouse] = useState(false); // 집 만들기 트리거

    /************************************************************
     * DESCRIPTION: 컴포넌트 마운트 시 초대 개수 조회
     ************************************************************/
    useEffect(() => {
        fetchInvitationCount();
    }, []);

    /************************************************************
     * DESCRIPTION: 받은 초대 개수 조회 함수
     *              초대 탭의 배지에 표시할 숫자를 가져옴
     ************************************************************/
    const fetchInvitationCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/invitations/received`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitationCount(response.data.invitations.length);
        } catch (err) {
            console.error('초대 개수 조회 실패:', err);
        }
    };

    /************************************************************
     * DESCRIPTION: 초대 상태 변경 시 호출되는 함수
     *              초대를 수락/거절하면 개수를 다시 조회함
     ************************************************************/
    const handleInvitationUpdate = () => {
        fetchInvitationCount();
    };

    /************************************************************
     * DESCRIPTION: 집 만들기 트리거 함수
     *              헤더의 "새 집" 버튼 클릭 시 호출됨
     ************************************************************/
    const handleCreateHouse = React.useCallback(() => {
        setTriggerCreateHouse(prev => !prev); // 값을 토글하여 HouseManagement에 전달
    }, []);

    /************************************************************
     * DESCRIPTION: 집 만들기 함수를 상위 컴포넌트에 전달
     *              App 컴포넌트가 헤더의 버튼을 클릭했을 때
     *              이 함수를 호출할 수 있도록 함
     ************************************************************/
    useEffect(() => {
        if (onCreateHouse) {
            onCreateHouse(handleCreateHouse);
        }
    }, [onCreateHouse, handleCreateHouse]);

    /************************************************************
     * DESCRIPTION: JSX 렌더링 - 탭 UI 및 콘텐츠
     ************************************************************/
    return (
        <div className="dashboard-container">
            {/* 탭 버튼 영역 */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'houses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('houses')}
                >
                    집 목록
                </button>
                <button
                    className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invitations')}
                >
                    초대 내역
                    {/* 받은 초대가 있으면 배지 표시 */}
                    {invitationCount > 0 && (
                        <span className="tab-badge">{invitationCount}</span>
                    )}
                </button>
            </div>

            {/* 탭 콘텐츠 영역 */}
            <div className="tab-content">
                {/* 집 목록 탭 */}
                {activeTab === 'houses' && (
                    <HouseManagement
                        onViewHouse={onViewHouse}
                        triggerCreate={triggerCreateHouse} // 집 만들기 트리거 전달
                    />
                )}
                {/* 초대 내역 탭 */}
                {activeTab === 'invitations' && (
                    <InvitationList onInvitationUpdate={handleInvitationUpdate} />
                )}
            </div>
        </div>
    );
}

export default Dashboard;
