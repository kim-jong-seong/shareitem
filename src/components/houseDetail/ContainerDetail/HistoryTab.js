import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { formatLogMessage, formatDate } from '../../../utils/logUtils';

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
        const formatted = formatLogMessage(log, currentHouseName);
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