import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import arrowGreenIcon from '../../assets/icons/arrow_green.svg';
import addIcon from '../../assets/icons/add.svg';
import editIcon from '../../assets/icons/edit.svg';

function HistoryTab(props) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentHouseName, setCurrentHouseName] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/houses/${props.houseId}/containers/${props.containerId}/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLogs(response.data.logs);
      setCurrentHouseName(response.data.current_house_name || '');
      setLoading(false);
    } catch (err) {
      setError('정보를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  }, [props.houseId, props.containerId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatLogMessage = (log) => {
    switch(log.act_cd) {
      case 'COM1300001': // 생성
        return {
          icon: addIcon,
          action: '생성',
          detail: log.log_remk || ''
        };
      
      case 'COM1300002': // 반출
        return {
          icon: '📤',
          action: '반출',
          detail: log.log_remk || '삭제됨'
        };
      
      case 'COM1300003': // 이동
        // 집 간 이동인지 확인 (from_house_id와 to_house_id가 다를 때만)
        const isCrossHouseMove = log.from_house_id && log.to_house_id &&
                                  log.from_house_id !== log.to_house_id;

        if (isCrossHouseMove) {
          // 다른 집으로 이동 - 집 이름 표시
          const fromLocation = log.from_container_name
            ? `[${log.from_house_name}] ${log.from_container_name}`
            : `[${log.from_house_name}]`;
          const toLocation = log.to_container_name
            ? `[${log.to_house_name}] ${log.to_container_name}`
            : `[${log.to_house_name}]`;

          return {
            icon: arrowGreenIcon,
            action: '이동',
            detail: `${fromLocation} → ${toLocation}`
          };
        }

        // 같은 집 내 이동 - 집 이름 표시 안 함
        return {
          icon: arrowGreenIcon,
          action: '이동',
          detail: `${log.from_container_name || currentHouseName} → ${log.to_container_name || currentHouseName}`
        };
      
      case 'COM1300004': // 수정 (통합)
        return {
          icon: editIcon,
          action: '수정',
          detail: log.log_remk || '정보 수정'
        };
      
      default:
        return {
          icon: '📋',
          action: log.act_nm || '알 수 없음',
          detail: log.log_remk || ''
        };
    }
  };

  const formatDate = (dateString) => {
    // 백엔드에서 "2025-11-06 23:15:26" 형식의 문자열로 받음 (시간대 정보 없음)
    // 그대로 Date 객체로 변환하면 로컬 시간으로 인식됨
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return <div className="history-loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="history-error">{error}</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="history-empty">
        <p>히스토리가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {logs.map((log, index) => {
        const formatted = formatLogMessage(log);
        return (
          <div key={log.id} className="history-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="history-header">
              <div className="history-action">
                <span className="history-icon">
                  {(typeof formatted.icon === 'string' && (formatted.icon.startsWith('/') || formatted.icon.includes('.svg'))) ? (
                    <img src={formatted.icon} alt={formatted.action} style={{ width: '20px', height: '20px' }} />
                  ) : (
                    formatted.icon
                  )}
                </span>
                <span className="history-action-name">{formatted.action}</span>
              </div>
              <div className="history-date">{formatDate(log.created_at)}</div>
            </div>
            {formatted.detail && (
              <div className="history-detail">{formatted.detail}</div>
            )}
            <div className="history-user">{log.creator_name}</div>
          </div>
        );
      })}
    </div>
  );
}

export default HistoryTab;