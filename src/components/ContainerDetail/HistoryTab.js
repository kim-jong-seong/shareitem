import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

function HistoryTab(props) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setLoading(false);
    } catch (err) {
      setError('히스토리를 불러오는데 실패했습니다');
      setLoading(false);
      console.error(err);
    }
  }, [props.houseId, props.containerId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatLogMessage = (log) => {
    switch(log.act_cd) {
      case 'COM1300001': // 반입
        return {
          icon: '📝',
          action: '반입',
          detail: [
            `생성: ${log.log_remk || ''}`,
            log.to_container_name && `위치: ${log.to_container_name}`
          ].filter(Boolean).join('\n')
        };
      
      case 'COM1300002': // 반출
        return {
          icon: '📤',
          action: '반출',
          detail: log.log_remk || '삭제됨'
        };
      
      case 'COM1300003': // 이동
        return {
          icon: '🔄',
          action: '이동',
          detail: `${log.from_container_name || '최상위'} → ${log.to_container_name || '최상위'}`
        };
      
      case 'COM1300004': // 수정
        return {
          icon: '✏️',
          action: '수정',
          detail: log.log_remk || '정보 수정'
        };
      
      case 'COM1300005': // 수량변경
        return {
          icon: '🔢',
          action: '수량변경',
          detail: `${log.from_quantity || 0}개 → ${log.to_quantity || 0}개`
        };
      
      case 'COM1300006': // 소유자변경
        return {
          icon: '👤',
          action: '소유자변경',
          detail: `${log.from_owner_name || '없음'} → ${log.to_owner_name || '없음'}`
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
      {logs.map((log) => {
        const formatted = formatLogMessage(log);
        return (
          <div key={log.id} className="history-item">
            <div className="history-header">
              <div className="history-action">
                <span className="history-icon">{formatted.icon}</span>
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