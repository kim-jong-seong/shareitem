import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import HouseManagement from './HouseManagement';
import InvitationList from './InvitationList';
import '../styles/Dashboard.css';

function Dashboard(props) {
  const [activeTab, setActiveTab] = useState('houses'); // 'houses' | 'invitations'
  const [invitationCount, setInvitationCount] = useState(0);
  const [triggerCreateHouse, setTriggerCreateHouse] = useState(false);

  // 초대 개수 조회
  useEffect(() => {
    fetchInvitationCount();
  }, []);

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

  // 초대 상태 변경 시 호출
  const handleInvitationUpdate = () => {
    fetchInvitationCount();
  };

  // 집 만들기 트리거
  const handleCreateHouse = () => {
    setTriggerCreateHouse(prev => !prev); // 토글해서 HouseManagement에 전달
  };

  // onCreateHouse prop을 상위로 전달
  useEffect(() => {
    if (props.onCreateHouse) {
      props.onCreateHouse(handleCreateHouse);
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* 탭 */}
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
          {invitationCount > 0 && (
            <span className="tab-badge">{invitationCount}</span>
          )}
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">
        {activeTab === 'houses' && (
          <HouseManagement
            onViewHouse={props.onViewHouse}
            triggerCreate={triggerCreateHouse}
          />
        )}
        {activeTab === 'invitations' && (
          <InvitationList onInvitationUpdate={handleInvitationUpdate} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;